"""
Student portal endpoints — public, no auth required.
POST /student/lookup  — find result by roll number + access code
GET  /student/sheet/{sheet_id}/download — download annotated PDF
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
from fastapi.responses import StreamingResponse

from app.db.session import get_db
from app.models.sheet import Sheet, SheetStatus
from app.models.batch import Batch, BatchStatus
from app.models.evaluation import Evaluation
from app.services.storage import StorageService
from app.core.config import settings
from app.core.logging import get_logger

router = APIRouter(prefix="/student", tags=["student"])
logger = get_logger(__name__)

# Rate limiting handled by SlowAPI in main.py


class StudentLookupRequest(BaseModel):
    roll_number: str
    access_code: str


@router.post("/lookup")
async def student_lookup(
    body: StudentLookupRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint. Looks up student result by roll number + access code.
    Rate limited to 10 requests/minute per IP (configured in main.py).
    Does NOT distinguish between wrong roll number vs wrong code (security).
    """
    not_found_response = HTTPException(
        status_code=404,
        detail="No result found for this roll number and access code.",
    )

    # Find sheet matching roll_number where batch has matching access code
    result = await db.execute(
        select(Sheet)
        .join(Batch, Sheet.batch_id == Batch.id)
        .where(
            Sheet.roll_number == body.roll_number.strip(),
            Batch.student_access_code == body.access_code.strip(),
            Batch.enable_student_portal == True,
            Batch.status == BatchStatus.completed,
            Sheet.status.in_([SheetStatus.completed, SheetStatus.flagged]),
        )
        .limit(1)
    )
    sheet = result.scalar_one_or_none()

    if not sheet:
        raise not_found_response

    # Fetch batch
    batch_result = await db.execute(select(Batch).where(Batch.id == sheet.batch_id))
    batch = batch_result.scalar_one()

    # Fetch evaluations
    ev_result = await db.execute(
        select(Evaluation).where(Evaluation.sheet_id == sheet.id)
    )
    evals = ev_result.scalars().all()

    # Generate signed URLs (24-hour expiry)
    storage = StorageService()
    annotated_urls = []
    for path in (sheet.annotated_image_paths or []):
        try:
            url = await storage.get_signed_url(
                settings.SUPABASE_BUCKET_ANNOTATED, path, 86400
            )
            annotated_urls.append(url)
        except Exception:
            annotated_urls.append("")

    pdf_url = None
    if sheet.annotated_pdf_path:
        try:
            pdf_url = await storage.get_signed_url(
                settings.SUPABASE_BUCKET_ANNOTATED, sheet.annotated_pdf_path, 86400
            )
        except Exception:
            pass

    # Generate signed download token using itsdangerous
    from itsdangerous import URLSafeTimedSerializer
    signer = URLSafeTimedSerializer(settings.SECRET_KEY)
    download_token = signer.dumps(sheet.id, salt="sheet-download")

    return {
        "student_name": sheet.student_name,
        "roll_number": sheet.roll_number,
        "subject": batch.subject,
        "batch_name": batch.name,
        "total_awarded_marks": sheet.total_awarded_marks,
        "total_max_marks": sheet.total_max_marks,
        "percentage": sheet.percentage,
        "grade": sheet.grade,
        "annotated_page_urls": annotated_urls,
        "annotated_pdf_url": pdf_url,
        "download_token": download_token,
        "evaluated_at": batch.processing_completed_at.isoformat() if batch.processing_completed_at else None,
        "feedback": [
            {
                "q_no": str(e.q_no),
                "awarded_marks": e.awarded_marks,
                "max_marks": e.max_marks,
                "verdict": e.verdict.value,
                "reason": e.reason,
                "student_answer_transcribed": e.student_answer_transcribed,
            }
            for e in evals
        ],
    }


@router.get("/sheet/{sheet_id}/download")
async def download_annotated_pdf(
    sheet_id: str,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint with signed token validation.
    Returns annotated PDF as file download.
    Token expires in 24 hours.
    """
    from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

    signer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        signed_sheet_id = signer.loads(token, salt="sheet-download", max_age=86400)
    except SignatureExpired:
        raise HTTPException(403, detail="Download link has expired")
    except BadSignature:
        raise HTTPException(403, detail="Invalid download token")

    if signed_sheet_id != sheet_id:
        raise HTTPException(403, detail="Invalid download token for this sheet")

    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    if not sheet or not sheet.annotated_pdf_path:
        raise HTTPException(404, detail="Annotated PDF not available")

    storage = StorageService()
    try:
        pdf_bytes = await storage.download_file(
            settings.SUPABASE_BUCKET_ANNOTATED, sheet.annotated_pdf_path
        )
    except Exception:
        raise HTTPException(500, detail="Could not retrieve the annotated PDF")

    filename = f"{sheet.roll_number or 'student'}_{sheet.student_name or 'sheet'}_annotated.pdf"
    filename = "".join(c for c in filename if c.isalnum() or c in "-_.")

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
