"""
Rubric parser service.
Sends question paper + marking scheme to Gemini, gets structured JSON back.
"""

import json
from app.core.logging import get_logger
from app.services.gemini_client import GeminiClient, GeminiJSONParseError
from app.services.pdf_processor import PDFProcessor
from app.services.storage import StorageService
from app.core.config import settings
from app.workers.rate_limiter import rate_limiter

logger = get_logger(__name__)

RUBRIC_PARSE_PROMPT = """You are an expert exam paper analyzer. You will receive the text of a question paper and its official marking scheme. Your task is to produce a structured JSON representation of every question in the paper.

QUESTION PAPER TEXT:
{question_paper_text}

OFFICIAL MARKING SCHEME TEXT:
{marking_scheme_text}

SPECIAL GUIDELINES FROM EXAMINER:
{guidelines}

Produce a JSON array where each element represents one question (or sub-question). Each element must have:
- "q_no": string — question number exactly as written (e.g. "1", "2a", "Q3(i)")
- "question_text": string — the full question text
- "question_type": one of ["mcq", "short_answer", "long_answer", "numerical", "diagram", "fill_blank"]
- "max_marks": number — marks allocated to this question
- "expected_answer": string — the expected answer or key points from the marking scheme
- "marking_notes": string — any specific instructions like "award marks for any valid method" or "no marks for method, only answer"
- "diagram_checklist": array of strings — ONLY for diagram questions. List every specific element the student must draw/label to get marks. Example: ["nucleus labeled", "cell wall shown", "chloroplast labeled with correct position"]. For non-diagram questions, set this to null.
- "keyword_list": array of strings — for long answer/short answer questions, list key terms the student must mention for full marks. For other types, set to null.

Return ONLY the JSON array. No preamble, no explanation, no markdown code fences."""


class RubricParser:
    """Parses question paper + marking scheme into a structured rubric using Gemini."""

    def __init__(self):
        self.gemini = GeminiClient()
        self.pdf_processor = PDFProcessor()
        self.storage = StorageService()

    def parse_rubric_sync(self, rubric_id: str) -> None:
        """
        Synchronous entry point (called from Celery).
        Fetches rubric, downloads PDFs, parses with Gemini, saves result.
        """
        from app.db.session import SyncSessionFactory
        from app.models.rubric import Rubric, RubricParsingStatus
        from app.models.batch import Batch, BatchStatus
        from app.websocket.events import publish_event_sync
        import asyncio

        db = SyncSessionFactory()
        try:
            rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
            if not rubric:
                raise ValueError(f"Rubric {rubric_id} not found")

            batch_id = rubric.batch_id

            # Download PDFs synchronously
            loop = asyncio.new_event_loop()
            try:
                qp_bytes = loop.run_until_complete(
                    self.storage.download_file(
                        settings.SUPABASE_BUCKET_RUBRICS, rubric.question_paper_path
                    )
                )
                ms_bytes = loop.run_until_complete(
                    self.storage.download_file(
                        settings.SUPABASE_BUCKET_RUBRICS, rubric.marking_scheme_path
                    )
                )
            finally:
                loop.close()

            # Extract text
            qp_text, qp_needs_ocr = self.pdf_processor.extract_text_from_pdf(qp_bytes)
            ms_text, ms_needs_ocr = self.pdf_processor.extract_text_from_pdf(ms_bytes)

            # Fall back to vision if text insufficient
            qp_image_b64 = None
            ms_image_b64 = None
            if qp_needs_ocr:
                images = self.pdf_processor.convert_pdf_to_images(qp_bytes, dpi=200)
                if images:
                    processed = self.pdf_processor.preprocess_for_ai(images[0])
                    qp_image_b64 = self.pdf_processor.image_to_base64(processed)
                    qp_text = "[Image-based question paper — see attached image]"

            if ms_needs_ocr:
                images = self.pdf_processor.convert_pdf_to_images(ms_bytes, dpi=200)
                if images:
                    processed = self.pdf_processor.preprocess_for_ai(images[0])
                    ms_image_b64 = self.pdf_processor.image_to_base64(processed)
                    ms_text = "[Image-based marking scheme — see attached image]"

            # Build prompt
            prompt = RUBRIC_PARSE_PROMPT.format(
                question_paper_text=qp_text,
                marking_scheme_text=ms_text,
                guidelines=rubric.guidelines or "No special guidelines.",
            )

            # Rate limit + call Gemini
            import asyncio as aio
            loop2 = aio.new_event_loop()
            try:
                loop2.run_until_complete(rate_limiter.acquire())
            finally:
                loop2.close()

            # Use vision if we have image fallback
            image_b64 = qp_image_b64 or ms_image_b64
            parsed = self.gemini.generate_json(prompt, image=image_b64)

            # Validate + repair
            validated = self._validate_and_repair(parsed)

            # Save
            rubric.parsed_structure = validated
            rubric.parsing_status = RubricParsingStatus.completed
            db.commit()

            logger.info(
                "Rubric parsed successfully",
                rubric_id=rubric_id,
                question_count=len(validated),
            )

            # Publish WS event
            publish_event_sync(batch_id, {
                "type": "rubric_parsed",
                "batch_id": batch_id,
                "payload": {"question_count": len(validated)},
            })

        except Exception as e:
            logger.error("Rubric parsing failed", rubric_id=rubric_id, error=str(e))
            try:
                rubric.parsing_status = RubricParsingStatus.failed
                batch = db.query(Batch).filter(Batch.id == rubric.batch_id).first()
                if batch:
                    batch.status = BatchStatus.failed
                    batch.error_message = f"Rubric parsing failed: {str(e)}"
                db.commit()
            except Exception as db_err:
                logger.error("Could not update rubric failure status", error=str(db_err))
                db.rollback()
            raise
        finally:
            db.close()

    def _validate_and_repair(self, parsed: list) -> list:
        """
        Validate each question object. Set defaults for malformed items.
        Discard items missing required fields after repair attempt.
        """
        if not isinstance(parsed, list):
            logger.warning("Gemini returned non-list rubric structure, wrapping")
            parsed = [parsed] if isinstance(parsed, dict) else []

        valid = []
        valid_types = {"mcq", "short_answer", "long_answer", "numerical", "diagram", "fill_blank"}

        for item in parsed:
            if not isinstance(item, dict):
                continue

            # Required fields
            if "q_no" not in item or "max_marks" not in item:
                logger.warning("Skipping malformed rubric item", item=item)
                continue

            # Defaults
            item.setdefault("question_text", "")
            item.setdefault("expected_answer", "")
            item.setdefault("marking_notes", "")
            item.setdefault("diagram_checklist", None)
            item.setdefault("keyword_list", None)

            # Coerce question_type
            qt = item.get("question_type", "short_answer")
            if qt not in valid_types:
                item["question_type"] = "short_answer"

            # Coerce max_marks
            try:
                item["max_marks"] = float(item["max_marks"])
            except (TypeError, ValueError):
                item["max_marks"] = 0.0

            # Coerce q_no to string
            item["q_no"] = str(item["q_no"])

            valid.append(item)

        return valid
