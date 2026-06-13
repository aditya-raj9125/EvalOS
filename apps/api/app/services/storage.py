"""
Supabase storage service with retry logic.
All methods implement exponential backoff via retry_async.
"""

import io
from typing import Optional

from supabase import create_client, Client
from PIL import Image

from app.core.config import settings
from app.core.utils import retry_async
from app.core.logging import get_logger

logger = get_logger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client


class StorageService:
    """Supabase Storage Service with exponential backoff retry on all operations."""

    def __init__(self):
        self.client = get_supabase_client()

    @retry_async(max_attempts=3, base_delay=1.0)
    async def upload_file(
        self,
        bucket: str,
        file_path: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream",
    ) -> dict:
        """Upload bytes to Supabase storage. Returns {path, url}."""
        try:
            response = self.client.storage.from_(bucket).upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            public_url = self.client.storage.from_(bucket).get_public_url(file_path)
            logger.info("File uploaded", bucket=bucket, path=file_path)
            return {"path": file_path, "url": public_url}
        except Exception as e:
            logger.error("Upload failed", bucket=bucket, path=file_path, error=str(e))
            raise

    @retry_async(max_attempts=3, base_delay=1.0)
    async def download_file(self, bucket: str, file_path: str) -> bytes:
        """Download file bytes from Supabase storage."""
        try:
            response = self.client.storage.from_(bucket).download(file_path)
            return response
        except Exception as e:
            logger.error("Download failed", bucket=bucket, path=file_path, error=str(e))
            raise

    @retry_async(max_attempts=3, base_delay=1.0)
    async def delete_file(self, bucket: str, file_path: str) -> None:
        """Delete a file from Supabase storage."""
        try:
            self.client.storage.from_(bucket).remove([file_path])
            logger.info("File deleted", bucket=bucket, path=file_path)
        except Exception as e:
            logger.error("Delete failed", bucket=bucket, path=file_path, error=str(e))
            raise

    @retry_async(max_attempts=3, base_delay=1.0)
    async def get_signed_url(
        self, bucket: str, file_path: str, expires_in: int = 3600
    ) -> str:
        """Return a time-limited signed URL for private file access."""
        try:
            response = self.client.storage.from_(bucket).create_signed_url(
                file_path, expires_in
            )
            return response["signedURL"]
        except Exception as e:
            logger.error("Signed URL failed", bucket=bucket, path=file_path, error=str(e))
            raise

    @retry_async(max_attempts=3, base_delay=1.0)
    async def upload_image(
        self, bucket: str, file_path: str, pil_image: Image.Image
    ) -> str:
        """Convert PIL Image to PNG bytes and upload. Returns storage path."""
        buf = io.BytesIO()
        pil_image.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        await self.upload_file(bucket, file_path, buf.read(), "image/png")
        return file_path

    async def ensure_bucket_exists(self, bucket_name: str) -> None:
        """Create bucket if it doesn't exist. Called on app startup."""
        try:
            buckets = self.client.storage.list_buckets()
            existing = [b.name for b in buckets]
            if bucket_name not in existing:
                self.client.storage.create_bucket(bucket_name, options={"public": False})
                logger.info("Bucket created", bucket=bucket_name)
        except Exception as e:
            logger.warning("Could not verify/create bucket", bucket=bucket_name, error=str(e))
