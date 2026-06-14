"""
Celery batch orchestration tasks.
process_batch → parse_rubric → chord of process_single_sheet → batch_completion_task
"""

import traceback
from datetime import datetime, timezone

import redis as redis_lib
from celery import chord, group

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.logging import get_logger
from app.websocket.events import publish_event_sync, EventType

logger = get_logger(__name__)


def _get_redis():
    return redis_lib.from_url(settings.REDIS_URL, decode_responses=True)


# ─── Master orchestrator ────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.batch_tasks.process_batch", bind=True)
def process_batch(self, batch_id: str) -> None:
    """
    Master orchestrator task.
    1. Parse rubric
    2. Launch chord of process_single_sheet for all sheets
    3. Callback: batch_completion_task
    """
    from app.db.session import SyncSessionFactory
    from app.models.batch import Batch, BatchStatus
    from app.models.sheet import Sheet

    db = SyncSessionFactory()
    try:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            logger.error("Batch not found", batch_id=batch_id)
            return

        batch.status = BatchStatus.processing
        batch.processing_started_at = datetime.now(timezone.utc)
        db.commit()

        publish_event_sync(batch_id, {
            "type": EventType.BATCH_STARTED,
            "batch_id": batch_id,
            "payload": {"total_sheets": batch.total_sheets},
        })

        # Parse rubric first (blocking — sheets depend on it)
        if batch.rubric:
            try:
                from app.services.rubric_parser import RubricParser
                RubricParser().parse_rubric_sync(batch.rubric.id)
            except Exception as e:
                logger.error("Rubric parsing failed", batch_id=batch_id, error=str(e))
                batch.status = BatchStatus.failed
                batch.error_message = f"Rubric parsing failed: {e}"
                db.commit()
                return

        # Get all sheets
        sheets = db.query(Sheet).filter(Sheet.batch_id == batch_id).all()
        sheet_ids = [s.id for s in sheets]

        if not sheet_ids:
            batch.status = BatchStatus.failed
            batch.error_message = "No sheets to process"
            db.commit()
            return

        # Initialize Redis progress counter
        r = _get_redis()
        r.set(f"batch:{batch_id}:processed", 0)
        r.expire(f"batch:{batch_id}:processed", 86400)

        # Build chord: all sheets processed in parallel, then completion callback
        processing_chord = chord(
            group(process_single_sheet.s(sheet_id) for sheet_id in sheet_ids),
            batch_completion_task.s(batch_id),
        )
        processing_chord.apply_async()

        logger.info("Batch processing started", batch_id=batch_id, sheets=len(sheet_ids))

    except Exception as e:
        logger.error("process_batch failed", batch_id=batch_id, error=str(e))
        try:
            batch.status = BatchStatus.failed
            batch.error_message = str(e)
            db.commit()
        except Exception:
            db.rollback()
    finally:
        db.close()


# ─── Rubric parsing task ─────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.batch_tasks.parse_rubric_task", bind=True)
def parse_rubric_task(self, rubric_id: str) -> dict:
    """Parse rubric using Gemini. Returns {status, question_count}."""
    from app.services.rubric_parser import RubricParser

    try:
        RubricParser().parse_rubric_sync(rubric_id)
        return {"status": "completed", "rubric_id": rubric_id}
    except Exception as e:
        logger.error("parse_rubric_task failed", rubric_id=rubric_id, error=str(e),
                     traceback=traceback.format_exc())
        raise


