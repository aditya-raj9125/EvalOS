"""Notification tasks (reserved for future email/SMS integrations)."""

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.tasks.notification_tasks.send_batch_complete_notification")
def send_batch_complete_notification(batch_id: str, user_email: str) -> None:
    """Placeholder: send email notification when batch processing completes."""
    logger.info("Notification task called", batch_id=batch_id, email=user_email)
    # Email integration goes here (SendGrid, SES, etc.)
