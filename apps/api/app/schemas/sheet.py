"""Pydantic schemas for Sheet."""

from pydantic import BaseModel
from datetime import datetime
from app.models.sheet import SheetStatus


class SheetOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    batch_id: str
    original_file_path: str | None
    page_image_paths: list | None
    annotated_image_paths: list | None
    annotated_pdf_path: str | None
    roll_number: str | None
    student_name: str | None
    total_awarded_marks: float | None
    total_max_marks: float | None
    percentage: float | None
    grade: str | None
    status: SheetStatus
    ai_extraction_confidence: float | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class SheetDetailOut(SheetOut):
    """Adds signed URLs and evaluation breakdown for single sheet view."""
    annotated_page_urls: list[str] = []
    annotated_pdf_url: str | None = None
    evaluations: list[dict] = []
