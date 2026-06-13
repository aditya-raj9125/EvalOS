"""Celery worker entry point."""

from app.workers.celery_app import celery_app

# Import tasks to register them
import app.workers.tasks.batch_tasks
import app.workers.tasks.evaluation_tasks
import app.workers.tasks.notification_tasks

if __name__ == "__main__":
    celery_app.start()
