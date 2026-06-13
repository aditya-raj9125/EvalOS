"""Sheet ORM model."""

import uuid
import enum

from sqlalchemy import String, Float, Text, Enum as SAEnum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class SheetStatus(str, enum.Enum):
    uploaded = "uploaded"
    converting = "converting"
    extracting = "extracting"
    evaluating = "evaluating"
    annotating = "annotating"
    completed = "completed"
    flagged = "flagged"
    failed = "failed"


class Sheet(Base, TimestampMixin):
    __tablename__ = "sheets"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    batch_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False
    )
    original_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # JSONB arrays of storage paths (one per page after PDF conversion)
    page_image_paths: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    annotated_image_paths: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    annotated_pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    roll_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    student_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_awarded_marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_max_marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    status: Mapped[SheetStatus] = mapped_column(
        SAEnum(SheetStatus, name="sheetstatus"),
        nullable=False,
        default=SheetStatus.uploaded,
    )
    ai_extraction_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    batch: Mapped["Batch"] = relationship("Batch", back_populates="sheets")
    evaluations: Mapped[list["Evaluation"]] = relationship(
        "Evaluation", back_populates="sheet", cascade="all, delete-orphan"
    )
    review_items: Mapped[list["ReviewItem"]] = relationship(
        "ReviewItem", back_populates="sheet"
    )

    __table_args__ = (
        Index("ix_sheets_batch_id", "batch_id"),
        Index("ix_sheets_roll_number", "roll_number"),
        Index("ix_sheets_status", "status"),
    )
