"""
Answer sheet evaluator — core AI feature.
Evaluates each page of a handwritten answer sheet against the rubric.
"""

import asyncio
import json
from app.core.logging import get_logger
from app.services.gemini_client import GeminiClient
from app.services.pdf_processor import PDFProcessor
from app.services.storage import StorageService
from app.core.config import settings
from app.workers.rate_limiter import rate_limiter

logger = get_logger(__name__)

EVALUATION_PROMPT = """You are an expert, fair, and thorough exam evaluator. You are evaluating a student's handwritten answer sheet page against an official marking scheme.

OFFICIAL MARKING SCHEME (full question structure):
{rubric_json}

QUESTIONS ALREADY EVALUATED ON PREVIOUS PAGES (do not re-evaluate these):
{already_evaluated}

TASK:
Look at the answer sheet image provided. Identify and evaluate ONLY the questions answered on this specific page that have NOT already been evaluated. A student's answer may span multiple lines or paragraphs. Read every word carefully before judging.

For each answer you find on this page, return a JSON object in the array with:
- "q_no": string — must exactly match a q_no from the marking scheme above
- "page_number": number — the page number you are currently evaluating (use {page_number})
- "student_answer_transcribed": string — transcribe the student's handwritten answer EXACTLY as written, including any diagrams described as text (e.g. "[Student drew a labeled diagram of plant cell]")
- "awarded_marks": number — marks to award based on the marking scheme
- "max_marks": number — maximum marks for this question (copy from marking scheme)
- "verdict": one of ["correct", "partial", "wrong", "skipped", "diagram_correct", "diagram_partial", "diagram_wrong"]
- "reason": string — MAXIMUM 20 words explaining exactly why this mark was awarded or deducted. Be specific. Example: "Missing mitochondria label. Nucleus and cell wall correctly drawn." NOT "Answer is incorrect."
- "ai_confidence": number 0–1 — how confident you are in your evaluation. Set below 0.75 if: handwriting is unclear, the answer is ambiguous, or the question has multiple valid approaches.
- "bbox": object with keys "x", "y", "w", "h" — approximate bounding box of where this answer appears on the page image, as fractions of image dimensions (0.0 to 1.0). x and y are the top-left corner. Estimate as accurately as possible — this is used to draw marks on the sheet.
- "is_diagram": boolean — true if this answer contains a diagram (drawn figure, graph, circuit, etc.)
- "diagram_elements_found": array of strings — if is_diagram is true, list which elements from the marking scheme's diagram_checklist were found in the student's drawing. If not a diagram, set to null.

EVALUATION RULES — follow these strictly:
1. Award marks fairly. If a student's answer conveys the correct meaning even in different words, award full marks unless the marking scheme explicitly says keywords are required.
2. For numerical questions: award full marks if the final answer is correct. Award partial marks if the method is correct but arithmetic error led to wrong answer, unless marking scheme says "method marks only if correct answer."
3. For diagram questions: evaluate each checklist item independently. Award proportional marks based on how many checklist items are correctly drawn and labeled.
4. If the student has left a question blank, set verdict to "skipped" and awarded_marks to 0.
5. If a question is not visible on this page, do not include it in the array.
6. Do NOT penalise for spelling mistakes unless it's a subject-specific technical term where spelling changes meaning.

SPECIAL EXAMINER GUIDELINES:
{guidelines}

Return ONLY a JSON array of evaluation objects. No preamble, no explanation, no markdown."""

VALID_VERDICTS = {
    "correct", "partial", "wrong", "skipped",
    "diagram_correct", "diagram_partial", "diagram_wrong"
}


