"""
Export endpoints:
GET /batches/{id}/export/csv            — grade table CSV
GET /batches/{id}/export/excel          — grade table Excel with conditional formatting
GET /batches/{id}/export/annotated-zip  — ZIP of all annotated PDFs (streamed)
"""

import io
import zipfile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.batch import Batch, BatchStatus
from app.models.sheet import Sheet, SheetStatus
from app.models.evaluation import Evaluation
from app.models.user import User
from app.services.storage import StorageService
from app.services.export_service import ExportService
from app.core.config import settings
from app.core.logging import get_logger

router = APIRouter(tags=["exports"])
logger = get_logger(__name__)


async def _get_batch_data(batch_id: str, user_id: str, db: AsyncSession) -> tuple[Batch, list[dict]]:
    """Fetch batch + all sheets with evaluations for export."""
    result = await db.execute(
        select(Batch).where(Batch.id == batch_id, Batch.user_id == user_id)
    )
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(403, detail="Batch not found or access denied")

    sheets_result = await db.execute(
        select(Sheet).where(Sheet.batch_id == batch_id)
    )
    sheets = sheets_result.scalars().all()

    sheets_data = []
    for sheet in sheets:
        ev_result = await db.execute(select(Evaluation).where(Evaluation.sheet_id == sheet.id))
        evals = ev_result.scalars().all()

        sheets_data.append({
            "roll_number": sheet.roll_number,
            "student_name": sheet.student_name,
            "subject": batch.subject,
            "grade": sheet.grade,
            "percentage": sheet.percentage,
            "total_awarded_marks": sheet.total_awarded_marks,
            "total_max_marks": sheet.total_max_marks,
            "status": sheet.status.value,
            "annotated_pdf_path": sheet.annotated_pdf_path,
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

    return batch, sheets_data


@router.get("/batches/{batch_id}/export/csv")
async def export_csv(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Export grade table as CSV."""
    batch, sheets_data = await _get_batch_data(batch_id, current_user.id, db)

    exporter = ExportService()
    csv_bytes = exporter.generate_csv(batch.name, sheets_data)

    safe_name = "".join(c for c in batch.name if c.isalnum() or c in " _-")
    filename = f"{safe_name}_results.csv"

    return StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/batches/{batch_id}/export/excel")
async def export_excel(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Export grade table as Excel with conditional formatting."""
    batch, sheets_data = await _get_batch_data(batch_id, current_user.id, db)

    exporter = ExportService()
    excel_bytes = exporter.generate_excel(batch.name, sheets_data)

    safe_name = "".join(c for c in batch.name if c.isalnum() or c in " _-")
    filename = f"{safe_name}_results.xlsx"

    return StreamingResponse(
        iter([excel_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/batches/{batch_id}/export/annotated-zip")
async def export_annotated_zip(
    batch_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream a ZIP of all annotated PDFs for a batch."""
    batch, sheets_data = await _get_batch_data(batch_id, current_user.id, db)
    storage = StorageService()

    async def generate_zip():
        """Stream ZIP chunks without loading entire archive into memory."""
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
            for sheet in sheets_data:
                if not sheet.get("annotated_pdf_path"):
                    continue
                try:
                    pdf_bytes = await storage.download_file(
                        settings.SUPABASE_BUCKET_ANNOTATED, sheet["annotated_pdf_path"]
                    )
                    roll = sheet.get("roll_number") or "unknown"
                    name = sheet.get("student_name") or "student"
                    # Sanitize filename
                    safe_roll = "".join(c for c in roll if c.isalnum() or c in "-_")
                    safe_name = "".join(c for c in name if c.isalnum() or c in " -_")
                    member_name = f"{safe_roll}_{safe_name}_annotated.pdf"
                    zf.writestr(member_name, pdf_bytes)
                except Exception as e:
                    logger.warning("Skipping sheet in ZIP export", error=str(e))

        buf.seek(0)
        while chunk := buf.read(65536):  # 64KB chunks
            yield chunk

    safe_batch = "".join(c for c in batch.name if c.isalnum() or c in " _-")
    filename = f"{safe_batch}_annotated_sheets.zip"

    return StreamingResponse(
        generate_zip(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
