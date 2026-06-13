"""Evaluation-specific Celery tasks (routed to high_priority queue)."""

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.tasks.evaluation_tasks.evaluate_sheet_task", bind=True)
def evaluate_sheet_task(self, sheet_id: str) -> dict:
    """Standalone evaluation task for re-evaluation use cases."""
    from app.services.sheet_evaluator import SheetEvaluator
    try:
        evaluator = SheetEvaluator()
        evaluator.evaluate_sheet_sync(sheet_id)
        evaluator.calculate_sheet_totals_sync(sheet_id)
        return {"status": "completed", "sheet_id": sheet_id}
    except Exception as e:
        logger.error("evaluate_sheet_task failed", sheet_id=sheet_id, error=str(e))
        raise


@celery_app.task(name="app.workers.tasks.evaluation_tasks.reannotate_page_task", bind=True)
def reannotate_page_task(self, sheet_id: str) -> dict:
    """Re-annotate a sheet after a review override."""
    from app.services.annotator import AnnotationEngine
    try:
        AnnotationEngine().annotate_sheet_sync(sheet_id)
        return {"status": "completed", "sheet_id": sheet_id}
    except Exception as e:
        logger.error("reannotate_page_task failed", sheet_id=sheet_id, error=str(e))
        raise