# ─── Per-sheet pipeline ──────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.batch_tasks.process_single_sheet", bind=True)
def process_single_sheet(self, sheet_id: str) -> dict:
    """
    Full per-sheet pipeline:
    1. Convert PDF/image to pages
    2. Extract roll number
    3. Evaluate against rubric
    4. Calculate totals
    5. Annotate
    """
    from app.db.session import SyncSessionFactory
    from app.models.sheet import Sheet, SheetStatus

    db = SyncSessionFactory()
    sheet = None

    try:
        sheet = db.query(Sheet).filter(Sheet.id == sheet_id).first()
        if not sheet:
            return {"status": "not_found", "sheet_id": sheet_id}

        batch_id = sheet.batch_id

        # ── Step 1: Convert to page images ──────────────────────────────
        _update_sheet_status(db, sheet, SheetStatus.converting)
        publish_event_sync(batch_id, {
            "type": EventType.SHEET_CONVERTING,
            "batch_id": batch_id,
            "payload": {"sheet_id": sheet_id, "filename": sheet.original_file_path},
        })

        _convert_sheet_pages(sheet, db)

        # ── Step 2: Extract roll number ──────────────────────────────────
        _update_sheet_status(db, sheet, SheetStatus.extracting)
        publish_event_sync(batch_id, {
            "type": EventType.SHEET_EXTRACTING,
            "batch_id": batch_id,
            "payload": {"sheet_id": sheet_id},
        })

        from app.services.roll_extractor import RollExtractor
        RollExtractor().extract_student_info_sync(sheet_id)

        # Reload sheet after extraction
        db.refresh(sheet)

        # ── Step 3: Evaluate ─────────────────────────────────────────────
        publish_event_sync(batch_id, {
            "type": EventType.SHEET_EVALUATING,
            "batch_id": batch_id,
            "payload": {"sheet_id": sheet_id, "roll_number": sheet.roll_number},
        })

        from app.services.sheet_evaluator import SheetEvaluator
        evaluator = SheetEvaluator()
        evaluator.evaluate_sheet_sync(sheet_id)
        evaluator.calculate_sheet_totals_sync(sheet_id)
        db.refresh(sheet)

        # ── Step 4: Annotate ─────────────────────────────────────────────
        _update_sheet_status(db, sheet, SheetStatus.annotating)
        publish_event_sync(batch_id, {
            "type": EventType.SHEET_ANNOTATING,
            "batch_id": batch_id,
            "payload": {"sheet_id": sheet_id, "roll_number": sheet.roll_number},
        })

        from app.services.annotator import AnnotationEngine
        AnnotationEngine().annotate_sheet_sync(sheet_id)
        db.refresh(sheet)

        # ── Step 5: Complete ─────────────────────────────────────────────
        publish_event_sync(batch_id, {
            "type": EventType.SHEET_COMPLETED,
            "batch_id": batch_id,
            "payload": {
                "sheet_id": sheet_id,
                "roll_number": sheet.roll_number,
                "student_name": sheet.student_name,
                "total_marks": sheet.total_awarded_marks,
                "max_marks": sheet.total_max_marks,
                "percentage": sheet.percentage,
                "grade": sheet.grade,
                "flagged": sheet.status.value == "flagged",
            },
        })

        # Increment Redis counter
        r = _get_redis()
        processed = r.incr(f"batch:{batch_id}:processed")

        # Update DB processed count
        from app.models.batch import Batch
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if batch:
            batch.processed_sheets = int(processed)
            db.commit()

        publish_event_sync(batch_id, {
            "type": EventType.PROGRESS_UPDATE,
            "batch_id": batch_id,
            "payload": {
                "processed": int(processed),
                "total": batch.total_sheets if batch else 0,
                "progress_percent": int(processed) / batch.total_sheets * 100 if batch and batch.total_sheets else 0,
            },
        })

        return {"status": "completed", "sheet_id": sheet_id}

    except Exception as e:
        tb = traceback.format_exc()
        logger.error(
            "process_single_sheet failed",
            task_id=self.request.id,
            sheet_id=sheet_id,
            error=str(e),
            traceback=tb,
        )
        # Fail the sheet gracefully — never propagate to crash the batch
        try:
            if sheet:
                sheet.status = SheetStatus.failed
                sheet.error_message = str(e)[:500]
                db.commit()

                publish_event_sync(sheet.batch_id, {
                    "type": EventType.SHEET_FAILED,
                    "batch_id": sheet.batch_id,
                    "payload": {
                        "sheet_id": sheet_id,
                        "filename": sheet.original_file_path,
                        "error": str(e),
                    },
                })
        except Exception:
            db.rollback()

        return {"status": "failed", "sheet_id": sheet_id, "error": str(e)}
    finally:
        db.close()


