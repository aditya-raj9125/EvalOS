"""
PDF and image processing service.
Handles PDF→PIL image conversion, preprocessing, base64 encoding for Gemini.
"""

import base64
import io
from typing import Optional

import fitz  # PyMuPDF
from pdf2image import convert_from_bytes
from PIL import Image, ImageEnhance

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

MAX_DIMENSION = 2480  # A4 at 200 DPI


class PDFProcessor:
    """Converts PDFs and images into preprocessed PIL Images for AI evaluation."""

    def convert_pdf_to_images(
        self, pdf_bytes: bytes, dpi: int = 200
    ) -> list[Image.Image]:
        """
        Convert PDF bytes → list of PIL Images (one per page).
        DPI=200: optimal speed/accuracy tradeoff.
        Returns empty list on corrupted PDF (error is logged).
        """
        try:
            poppler_path = settings.POPPLER_PATH if settings.POPPLER_PATH else None
            images = convert_from_bytes(
                pdf_bytes,
                dpi=dpi,
                poppler_path=poppler_path,
                fmt="png",
                thread_count=2,
            )
            logger.info("PDF converted", pages=len(images), dpi=dpi)
            return images
        except Exception as e:
            logger.error("PDF conversion failed", error=str(e))
            return []

    def convert_image_to_standard(self, image_bytes: bytes) -> Image.Image:
        """
        Open raw JPEG/PNG bytes, convert to RGB, resize to max MAX_DIMENSION on
        the longest side maintaining aspect ratio.
        """
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")  # Remove alpha channel if PNG

        # Resize if needed
        max_dim = max(img.width, img.height)
        if max_dim > MAX_DIMENSION:
            scale = MAX_DIMENSION / max_dim
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)
            logger.info("Image resized", original_max=max_dim, new_size=(new_w, new_h))

        return img

    def preprocess_for_ai(self, pil_image: Image.Image) -> Image.Image:
        """
        Light preprocessing to improve AI accuracy.
        Mild contrast (1.2) + sharpness (1.1) — no binarization.
        """
        img = pil_image.convert("RGB")
        img = ImageEnhance.Contrast(img).enhance(1.2)
        img = ImageEnhance.Sharpness(img).enhance(1.1)
        return img

    def image_to_base64(self, pil_image: Image.Image) -> str:
        """
        Convert PIL Image to base64-encoded JPEG string for Gemini API.
        Quality=90 for the JPEG encoding.
        """
        buf = io.BytesIO()
        pil_image.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> tuple[str, bool]:
        """
        Extract text from PDF using PyMuPDF.
        Returns (text, needs_ocr).
        needs_ocr=True when extracted text < 50 chars (scanned/image PDF).
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()

            full_text = "\n".join(text_parts).strip()
            needs_ocr = len(full_text) < 50
            if needs_ocr:
                logger.info("PDF appears to be scanned — OCR fallback needed")
            return full_text, needs_ocr
        except Exception as e:
            logger.error("PDF text extraction failed", error=str(e))
            return "", True
