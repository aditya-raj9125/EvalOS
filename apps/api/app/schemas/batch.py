"""Pydantic schemas for Batch."""

from pydantic import BaseModel
from datetime import datetime
from app.models.batch import BatchStatus


class BatchCreate(BaseModel):
    name: str
    subject: str | None = None
    max_score_per_sheet: float = 100.0
    enable_student_portal: bool = True
    student_access_code: str | None = None


class BatchOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    user_id: str
    name: str
    subject: str | None
    status: BatchStatus
    total_sheets: int
    processed_sheets: int
    flagged_count: int
    avg_score: float | None
    max_score_per_sheet: float
    enable_student_portal: bool
    student_access_code: str | None
    processing_started_at: datetime | None
    processing_completed_at: datetime | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class BatchListOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    subject: str | None
    status: BatchStatus
    total_sheets: int
    processed_sheets: int
    avg_score: float | None
    created_at: datetime


class BatchStatusResponse(BaseModel):
    batch_id: str
    status: BatchStatus
    total_sheets: int
    processed_sheets: int
    flagged_count: int
    progress_percent: float
    estimated_remaining_seconds: int
    sheet_statuses: list[dict]


class UploadSheetsResponse(BaseModel):
    batch_id: str
    sheets_received: int
    sheets: list[dict]


class StartProcessingResponse(BaseModel):
    message: str
    batch_id: str
    estimated_time_seconds: int
