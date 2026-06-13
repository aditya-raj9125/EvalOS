"""Pydantic schemas for Review."""

from pydantic import BaseModel, field_validator
from app.models.review import ReviewAction
from datetime import datetime


class ReviewItemOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    evaluation_id: str
    batch_id: str
    sheet_id: str
    reviewer_id: str | None
    original_ai_score: float
    override_score: float | None
    action: ReviewAction
    reviewer_note: str | None
    reviewed_at: datetime | None
    created_at: datetime


class ReviewQueueItem(BaseModel):
    """Enriched review item for the review queue UI."""
    review_id: str
    sheet_id: str
    roll_number: str | None
    student_name: str | None
    q_no: int
    question_text: str | None
    student_answer_transcribed: str | None
    original_ai_score: float
    max_marks: float
    reason: str | None
    ai_confidence: float | None
    page_image_url: str | None
    bbox_x: float | None
    bbox_y: float | None
    bbox_w: float | None
    bbox_h: float | None
    action: ReviewAction


class OverrideRequest(BaseModel):
    override_score: float
    note: str | None = None


class ReviewStatsOut(BaseModel):
    pending_count: int
    approved_count: int
    overridden_count: int
    recheck_count: int
