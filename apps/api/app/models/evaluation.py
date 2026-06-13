"""Evaluation ORM model."""

import uuid
import enum

from sqlalchemy import String, Float, Boolean, Integer, Enum as SAEnum, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EvaluationVerdict(str, enum.Enum):
    correct = "correct"
    partial = "partial"
    wrong = "wrong"
    skipped = "skipped"
    diagram_correct = "diagram_correct"
    diagram_partial = "diagram_partial"
    diagram_wrong = "diagram_wrong"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sheet_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sheets.id", ondelete="CASCADE"), nullable=False
    )
    q_no: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    student_answer_transcribed: Mapped[str | None] = mapped_column(Text, nullable=True)
    awarded_marks: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    verdict: Mapped[EvaluationVerdict] = mapped_column(
        SAEnum(EvaluationVerdict, name="evaluationverdict"),
        nullable=False,
        default=EvaluationVerdict.skipped,
    )
    reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Bounding box (as fractions of image dimensions, 0.0–1.0)
    bbox_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_w: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_h: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_reviewed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    from datetime import datetime
    from sqlalchemy import DateTime, func
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    sheet: Mapped["Sheet"] = relationship("Sheet", back_populates="evaluations")
    review_item: Mapped["ReviewItem | None"] = relationship(
        "ReviewItem", back_populates="evaluation", uselist=False
    )

    __table_args__ = (
        Index("ix_evaluations_sheet_id", "sheet_id"),
        Index("ix_evaluations_is_flagged", "is_flagged"),
        Index("ix_evaluations_is_reviewed", "is_reviewed"),
    )
