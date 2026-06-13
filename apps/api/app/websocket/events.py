"""
WebSocket event type definitions and serialization helpers.
Every WS message follows: {type, batch_id, timestamp, payload}
"""

import json
from datetime import datetime, timezone
from typing import Any


def build_event(event_type: str, batch_id: str, payload: dict) -> str:
    """Serialize a WebSocket event to JSON string."""
    return json.dumps({
        "type": event_type,
        "batch_id": batch_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    })


# Event type constants
class EventType:
    BATCH_STARTED = "batch_started"
    RUBRIC_PARSED = "rubric_parsed"
    SHEET_CONVERTING = "sheet_converting"
    SHEET_EXTRACTING = "sheet_extracting"
    SHEET_EVALUATING = "sheet_evaluating"
    SHEET_ANNOTATING = "sheet_annotating"
    SHEET_COMPLETED = "sheet_completed"
    SHEET_FAILED = "sheet_failed"
    BATCH_COMPLETED = "batch_completed"
    PROGRESS_UPDATE = "progress_update"


def publish_event_sync(batch_id: str, data: dict) -> None:
    """
    Publish a WebSocket event from a Celery worker via Redis pub/sub.
    FastAPI's background listener will forward to connected WebSocket clients.
    """
    try:
        import redis as redis_lib
        from app.core.config import settings

        r = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
        channel = f"ws:batch:{batch_id}"
        message = json.dumps({
            **data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        r.publish(channel, message)
    except Exception as e:
        # Non-fatal — log but don't break the pipeline
        import structlog
        structlog.get_logger(__name__).warning(
            "WebSocket publish failed", error=str(e), batch_id=batch_id
        )
