"""
Celery application configuration.
Two queues: high_priority (evaluation tasks) and default (orchestration).
"""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "evalai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Reliability
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,  # 1 task/worker — prevents Gemini rate limit overrun

    # Timeouts
    task_soft_time_limit=300,   # 5 minutes soft limit
    task_time_limit=360,        # 6 minutes hard limit

    # Result expiry
    result_expires=86400,       # 24 hours

    # Queues
    task_default_queue="default",
    task_queues={
        "high_priority": {"exchange": "high_priority", "routing_key": "high_priority"},
        "default": {"exchange": "default", "routing_key": "default"},
    },
    task_routes={
        "app.workers.tasks.evaluation_tasks.*": {"queue": "high_priority"},
        "app.workers.tasks.batch_tasks.process_single_sheet": {"queue": "high_priority"},
        "*": {"queue": "default"},
    },

    # No beat schedule needed
    beat_schedule={},
)

# Auto-discover tasks
celery_app.autodiscover_tasks([
    "app.workers.tasks.batch_tasks",
    "app.workers.tasks.evaluation_tasks",
    "app.workers.tasks.notification_tasks",
])
