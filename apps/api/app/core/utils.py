"""
Shared utilities: retry decorator with exponential backoff, file magic byte validation,
text sanitization.
"""

import asyncio
import functools
from typing import Callable, TypeVar
from app.core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


def retry_async(max_attempts: int = 3, base_delay: float = 1.0):
    """
    Async retry decorator with exponential backoff.
    Delays: 1s, 2s, 4s for max_attempts=3.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(
                            "Retrying after error",
                            func=func.__name__,
                            attempt=attempt + 1,
                            delay=delay,
                            error=str(e),
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            "All retry attempts exhausted",
                            func=func.__name__,
                            attempts=max_attempts,
                            error=str(e),
                        )
            raise last_exception
        return wrapper
    return decorator


# ─── Magic byte validation ──────────────────────────────────────────────────

MAGIC_BYTES = {
    "pdf":  b"%PDF",
    "jpeg": bytes([0xFF, 0xD8, 0xFF]),
    "png":  bytes([0x89, 0x50, 0x4E, 0x47]),
    "zip":  bytes([0x50, 0x4B, 0x03, 0x04]),
}


def detect_file_type(file_bytes: bytes) -> str | None:
    """
    Detect file type by reading magic bytes.
    Returns: 'pdf', 'jpeg', 'png', 'zip', or None if unknown.
    """
    for file_type, magic in MAGIC_BYTES.items():
        if file_bytes[:len(magic)] == magic:
            return file_type
    return None


def validate_file_magic(file_bytes: bytes, allowed_types: list[str]) -> str:
    """
    Validate file type via magic bytes. Returns detected type or raises ValueError.
    """
    detected = detect_file_type(file_bytes)
    if detected not in allowed_types:
        raise ValueError(
            f"Invalid file type. Detected: {detected!r}. Allowed: {allowed_types}"
        )
    return detected


def sanitize_text_field(value: str | None, max_length: int = 50) -> str | None:
    """
    Sanitize AI-extracted text: strip whitespace, remove non-printable chars, truncate.
    """
    if value is None:
        return None
    cleaned = "".join(c for c in value if c.isprintable())
    return cleaned.strip()[:max_length]