# ─── Batch completion callback ────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.batch_tasks.batch_completion_task", bind=True)
def batch_completion_task(self, results: list, batch_id: str) -> None:
    """
    Chord callback — runs after all sheets complete.
    Calculates final stats, updates batch status.
    """
    from app.db.session import SyncSessionFactory
    from app.models.batch import Batch, BatchStatus
    from app.models.sheet import Sheet, SheetStatus
    from sqlalchemy import func as sqlfunc

    db = SyncSessionFactory()
    try:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            return

        sheets = db.query(Sheet).filter(Sheet.batch_id == batch_id).all()

        completed = [s for s in sheets if s.status in (SheetStatus.completed, SheetStatus.flagged)]
        failed = [s for s in sheets if s.status == SheetStatus.failed]
        flagged = [s for s in sheets if s.status == SheetStatus.flagged]

        avg_score = None
        if completed:
            scores = [s.percentage for s in completed if s.percentage is not None]
            avg_score = sum(scores) / len(scores) if scores else None

        # Sync processed count from Redis
        r = _get_redis()
        redis_processed = r.get(f"batch:{batch_id}:processed")
        processed_count = int(redis_processed) if redis_processed else len(completed)

        batch.status = BatchStatus.completed
        batch.processing_completed_at = datetime.now(timezone.utc)
        batch.avg_score = round(avg_score, 2) if avg_score is not None else None
        batch.flagged_count = len(flagged)
        batch.processed_sheets = processed_count

        started_at = batch.processing_started_at
        time_taken = (
            int((datetime.now(timezone.utc) - started_at).total_seconds())
            if started_at
            else 0
        )

        db.commit()

        publish_event_sync(batch_id, {
            "type": EventType.BATCH_COMPLETED,
            "batch_id": batch_id,
            "payload": {
                "total_processed": len(completed),
                "total_flagged": len(flagged),
                "total_failed": len(failed),
                "avg_score": avg_score,
                "time_taken_seconds": time_taken,
            },
        })

        logger.info(
            "Batch completed",
            batch_id=batch_id,
            processed=len(completed),
            flagged=len(flagged),
            failed=len(failed),
        )

    except Exception as e:
        logger.error("batch_completion_task failed", batch_id=batch_id, error=str(e))
        db.rollback()
    finally:
        db.close()


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _update_sheet_status(db, sheet, status) -> None:
    sheet.status = status
    db.commit()


def _convert_sheet_pages(sheet, db) -> None:
    """Download original, convert to page images, upload, update paths."""
    import asyncio
    import uuid
    from app.services.storage import StorageService
    from app.services.pdf_processor import PDFProcessor
    from app.core.utils import detect_file_type

    storage = StorageService()
    pdf_proc = PDFProcessor()

    loop = asyncio.new_event_loop()
    try:
        original_bytes = loop.run_until_complete(
            storage.download_file(settings.SUPABASE_BUCKET_SHEETS, sheet.original_file_path)
        )

        file_type = detect_file_type(original_bytes)
        page_images = []

        if file_type == "pdf":
            page_images = pdf_proc.convert_pdf_to_images(original_bytes)
        elif file_type in ("jpeg", "png"):
            img = pdf_proc.convert_image_to_standard(original_bytes)
            page_images = [img]
        else:
            raise ValueError(f"Unsupported file type for sheet: {file_type}")

        if not page_images:
            raise ValueError("No pages could be extracted from sheet file")

        page_paths = []
        for idx, page_img in enumerate(page_images):
            preprocessed = pdf_proc.preprocess_for_ai(page_img)
            page_path = f"{sheet.batch_id}/{sheet.id}/pages/page_{idx + 1}.png"
            loop.run_until_complete(
                storage.upload_image(settings.SUPABASE_BUCKET_SHEETS, page_path, preprocessed)
            )
            page_paths.append(page_path)

        sheet.page_image_paths = page_paths
        db.commit()

    finally:
        loop.close()