class SheetEvaluator:
    """Evaluates all pages of an answer sheet against a parsed rubric."""

    def __init__(self):
        self.gemini = GeminiClient()
        self.pdf_processor = PDFProcessor()
        self.storage = StorageService()

    def evaluate_sheet_sync(self, sheet_id: str) -> None:
        """Synchronous entry point (Celery). Evaluates all pages."""
        from app.db.session import SyncSessionFactory
        from app.models.sheet import Sheet, SheetStatus
        from app.models.batch import Batch
        from app.models.rubric import Rubric, RubricParsingStatus
        from app.models.evaluation import Evaluation, EvaluationVerdict
        from app.models.review import ReviewItem, ReviewAction

        db = SyncSessionFactory()
        try:
            sheet = db.query(Sheet).filter(Sheet.id == sheet_id).first()
            if not sheet:
                raise ValueError(f"Sheet {sheet_id} not found")

            batch = db.query(Batch).filter(Batch.id == sheet.batch_id).first()
            rubric = db.query(Rubric).filter(Rubric.batch_id == batch.id).first()

            if not rubric or rubric.parsing_status != RubricParsingStatus.completed:
                raise ValueError("Rubric not parsed — cannot evaluate sheet")

            rubric_structure = rubric.parsed_structure or []
            guidelines = rubric.guidelines or "No special guidelines."

            # Build q_no → question map for validation
            q_map = {str(q["q_no"]): q for q in rubric_structure}

            all_evaluated_q_nos = []
            loop = asyncio.new_event_loop()

            try:
                for page_idx, page_path in enumerate(sheet.page_image_paths or []):
                    page_number = page_idx + 1

                    # Download page image
                    image_bytes = loop.run_until_complete(
                        self.storage.download_file(settings.SUPABASE_BUCKET_SHEETS, page_path)
                    )

                    pil_img = self.pdf_processor.convert_image_to_standard(image_bytes)
                    pil_img = self.pdf_processor.preprocess_for_ai(pil_img)
                    b64 = self.pdf_processor.image_to_base64(pil_img)

                    prompt = EVALUATION_PROMPT.format(
                        rubric_json=json.dumps(rubric_structure, indent=2),
                        already_evaluated=json.dumps(all_evaluated_q_nos),
                        page_number=page_number,
                        guidelines=guidelines,
                    )

                    # Rate limit + call Gemini
                    loop.run_until_complete(rate_limiter.acquire())
                    results = self.gemini.generate_json(prompt, image=b64)

                    if not isinstance(results, list):
                        logger.warning("Gemini returned non-list evaluation", page=page_number)
                        results = []

                    for item in results:
                        q_no_str = str(item.get("q_no", ""))
                        if q_no_str not in q_map:
                            logger.warning("Unknown q_no from Gemini, discarding", q_no=q_no_str)
                            continue

                        rubric_q = q_map[q_no_str]
                        max_m = float(rubric_q.get("max_marks", 0))

                        awarded = max(0.0, min(max_m, float(item.get("awarded_marks", 0))))
                        confidence = max(0.0, min(1.0, float(item.get("ai_confidence", 0.8))))

                        bbox = item.get("bbox", {}) or {}
                        bx = max(0.0, min(1.0, float(bbox.get("x", 0.1))))
                        by = max(0.0, min(1.0, float(bbox.get("y", 0.1))))
                        bw = max(0.0, min(1.0, float(bbox.get("w", 0.5))))
                        bh = max(0.0, min(1.0, float(bbox.get("h", 0.1))))

                        verdict_raw = item.get("verdict", "skipped")
                        if verdict_raw not in VALID_VERDICTS:
                            verdict_raw = "skipped"

                        is_flagged = confidence < 0.75

                        eval_record = Evaluation(
                            sheet_id=sheet_id,
                            q_no=int(q_no_str) if q_no_str.isdigit() else 0,
                            question_type=str(rubric_q.get("question_type", "short_answer")),
                            page_number=page_number,
                            student_answer_transcribed=item.get("student_answer_transcribed"),
                            awarded_marks=awarded,
                            max_marks=max_m,
                            verdict=EvaluationVerdict(verdict_raw),
                            reason=item.get("reason", "")[:200],
                            ai_confidence=confidence,
                            bbox_x=bx,
                            bbox_y=by,
                            bbox_w=bw,
                            bbox_h=bh,
                            is_flagged=is_flagged,
                        )
                        db.add(eval_record)
                        db.flush()

                        if is_flagged:
                            review = ReviewItem(
                                evaluation_id=eval_record.id,
                                batch_id=batch.id,
                                sheet_id=sheet_id,
                                original_ai_score=awarded,
                                action=ReviewAction.pending,
                            )
                            db.add(review)

                        all_evaluated_q_nos.append(q_no_str)

                    db.commit()

            finally:
                loop.close()

            sheet.status = SheetStatus.annotating
            db.commit()

            logger.info("Sheet evaluated", sheet_id=sheet_id, q_count=len(all_evaluated_q_nos))

        except Exception as e:
            logger.error("Sheet evaluation failed", sheet_id=sheet_id, error=str(e))
            db.rollback()
            raise
        finally:
            db.close()

    def calculate_sheet_totals_sync(self, sheet_id: str) -> None:
        """Sum all awarded marks, set percentage, grade, and final status."""
        from app.db.session import SyncSessionFactory
        from app.models.sheet import Sheet, SheetStatus
        from app.models.evaluation import Evaluation

        db = SyncSessionFactory()
        try:
            sheet = db.query(Sheet).filter(Sheet.id == sheet_id).first()
            evaluations = db.query(Evaluation).filter(Evaluation.sheet_id == sheet_id).all()

            total_awarded = sum(e.awarded_marks for e in evaluations)
            total_max = sum(e.max_marks for e in evaluations)
            percentage = (total_awarded / total_max * 100) if total_max > 0 else 0.0

            # Grading scale
            grade = self._calculate_grade(percentage)

            sheet.total_awarded_marks = round(total_awarded, 2)
            sheet.total_max_marks = round(total_max, 2)
            sheet.percentage = round(percentage, 2)
            sheet.grade = grade

            # If any evaluations flagged, mark sheet as flagged
            has_flagged = any(e.is_flagged for e in evaluations)
            if has_flagged:
                sheet.status = SheetStatus.flagged
            else:
                sheet.status = SheetStatus.annotating

            db.commit()
            logger.info(
                "Sheet totals calculated",
                sheet_id=sheet_id,
                total=total_awarded,
                max=total_max,
                grade=grade,
            )

        except Exception as e:
            logger.error("Calculate totals failed", sheet_id=sheet_id, error=str(e))
            db.rollback()
            raise
        finally:
            db.close()

    @staticmethod
    def _calculate_grade(percentage: float) -> str:
        if percentage >= 90:
            return "A+"
        elif percentage >= 80:
            return "A"
        elif percentage >= 70:
            return "B+"
        elif percentage >= 60:
            return "B"
        elif percentage >= 50:
            return "C"
        elif percentage >= 40:
            return "D"
        else:
            return "F"
