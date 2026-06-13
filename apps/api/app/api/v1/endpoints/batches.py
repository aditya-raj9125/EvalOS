"""
Batches API endpoints:
- CRUD for batches
- File upload (sheets, rubric)
- Start processing
- Status, results, analytics
"""

import io
import uuid
import zipfile
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_current_active_user, get_batch_owned_by_user
from app.db.session import get_db
from app.models.batch import Batch, BatchStatus
from app.models.sheet import Sheet, SheetStatus
from app.models.rubric import Rubric, RubricParsingStatus
from app.models.evaluation import Evaluation
from app.models.user import User
from app.schemas.batch import (
    BatchCreate, BatchOut, BatchListOut, BatchStatusResponse,
    UploadSheetsResponse, StartProcessingResponse,
)
from app.schemas.rubric import RubricUploadResponse
from app.services.storage import StorageService
from app.core.utils import validate_file_magic
from app.core.logging import get_logger
from app.core.config import settings

router = APIRouter(prefix="/batches", tags=["batches"])
logger = get_logger(__name__)

ALLOWED_SHEET_TYPES = ["pdf", "jpeg", "png", "zip"]
ALLOWED_RUBRIC_TYPES = ["pdf"]
MAX_FILE_SIZE = 50 * 1024 * 1024   # 50 MB
MAX_BATCH_SIZE = 500 * 1024 * 1024  # 500 MB
ZIP_BOMB_RATIO = 50


# ─── Batch CRUD ──────────────────────────────────────────────────────────────

