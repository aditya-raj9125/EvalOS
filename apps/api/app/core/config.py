"""
EvalAI Application Settings
Uses pydantic-settings to read from environment variables.
Never access os.environ directly — always import and use `settings`.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://evalai:evalai_secret@localhost:5432/evalai"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET_SHEETS: str = "evalai-sheets"
    SUPABASE_BUCKET_RUBRICS: str = "evalai-rubrics"
    SUPABASE_BUCKET_ANNOTATED: str = "evalai-annotated"

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_RPM_LIMIT: int = 12

    # JWT Auth
    SECRET_KEY: str = "change-me-to-a-strong-secret-key-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # Workers
    MAX_WORKERS: int = 4

    # PDF Processing
    POPPLER_PATH: str = "/usr/bin"

    # App
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def sync_database_url(self) -> str:
        """Synchronous DB URL for Alembic and Celery tasks."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


# Singleton — import this everywhere
settings = Settings()
