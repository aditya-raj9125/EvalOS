"""Batch ORM model."""

import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    String, Integer, Float, Boolean, Text,
    DateTime, Enum as SAEnum, ForeignKey, Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class BatchStatus(str, enum.Enum):
    created = "created"
    uploading = "uploading"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Batch(Base, TimestampMixin):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[BatchStatus] = mapped_column(
        SAEnum(BatchStatus, name="batchstatus"),
        nullable=False,
        default=BatchStatus.created,
    )
    total_sheets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_sheets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    flagged_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_score_per_sheet: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    enable_student_portal: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    student_access_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    processing_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    processing_completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="batches")
    sheets: Mapped[list["Sheet"]] = relationship(
        "Sheet", back_populates="batch", cascade="all, delete-orphan"
    )
    rubric: Mapped["Rubric | None"] = relationship(
        "Rubric", back_populates="batch", uselist=False, cascade="all, delete-orphan"
    )
    review_items: Mapped[list["ReviewItem"]] = relationship(
        "ReviewItem", back_populates="batch"
    )

    __table_args__ = (
        Index("ix_batches_user_id", "user_id"),
        Index("ix_batches_status", "status"),
    )
