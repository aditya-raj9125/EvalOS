"""
Review queue endpoints:
GET  /review/queue        — all pending review items
POST /review/{id}/approve — approve AI score
POST /review/{id}/override — override score
POST /review/{id}/recheck — mark for recheck
GET  /review/stats
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.review import ReviewItem, ReviewAction
from app.models.evaluation import Evaluation, EvaluationVerdict
from app.models.sheet import Sheet
from app.models.batch import Batch
from app.models.user import User
from app.schemas.review import ReviewQueueItem, OverrideRequest, ReviewStatsOut
from app.services.storage import StorageService
from app.core.config import settings
from app.core.logging import get_logger

router = APIRouter(prefix="/review", tags=["review"])
logger = get_logger(__name__)


@router.get("/queue", response_model=list[ReviewQueueItem])
async def get_review_queue(
    batch_id: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """All pending review items for the current user's batches, sorted by confidence ASC."""
    query = (
        select(ReviewItem)
        .join(Batch, ReviewItem.batch_id == Batch.id)
        .where(
            Batch.user_id == current_user.id,
            ReviewItem.action == ReviewAction.pending,
        )
    )
    if batch_id:
        query = query.where(ReviewItem.batch_id == batch_id)

    query = (
        query
        .join(Evaluation, ReviewItem.evaluation_id == Evaluation.id)
        .order_by(Evaluation.ai_confidence.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    items = result.scalars().all()

    storage = StorageService()
    queue_items = []

    for item in items:
        ev_result = await db.execute(select(Evaluation).where(Evaluation.id == item.evaluation_id))
        ev = ev_result.scalar_one_or_none()

        sheet_result = await db.execute(select(Sheet).where(Sheet.id == item.sheet_id))
        sheet = sheet_result.scalar_one_or_none()

        # Get rubric question text
        batch_result = await db.execute(select(Batch).where(Batch.id == item.batch_id))
        batch = batch_result.scalar_one_or_none()

        question_text = None
        if batch and batch.rubric and batch.rubric.parsed_structure:
            for q in batch.rubric.parsed_structure:
                if str(q.get("q_no")) == str(ev.q_no if ev else ""):
                    question_text = q.get("question_text")
                    break

        # Signed URL for the page image
        page_image_url = None
        if sheet and sheet.page_image_paths and ev:
            page_idx = ev.page_number - 1
            if 0 <= page_idx < len(sheet.page_image_paths):
                try:
                    page_image_url = await storage.get_signed_url(
                        settings.SUPABASE_BUCKET_SHEETS,
                        sheet.page_image_paths[page_idx],
                        3600,
                    )
                except Exception:
                    pass

        queue_items.append(ReviewQueueItem(
            review_id=item.id,
            sheet_id=item.sheet_id,
            roll_number=sheet.roll_number if sheet else None,
            student_name=sheet.student_name if sheet else None,
            q_no=ev.q_no if ev else 0,
            question_text=question_text,
            student_answer_transcribed=ev.student_answer_transcribed if ev else None,
            original_ai_score=item.original_ai_score,
            max_marks=ev.max_marks if ev else 0,
            reason=ev.reason if ev else None,
            ai_confidence=ev.ai_confidence if ev else None,
            page_image_url=page_image_url,
            bbox_x=ev.bbox_x if ev else None,
            bbox_y=ev.bbox_y if ev else None,
            bbox_w=ev.bbox_w if ev else None,
            bbox_h=ev.bbox_h if ev else None,
            action=item.action,
        ))

    return queue_items


@router.post("/{review_id}/approve")
async def approve_review(
    review_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Teacher approves the AI's score."""
    review, ev = await _get_review_and_eval(review_id, current_user.id, db)

    review.action = ReviewAction.approved
    review.reviewed_at = datetime.now(timezone.utc)
    review.reviewer_id = current_user.id
    ev.is_reviewed = True

    await db.flush()
    return {"review_id": review_id, "action": "approved", "message": "AI score approved"}


@router.post("/{review_id}/override")
async def override_review(
    review_id: str,
    body: OverrideRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Teacher overrides the AI's score with a new value."""
    review, ev = await _get_review_and_eval(review_id, current_user.id, db)

    if body.override_score < 0 or body.override_score > ev.max_marks:
        raise HTTPException(
            422, detail=f"Override score must be between 0 and {ev.max_marks}"
        )

    review.action = ReviewAction.overridden
    review.override_score = body.override_score
    review.reviewer_note = body.note
    review.reviewed_at = datetime.now(timezone.utc)
    review.reviewer_id = current_user.id

    # Update evaluation
    ev.awarded_marks = body.override_score
    ev.is_reviewed = True

    # Recalculate verdict
    if body.override_score == 0:
        ev.verdict = EvaluationVerdict.wrong
    elif body.override_score >= ev.max_marks:
        ev.verdict = EvaluationVerdict.correct
    else:
        ev.verdict = EvaluationVerdict.partial

    await db.flush()

    # Recalculate sheet totals
    await _recalculate_sheet_totals(ev.sheet_id, db)

    # Trigger re-annotation in background
    try:
        from app.workers.tasks.evaluation_tasks import reannotate_page_task
        reannotate_page_task.delay(ev.sheet_id)
    except Exception as e:
        logger.warning("Could not trigger re-annotation", error=str(e))

    return {
        "review_id": review_id,
        "action": "overridden",
        "new_score": body.override_score,
        "message": "Score overridden and sheet totals recalculated",
    }


@router.post("/{review_id}/recheck")
async def recheck_review(
    review_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a review item for physical recheck."""
    review, ev = await _get_review_and_eval(review_id, current_user.id, db)
    review.action = ReviewAction.recheck
    await db.flush()
    return {"review_id": review_id, "action": "recheck", "message": "Marked for recheck"}


@router.get("/stats", response_model=ReviewStatsOut)
async def get_review_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Review queue statistics for the dashboard."""
    from sqlalchemy import func

    result = await db.execute(
        select(ReviewItem.action, func.count(ReviewItem.id))
        .join(Batch, ReviewItem.batch_id == Batch.id)
        .where(Batch.user_id == current_user.id)
        .group_by(ReviewItem.action)
    )
    counts = {row[0]: row[1] for row in result.all()}

    return ReviewStatsOut(
        pending_count=counts.get(ReviewAction.pending, 0),
        approved_count=counts.get(ReviewAction.approved, 0),
        overridden_count=counts.get(ReviewAction.overridden, 0),
        recheck_count=counts.get(ReviewAction.recheck, 0),
    )


# ─── Helpers ─────────────────────────────────────────────────────────────────

async def _get_review_and_eval(review_id: str, user_id: str, db: AsyncSession):
    """Get ReviewItem + Evaluation ensuring ownership."""
    result = await db.execute(
        select(ReviewItem)
        .join(Batch, ReviewItem.batch_id == Batch.id)
        .where(ReviewItem.id == review_id, Batch.user_id == user_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(404, detail="Review item not found or access denied")

    ev_result = await db.execute(select(Evaluation).where(Evaluation.id == review.evaluation_id))
    ev = ev_result.scalar_one_or_none()
    if not ev:
        raise HTTPException(404, detail="Evaluation not found")

    return review, ev


async def _recalculate_sheet_totals(sheet_id: str, db: AsyncSession) -> None:
    """Recalculate sheet totals after an override."""
    from sqlalchemy import select
    from app.models.sheet import Sheet, SheetStatus

    ev_result = await db.execute(select(Evaluation).where(Evaluation.sheet_id == sheet_id))
    evals = ev_result.scalars().all()

    total_awarded = sum(e.awarded_marks for e in evals)
    total_max = sum(e.max_marks for e in evals)
    percentage = (total_awarded / total_max * 100) if total_max > 0 else 0

    sheet_result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = sheet_result.scalar_one_or_none()
    if sheet:
        sheet.total_awarded_marks = round(total_awarded, 2)
        sheet.total_max_marks = round(total_max, 2)
        sheet.percentage = round(percentage, 2)
        await db.flush()
