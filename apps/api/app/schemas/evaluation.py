"""Pydantic schemas for Evaluation."""

from pydantic import BaseModel
from app.models.evaluation import EvaluationVerdict
from datetime import datetime


class EvaluationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    sheet_id: str
    q_no: int
    question_type: str
    page_number: int
    student_answer_transcribed: str | None
    awarded_marks: float
    max_marks: float
    verdict: EvaluationVerdict
    reason: str | None
    ai_confidence: float | None
    bbox_x: float | None
    bbox_y: float | None
    bbox_w: float | None
    bbox_h: float | None
    is_flagged: bool
    is_reviewed: bool
    created_at: datetime
