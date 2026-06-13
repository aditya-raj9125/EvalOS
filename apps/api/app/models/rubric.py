"""Rubric ORM model."""

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RubricParsingStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"


class Rubric(Base):
    __tablename__ = "rubrics"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    batch_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("batches.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    question_paper_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    marking_scheme_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    guidelines: Mapped[str | None] = mapped_column(Text, nullable=True)

    # JSONB array: [{q_no, question_text, question_type, max_marks,
    #               expected_answer, marking_notes, diagram_checklist, keyword_list}]
    parsed_structure: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    parsing_status: Mapped[RubricParsingStatus] = mapped_column(
        SAEnum(RubricParsingStatus, name="rubricparsingstatus"),
        nullable=False,
        default=RubricParsingStatus.pending,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    batch: Mapped["Batch"] = relationship("Batch", back_populates="rubric")
