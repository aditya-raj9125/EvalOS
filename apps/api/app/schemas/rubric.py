"""Pydantic schemas for Rubric."""

from pydantic import BaseModel
from app.models.rubric import RubricParsingStatus
from datetime import datetime


class RubricOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    batch_id: str
    question_paper_path: str | None
    marking_scheme_path: str | None
    guidelines: str | None
    parsed_structure: list | None
    parsing_status: RubricParsingStatus
    created_at: datetime


class RubricUploadResponse(BaseModel):
    rubric_id: str
    batch_id: str
    message: str
