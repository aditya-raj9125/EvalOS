"""ReviewItem ORM model."""

import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    String, Float, Text, DateTime, Enum as SAEnum,
    ForeignKey, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReviewAction(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    overridden = "overridden"
    recheck = "recheck"


class ReviewItem(Base):
    __tablename__ = "review_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    evaluation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False
    )
    batch_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("batches.id"), nullable=False
    )
    sheet_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sheets.id"), nullable=False
    )
    reviewer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    original_ai_score: Mapped[float] = mapped_column(Float, nullable=False)
    override_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    action: Mapped[ReviewAction] = mapped_column(
        SAEnum(ReviewAction, name="reviewaction"),
        nullable=False,
        default=ReviewAction.pending,
    )
    reviewer_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship(
        "Evaluation", back_populates="review_item"
    )
    batch: Mapped["Batch"] = relationship("Batch", back_populates="review_items")
    sheet: Mapped["Sheet"] = relationship("Sheet", back_populates="review_items")
    reviewer: Mapped["User | None"] = relationship("User", back_populates="review_items")

    __table_args__ = (
        Index("ix_review_items_batch_id", "batch_id"),
        Index("ix_review_items_action", "action"),
    )
