"""
Roll number and student info extraction from answer sheet header using Gemini Vision.
"""

import asyncio
from app.core.logging import get_logger
from app.core.utils import sanitize_text_field
from app.services.gemini_client import GeminiClient
from app.services.pdf_processor import PDFProcessor
from app.services.storage import StorageService
from app.core.config import settings
from app.workers.rate_limiter import rate_limiter

logger = get_logger(__name__)

ROLL_EXTRACTION_PROMPT = """You are reading a student's exam answer sheet. Look at the header area of this answer sheet image carefully.

Extract the following student information. This information is typically found in a box or table at the top of the answer sheet.

Return a JSON object with exactly these fields:
- "roll_number": string — the student's roll number or exam registration number. Look for labels like "Roll No.", "Registration No.", "Exam Roll", "रोल नं." or similar. If not found, return null.
- "student_name": string — the student's full name. Look for "Name:", "Student Name:", "नाम:" or similar. If not found, return null.
- "subject": string — the subject name if written on the sheet. If not found, return null.
- "class_section": string — class and section if present. If not found, return null.
- "confidence": number between 0 and 1 — how confident you are in the extracted information. If the header is clearly visible and readable, return 0.9 or above. If partially readable, return 0.6–0.8. If the header is missing or illegible, return below 0.5.

Return ONLY the JSON object. No preamble."""


class RollExtractor:
    """Extracts student roll number and name from the first page of an answer sheet."""

    def __init__(self):
        self.gemini = GeminiClient()
        self.pdf_processor = PDFProcessor()
        self.storage = StorageService()

    def extract_student_info_sync(self, sheet_id: str) -> None:
        """
        Synchronous entry point (called from Celery).
        Downloads first page image, sends to Gemini, saves extracted info.
        """
        from app.db.session import SyncSessionFactory
        from app.models.sheet import Sheet, SheetStatus

        db = SyncSessionFactory()
        try:
            sheet = db.query(Sheet).filter(Sheet.id == sheet_id).first()
            if not sheet:
                raise ValueError(f"Sheet {sheet_id} not found")

            if not sheet.page_image_paths or len(sheet.page_image_paths) == 0:
                logger.warning("No page images available for roll extraction", sheet_id=sheet_id)
                sheet.status = SheetStatus.evaluating
                db.commit()
                return

            # Download first page
            first_page_path = sheet.page_image_paths[0]
            loop = asyncio.new_event_loop()
            try:
                image_bytes = loop.run_until_complete(
                    self.storage.download_file(
                        settings.SUPABASE_BUCKET_SHEETS, first_page_path
                    )
                )
                loop.run_until_complete(rate_limiter.acquire())
            finally:
                loop.close()

            # Preprocess
            pil_img = self.pdf_processor.convert_image_to_standard(image_bytes)
            pil_img = self.pdf_processor.preprocess_for_ai(pil_img)
            b64 = self.pdf_processor.image_to_base64(pil_img)

            # Call Gemini
            result = self.gemini.generate_json(ROLL_EXTRACTION_PROMPT, image=b64)

            # Update sheet
            confidence = float(result.get("confidence", 0.5))
            sheet.roll_number = sanitize_text_field(result.get("roll_number"))
            sheet.student_name = sanitize_text_field(result.get("student_name"), max_length=100)
            sheet.ai_extraction_confidence = confidence

            if confidence < 0.5:
                sheet.error_message = (
                    "Student header unclear — manual roll number entry may be needed"
                )
                logger.warning(
                    "Low confidence roll extraction",
                    sheet_id=sheet_id,
                    confidence=confidence,
                )

            sheet.status = SheetStatus.evaluating
            db.commit()

            logger.info(
                "Student info extracted",
                sheet_id=sheet_id,
                roll_number=sheet.roll_number,
                confidence=confidence,
            )

        except Exception as e:
            logger.error("Roll extraction failed", sheet_id=sheet_id, error=str(e))
            db.rollback()
            raise
        finally:
            db.close()
