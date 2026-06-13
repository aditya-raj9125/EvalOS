.PHONY: dev worker flower migrate test lint typecheck

dev:
	.venv/Scripts/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

worker:
	.venv/Scripts/celery -A celery_worker worker --concurrency=4 --queues=high_priority,default --loglevel=info --pool=solo

flower:
	.venv/Scripts/celery -A celery_worker flower --port=5555

migrate:
	.venv/Scripts/alembic upgrade head

test:
	.venv/Scripts/pytest tests/ -v

lint:
	.venv/Scripts/ruff check app/

typecheck:
	.venv/Scripts/mypy app/