@router.post("/", response_model=BatchOut, status_code=status.HTTP_201_CREATED)
async def create_batch(
    body: BatchCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new evaluation batch."""
    batch = Batch(
        user_id=current_user.id,
        name=body.name,
        subject=body.subject,
        max_score_per_sheet=body.max_score_per_sheet,
        enable_student_portal=body.enable_student_portal,
        student_access_code=body.student_access_code,
    )
    db.add(batch)
    await db.flush()
    await db.refresh(batch)
    return BatchOut.model_validate(batch)


@router.get("/", response_model=list[BatchListOut])
async def list_batches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all batches for the authenticated user with pagination."""
    query = select(Batch).where(Batch.user_id == current_user.id)
    if status_filter:
        try:
            query = query.where(Batch.status == BatchStatus(status_filter))
        except ValueError:
            pass
    query = query.order_by(Batch.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    batches = result.scalars().all()
    return [BatchListOut.model_validate(b) for b in batches]


@router.get("/{batch_id}", response_model=BatchOut)
async def get_batch(
    batch: Batch = Depends(get_batch_owned_by_user),
):
    """Get full batch details."""
    return BatchOut.model_validate(batch)


# ─── File uploads ─────────────────────────────────────────────────────────────

@router.post("/{batch_id}/upload-sheets", response_model=UploadSheetsResponse)
async def upload_sheets(
    batch_id: str,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload answer sheets (PDF, JPEG, PNG, or ZIP).
    Validates magic bytes, extracts ZIPs, uploads originals to Supabase.
    """
    batch = await _get_owned_batch(batch_id, current_user.id, db)
    storage = StorageService()
    created_sheets = []
    total_bytes = 0

    for upload_file in files:
        file_bytes = await upload_file.read()

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File {upload_file.filename} exceeds 50MB limit",
            )

        total_bytes += len(file_bytes)
        if total_bytes > MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Total batch size exceeds 500MB limit",
            )

        # Validate magic bytes
        try:
            file_type = validate_file_magic(file_bytes, ALLOWED_SHEET_TYPES)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))

        if file_type == "zip":
            # Extract ZIP and process each inner file
            inner_sheets = await _process_zip(
                file_bytes, batch_id, storage, db, upload_file.filename or "upload.zip"
            )
            created_sheets.extend(inner_sheets)
        else:
            sheet = await _upload_single_sheet(
                file_bytes=file_bytes,
                filename=upload_file.filename or f"sheet_{uuid.uuid4()}.pdf",
                file_type=file_type,
                batch_id=batch_id,
                storage=storage,
                db=db,
            )
            created_sheets.append(sheet)

    # Update batch total_sheets count
    batch.total_sheets = (batch.total_sheets or 0) + len(created_sheets)
    await db.flush()

    return UploadSheetsResponse(
        batch_id=batch_id,
        sheets_received=len(created_sheets),
        sheets=[
            {"id": s.id, "filename": s.original_file_path, "status": s.status.value}
            for s in created_sheets
        ],
    )


@router.post("/{batch_id}/upload-rubric", response_model=RubricUploadResponse)
async def upload_rubric(
    batch_id: str,
    question_paper: UploadFile = File(...),
    marking_scheme: UploadFile = File(...),
    guidelines: str = Form(""),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload question paper + marking scheme PDFs for a batch."""
    batch = await _get_owned_batch(batch_id, current_user.id, db)
    storage = StorageService()

    qp_bytes = await question_paper.read()
    ms_bytes = await marking_scheme.read()

    # Validate both are PDFs
    for name, fb in [("question_paper", qp_bytes), ("marking_scheme", ms_bytes)]:
        try:
            validate_file_magic(fb, ["pdf"])
        except ValueError:
            raise HTTPException(422, detail=f"{name} must be a PDF file")

    # Upload to Supabase
    qp_path = f"{batch_id}/rubric/question_paper_{uuid.uuid4()}.pdf"
    ms_path = f"{batch_id}/rubric/marking_scheme_{uuid.uuid4()}.pdf"

    await storage.upload_file(settings.SUPABASE_BUCKET_RUBRICS, qp_path, qp_bytes, "application/pdf")
    await storage.upload_file(settings.SUPABASE_BUCKET_RUBRICS, ms_path, ms_bytes, "application/pdf")

    # Create or update Rubric record
    result = await db.execute(select(Rubric).where(Rubric.batch_id == batch_id))
    rubric = result.scalar_one_or_none()

    if rubric:
        rubric.question_paper_path = qp_path
        rubric.marking_scheme_path = ms_path
        rubric.guidelines = guidelines or None
        rubric.parsing_status = RubricParsingStatus.pending
    else:
        rubric = Rubric(
            batch_id=batch_id,
            question_paper_path=qp_path,
            marking_scheme_path=ms_path,
            guidelines=guidelines or None,
        )
        db.add(rubric)

    await db.flush()
    await db.refresh(rubric)

    return RubricUploadResponse(
        rubric_id=rubric.id,
        batch_id=batch_id,
        message="Rubric uploaded successfully. Processing will begin when you start the batch.",
    )


@router.post("/{batch_id}/start", response_model=StartProcessingResponse)
async def start_batch(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger batch processing via Celery."""
    batch = await _get_owned_batch(batch_id, current_user.id, db)

    if batch.total_sheets == 0:
        raise HTTPException(422, detail="Upload answer sheets before starting")

    result = await db.execute(select(Rubric).where(Rubric.batch_id == batch_id))
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(422, detail="Upload a rubric before starting")

    if batch.status in (BatchStatus.processing, BatchStatus.completed):
        raise HTTPException(
            422, detail=f"Batch is already {batch.status.value}"
        )

    batch.status = BatchStatus.processing
    batch.processing_started_at = datetime.now(timezone.utc)
    await db.flush()

    # Enqueue master Celery task
    from app.workers.tasks.batch_tasks import process_batch
    process_batch.delay(batch_id)

    estimated = batch.total_sheets * 3  # ~3 seconds per sheet estimate

    return StartProcessingResponse(
        message="Processing started",
        batch_id=batch_id,
        estimated_time_seconds=estimated,
    )


@router.get("/{batch_id}/status", response_model=BatchStatusResponse)
async def get_batch_status(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Live processing status — polled by frontend every 3 seconds."""
    batch = await _get_owned_batch(batch_id, current_user.id, db)

    result = await db.execute(
        select(Sheet.id, Sheet.roll_number, Sheet.status)
        .where(Sheet.batch_id == batch_id)
    )
    sheet_rows = result.all()

    progress = (
        batch.processed_sheets / batch.total_sheets * 100
        if batch.total_sheets > 0 else 0
    )
    remaining = max(0, batch.total_sheets - batch.processed_sheets) * 3

    return BatchStatusResponse(
        batch_id=batch_id,
        status=batch.status,
        total_sheets=batch.total_sheets,
        processed_sheets=batch.processed_sheets,
        flagged_count=batch.flagged_count,
        progress_percent=round(progress, 1),
        estimated_remaining_seconds=remaining,
        sheet_statuses=[
            {"sheet_id": r[0], "roll_number": r[1], "status": r[2].value}
            for r in sheet_rows
        ],
    )


@router.get("/{batch_id}/results")
async def get_batch_results(
    batch_id: str,
    sort_by: str = Query("roll_number", pattern="^(roll_number|percentage|total_marks)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    filter_status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Full grade table for a batch. Powers the TanStack Table frontend."""
    batch = await _get_owned_batch(batch_id, current_user.id, db)

    query = select(Sheet).where(Sheet.batch_id == batch_id)
    if filter_status:
        try:
            query = query.where(Sheet.status == SheetStatus(filter_status))
        except ValueError:
            pass

    sort_col = {
        "roll_number": Sheet.roll_number,
        "percentage": Sheet.percentage,
        "total_marks": Sheet.total_awarded_marks,
    }.get(sort_by, Sheet.roll_number)

    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    sheets = result.scalars().all()

    rows = []
    for sheet in sheets:
        ev_result = await db.execute(
            select(Evaluation).where(Evaluation.sheet_id == sheet.id)
        )
        evals = ev_result.scalars().all()

        rows.append({
            "sheet_id": sheet.id,
            "roll_number": sheet.roll_number,
            "student_name": sheet.student_name,
            "status": sheet.status.value,
            "grade": sheet.grade,
            "percentage": sheet.percentage,
            "total_awarded_marks": sheet.total_awarded_marks,
            "total_max_marks": sheet.total_max_marks,
            "is_flagged": sheet.status == SheetStatus.flagged,
            "evaluations": [
                {
                    "q_no": str(e.q_no),
                    "awarded_marks": e.awarded_marks,
                    "max_marks": e.max_marks,
                    "verdict": e.verdict.value,
                }
                for e in evals
            ],
        })

    return {"batch_id": batch_id, "total": len(rows), "page": page, "data": rows}


@router.get("/{batch_id}/sheets/{sheet_id}")
async def get_sheet_detail(
    batch_id: str,
    sheet_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Sheet detail with signed URLs for annotated images."""
    batch = await _get_owned_batch(batch_id, current_user.id, db)

    result = await db.execute(
        select(Sheet).where(Sheet.id == sheet_id, Sheet.batch_id == batch_id)
    )
    sheet = result.scalar_one_or_none()
    if not sheet:
        raise HTTPException(404, detail="Sheet not found")

    storage = StorageService()

    # Generate signed URLs for annotated images
    annotated_urls = []
    for path in (sheet.annotated_image_paths or []):
        try:
            url = await storage.get_signed_url(settings.SUPABASE_BUCKET_ANNOTATED, path, 3600)
            annotated_urls.append(url)
        except Exception:
            annotated_urls.append("")

    pdf_url = None
    if sheet.annotated_pdf_path:
        try:
            pdf_url = await storage.get_signed_url(
                settings.SUPABASE_BUCKET_ANNOTATED, sheet.annotated_pdf_path, 3600
            )
        except Exception:
            pass

    ev_result = await db.execute(select(Evaluation).where(Evaluation.sheet_id == sheet_id))
    evals = ev_result.scalars().all()

    return {
        "sheet_id": sheet.id,
        "roll_number": sheet.roll_number,
        "student_name": sheet.student_name,
        "status": sheet.status.value,
        "grade": sheet.grade,
        "percentage": sheet.percentage,
        "total_awarded_marks": sheet.total_awarded_marks,
        "total_max_marks": sheet.total_max_marks,
        "annotated_page_urls": annotated_urls,
        "annotated_pdf_url": pdf_url,
        "evaluations": [
            {
                "id": e.id,
                "q_no": str(e.q_no),
                "question_type": e.question_type,
                "page_number": e.page_number,
                "student_answer_transcribed": e.student_answer_transcribed,
                "awarded_marks": e.awarded_marks,
                "max_marks": e.max_marks,
                "verdict": e.verdict.value,
                "reason": e.reason,
                "ai_confidence": e.ai_confidence,
                "bbox": {
                    "x": e.bbox_x, "y": e.bbox_y, "w": e.bbox_w, "h": e.bbox_h
                },
                "is_flagged": e.is_flagged,
                "is_reviewed": e.is_reviewed,
            }
            for e in evals
        ],
    }


@router.get("/{batch_id}/analytics")
async def get_batch_analytics(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Score distributions, per-question metrics, grade breakdown."""
    await _get_owned_batch(batch_id, current_user.id, db)

    sheets_result = await db.execute(
        select(Sheet).where(Sheet.batch_id == batch_id)
    )
    sheets = sheets_result.scalars().all()

    # Score distribution (10% buckets 0–100)
    buckets = {f"{i}-{i+9}%": 0 for i in range(0, 100, 10)}
    grade_dist = {"A+": 0, "A": 0, "B+": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    pass_count = fail_count = 0

    for s in sheets:
        if s.percentage is not None:
            bucket_idx = min(int(s.percentage // 10) * 10, 90)
            bucket_key = f"{bucket_idx}-{bucket_idx + 9}%"
            buckets[bucket_key] = buckets.get(bucket_key, 0) + 1

            if s.percentage >= 40:
                pass_count += 1
            else:
                fail_count += 1

        if s.grade:
            grade_dist[s.grade] = grade_dist.get(s.grade, 0) + 1

    # Per-question averages
    evals_result = await db.execute(
        select(Evaluation.q_no, func.avg(Evaluation.awarded_marks), func.avg(Evaluation.max_marks))
        .join(Sheet, Evaluation.sheet_id == Sheet.id)
        .where(Sheet.batch_id == batch_id)
        .group_by(Evaluation.q_no)
        .order_by(Evaluation.q_no)
    )
    q_stats = [
        {
            "q_no": str(row[0]),
            "avg_awarded": round(float(row[1] or 0), 2),
            "avg_max": round(float(row[2] or 0), 2),
            "avg_percentage": round(float(row[1] or 0) / float(row[2] or 1) * 100, 1),
        }
        for row in evals_result.all()
    ]

    hardest = sorted(q_stats, key=lambda x: x["avg_percentage"])[:3]
    easiest = sorted(q_stats, key=lambda x: x["avg_percentage"], reverse=True)[:3]

    return {
        "batch_id": batch_id,
        "score_distribution": buckets,
        "grade_distribution": grade_dist,
        "pass_count": pass_count,
        "fail_count": fail_count,
        "per_question_stats": q_stats,
        "hardest_questions": hardest,
        "easiest_questions": easiest,
    }


# ─── Helpers ─────────────────────────────────────────────────────────────────

async def _get_owned_batch(batch_id: str, user_id: str, db: AsyncSession) -> Batch:
    result = await db.execute(
        select(Batch).where(Batch.id == batch_id, Batch.user_id == user_id)
    )
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=403, detail="Batch not found or access denied")
    return batch


async def _upload_single_sheet(
    file_bytes: bytes,
    filename: str,
    file_type: str,
    batch_id: str,
    storage: StorageService,
    db: AsyncSession,
) -> Sheet:
    """Upload a single sheet file to Supabase and create a DB record."""
    file_uuid = str(uuid.uuid4())
    storage_path = f"{batch_id}/{file_uuid}/{filename}"
    content_type = {
        "pdf": "application/pdf",
        "jpeg": "image/jpeg",
        "png": "image/png",
    }.get(file_type, "application/octet-stream")

    await storage.upload_file(settings.SUPABASE_BUCKET_SHEETS, storage_path, file_bytes, content_type)

    sheet = Sheet(
        batch_id=batch_id,
        original_file_path=storage_path,
        status=SheetStatus.uploaded,
    )
    db.add(sheet)
    await db.flush()
    return sheet


async def _process_zip(
    zip_bytes: bytes,
    batch_id: str,
    storage: StorageService,
    db: AsyncSession,
    zip_filename: str,
) -> list[Sheet]:
    """Extract ZIP and process each inner PDF/image. Check for zip bombs."""
    sheets = []
    try:
        buf = io.BytesIO(zip_bytes)
        with zipfile.ZipFile(buf, "r") as zf:
            # Zip bomb check
            total_compressed = len(zip_bytes)
            total_uncompressed = sum(info.file_size for info in zf.infolist())
            if total_uncompressed > ZIP_BOMB_RATIO * total_compressed:
                raise HTTPException(
                    422, detail=f"ZIP file appears to be a zip bomb (ratio {total_uncompressed // total_compressed}x)"
                )

            for member in zf.infolist():
                # Skip hidden files and macOS artifacts
                if member.filename.startswith("__MACOSX") or member.filename.startswith("."):
                    continue
                if member.is_dir():
                    continue

                inner_bytes = zf.read(member.filename)
                if not inner_bytes:
                    continue

                try:
                    from app.core.utils import validate_file_magic
                    file_type = validate_file_magic(inner_bytes, ["pdf", "jpeg", "png"])
                except ValueError:
                    continue  # Skip unsupported inner files

                filename = member.filename.split("/")[-1]
                sheet = await _upload_single_sheet(
                    file_bytes=inner_bytes,
                    filename=filename,
                    file_type=file_type,
                    batch_id=batch_id,
                    storage=storage,
                    db=db,
                )
                sheets.append(sheet)

    except zipfile.BadZipFile:
        raise HTTPException(422, detail=f"{zip_filename} is not a valid ZIP file")

    return sheets
