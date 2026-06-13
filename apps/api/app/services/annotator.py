"""
Pillow annotation engine.
Draws OMR-style marks (ticks, crosses, partial) on answer sheet images.
Professional appearance matching manual grading standards.
"""

import io
import os
import asyncio
import tempfile
from typing import Optional
from PIL import Image, ImageDraw, ImageFont

from app.core.logging import get_logger
from app.services.storage import StorageService
from app.core.config import settings

logger = get_logger(__name__)

# Color constants (RGB)
COLOR_GREEN = (34, 197, 94)
COLOR_RED = (239, 68, 68)
COLOR_AMBER = (245, 158, 11)
COLOR_GRAY = (156, 163, 175)
COLOR_BLUE = (37, 99, 235)
COLOR_WHITE = (255, 255, 255)
COLOR_DARK_NAVY = (15, 23, 42)

# Lighter versions for box borders (semi-transparent effect)
COLOR_GREEN_LIGHT = (134, 239, 172)
COLOR_RED_LIGHT = (252, 165, 165)
COLOR_AMBER_LIGHT = (253, 211, 77)
COLOR_GRAY_LIGHT = (209, 213, 219)


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load DejaVu font or fallback to default."""
    font_paths_regular = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    font_paths_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/DejaVuSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    paths = font_paths_bold if bold else font_paths_regular
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def _draw_tick(draw: ImageDraw.Draw, x: int, y: int, size: int = 18) -> None:
    """Draw a green checkmark tick at (x, y)."""
    # Tick: short line down-left then longer line up-right
    draw.line([(x, y + size // 2), (x + size // 3, y + size)], fill=COLOR_GREEN, width=3)
    draw.line([(x + size // 3, y + size), (x + size, y)], fill=COLOR_GREEN, width=3)


def _draw_cross(draw: ImageDraw.Draw, x: int, y: int, size: int = 18) -> None:
    """Draw a red X cross at (x, y)."""
    draw.line([(x, y), (x + size, y + size)], fill=COLOR_RED, width=3)
    draw.line([(x + size, y), (x, y + size)], fill=COLOR_RED, width=3)


def _draw_tilde(draw: ImageDraw.Draw, x: int, y: int, size: int = 18) -> None:
    """Draw an amber wavy tilde at (x, y) — approximated as two arcs."""
    mid_y = y + size // 2
    draw.line([(x, mid_y), (x + size // 3, mid_y - 4), (x + size * 2 // 3, mid_y + 4), (x + size, mid_y)],
              fill=COLOR_AMBER, width=3, joint="curve")


def _draw_dash(draw: ImageDraw.Draw, x: int, y: int, size: int = 18) -> None:
    """Draw a gray dash for skipped questions."""
    mid_y = y + size // 2
    draw.line([(x, mid_y), (x + size, mid_y)], fill=COLOR_GRAY, width=3)


def _draw_text_with_bg(
    draw: ImageDraw.Draw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.FreeTypeFont,
    text_color: tuple,
    padding: int = 3,
) -> None:
    """Draw text with a white rounded rectangle background for readability."""
    bbox = draw.textbbox((x, y), text, font=font)
    bg_x0 = bbox[0] - padding
    bg_y0 = bbox[1] - padding
    bg_x1 = bbox[2] + padding
    bg_y1 = bbox[3] + padding
    draw.rectangle([bg_x0, bg_y0, bg_x1, bg_y1], fill=COLOR_WHITE)
    draw.text((x, y), text, fill=text_color, font=font)


def _get_verdict_color(verdict: str) -> tuple:
    if verdict in ("correct", "diagram_correct"):
        return COLOR_GREEN
    elif verdict in ("wrong", "diagram_wrong"):
        return COLOR_RED
    elif verdict in ("partial", "diagram_partial"):
        return COLOR_AMBER
    elif verdict == "skipped":
        return COLOR_GRAY
    return COLOR_GRAY


def _get_border_color(verdict: str) -> tuple:
    if verdict in ("correct", "diagram_correct"):
        return COLOR_GREEN_LIGHT
    elif verdict in ("wrong", "diagram_wrong"):
        return COLOR_RED_LIGHT
    elif verdict in ("partial", "diagram_partial"):
        return COLOR_AMBER_LIGHT
    return COLOR_GRAY_LIGHT


class AnnotationEngine:
    """
    Draws OMR-style marks on answer sheet images using Pillow.
    Output looks like professional manual grading with ticks, crosses, and partial marks.
    """

    def __init__(self):
        self.storage = StorageService()

    def annotate_sheet_sync(self, sheet_id: str) -> None:
        """Synchronous entry point (Celery). Annotates all pages, compiles PDF."""
        from app.db.session import SyncSessionFactory
        from app.models.sheet import Sheet, SheetStatus
        from app.models.evaluation import Evaluation

        db = SyncSessionFactory()
        try:
            sheet = db.query(Sheet).filter(Sheet.id == sheet_id).first()
            if not sheet:
                raise ValueError(f"Sheet {sheet_id} not found")

            evaluations = db.query(Evaluation).filter(Evaluation.sheet_id == sheet_id).all()
            # Group by page number
            evals_by_page: dict[int, list] = {}
            for e in evaluations:
                evals_by_page.setdefault(e.page_number, []).append(e)

            annotated_paths = []
            loop = asyncio.new_event_loop()

            try:
                for page_idx, page_path in enumerate(sheet.page_image_paths or []):
                    page_number = page_idx + 1

                    image_bytes = loop.run_until_complete(
                        self.storage.download_file(settings.SUPABASE_BUCKET_SHEETS, page_path)
                    )
                    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

                    page_evals = evals_by_page.get(page_number, [])
                    annotated_img = self.annotate_page(pil_img, page_evals)

                    annotated_path = f"{sheet.batch_id}/{sheet_id}/annotated_page_{page_number}.png"
                    loop.run_until_complete(
                        self.storage.upload_image(
                            settings.SUPABASE_BUCKET_ANNOTATED, annotated_path, annotated_img
                        )
                    )
                    annotated_paths.append(annotated_path)

                # Compile PDF
                pdf_bytes = self._compile_annotated_pdf(sheet_id, annotated_paths, loop)
                pdf_path = f"{sheet.batch_id}/{sheet_id}/annotated_full.pdf"
                loop.run_until_complete(
                    self.storage.upload_file(
                        settings.SUPABASE_BUCKET_ANNOTATED, pdf_path, pdf_bytes, "application/pdf"
                    )
                )
            finally:
                loop.close()

            sheet.annotated_image_paths = annotated_paths
            sheet.annotated_pdf_path = pdf_path
            sheet.status = SheetStatus.completed
            db.commit()

            logger.info("Sheet annotated", sheet_id=sheet_id, pages=len(annotated_paths))

        except Exception as e:
            logger.error("Annotation failed", sheet_id=sheet_id, error=str(e))
            db.rollback()
            raise
        finally:
            db.close()

    def annotate_page(self, pil_image: Image.Image, evaluations: list) -> Image.Image:
        """
        Draw marks on a single page image for all its evaluations.
        Returns annotated PIL Image.
        """
        img = pil_image.copy()
        draw = ImageDraw.Draw(img)
        img_w, img_h = img.size

        font_marks = _load_font(16, bold=True)
        font_reason = _load_font(11)
        font_flag = _load_font(11, bold=True)
        font_summary = _load_font(14, bold=True)

        page_awarded = 0.0
        page_max = 0.0

        for ev in evaluations:
            # Convert bbox fractions → pixels
            bx = int((ev.bbox_x or 0.05) * img_w)
            by = int((ev.bbox_y or 0.05) * img_h)
            bw = int((ev.bbox_w or 0.5) * img_w)
            bh = int((ev.bbox_h or 0.1) * img_h)

            # Enforce minimum box size
            bw = max(bw, 60)
            bh = max(bh, 30)

            # Clamp to image bounds
            bx = min(bx, img_w - bw - 5)
            by = min(by, img_h - bh - 5)

            verdict = str(ev.verdict.value if hasattr(ev.verdict, "value") else ev.verdict)
            color = _get_verdict_color(verdict)
            border_color = _get_border_color(verdict)

            # Draw bounding box border
            draw.rectangle([bx, by, bx + bw, by + bh], outline=border_color, width=2)

            # Draw verdict mark at top-left corner of bbox
            mark_x = bx + 4
            mark_y = by + 4

            if verdict in ("correct", "diagram_correct"):
                _draw_tick(draw, mark_x, mark_y)
                marks_text = f"+{ev.awarded_marks:g}"
            elif verdict in ("wrong", "diagram_wrong"):
                _draw_cross(draw, mark_x, mark_y)
                marks_text = "0"
            elif verdict in ("partial", "diagram_partial"):
                _draw_tilde(draw, mark_x, mark_y)
                marks_text = f"+{ev.awarded_marks:g}/{ev.max_marks:g}"
            else:  # skipped
                _draw_dash(draw, mark_x, mark_y)
                marks_text = "0"

            # Draw marks text with white bg
            _draw_text_with_bg(draw, marks_text, mark_x + 24, mark_y, font_marks, color)

            # Flagged indicator
            if ev.is_flagged:
                flag_x = bx + bw - 50
                flag_y = by + 2
                # Small amber triangle
                draw.polygon(
                    [(flag_x + 8, flag_y), (flag_x, flag_y + 12), (flag_x + 16, flag_y + 12)],
                    fill=COLOR_AMBER,
                )
                _draw_text_with_bg(draw, "⚑ Review", flag_x + 18, flag_y + 2, font_flag, COLOR_AMBER)

            page_awarded += ev.awarded_marks
            page_max += ev.max_marks

        # Draw summary box top-right corner
        summary_text = f"Total: {page_awarded:g}/{page_max:g}"
        sb_w, sb_h = 180, 36
        sb_x = img_w - sb_w - 12
        sb_y = 10

        draw.rectangle([sb_x, sb_y, sb_x + sb_w, sb_y + sb_h], fill=COLOR_WHITE, outline=COLOR_BLUE, width=2)
        draw.text(
            (sb_x + 10, sb_y + 8),
            summary_text,
            fill=COLOR_DARK_NAVY,
            font=font_summary,
        )

        return img

    def _compile_annotated_pdf(self, sheet_id: str, annotated_paths: list, loop) -> bytes:
        """Download annotated images and compile into a single PDF using reportlab."""
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            c = canvas.Canvas(tmp_path)

            for path in annotated_paths:
                image_bytes = loop.run_until_complete(
                    self.storage.download_file(settings.SUPABASE_BUCKET_ANNOTATED, path)
                )
                pil_img = Image.open(io.BytesIO(image_bytes))
                img_w, img_h = pil_img.size
                aspect = img_h / img_w

                # Use A4 or original dimensions based on aspect ratio
                a4_w, a4_h = A4
                if 1.3 < aspect < 1.5:  # Close to A4
                    page_w, page_h = a4_w, a4_h
                else:
                    page_w = a4_w
                    page_h = page_w * aspect

                c.setPageSize((page_w, page_h))

                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as img_tmp:
                    img_tmp_path = img_tmp.name
                    pil_img.save(img_tmp_path, "PNG")

                c.drawImage(img_tmp_path, 0, 0, width=page_w, height=page_h)
                os.unlink(img_tmp_path)
                c.showPage()

            c.save()

            with open(tmp_path, "rb") as f:
                pdf_bytes = f.read()

            return pdf_bytes
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
