"""
EvalAI FastAPI Application — main entry point.
- CORS, SlowAPI rate limiting, structured request logging
- Lifespan: DB + Redis health check, Supabase bucket creation
- WebSocket endpoint at /ws/batch/{batch_id}
- Custom error handlers following {success, error: {code, message, details}} schema
"""

import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.router import router as api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.websocket.manager import manager, redis_pubsub_listener
from app.websocket.events import build_event

configure_logging()
logger = get_logger(__name__)


# ─── Rate limiter ─────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Startup
    logger.info("EvalAI API starting up", environment=settings.ENVIRONMENT)

    # Test database connection
    try:
        from app.db.session import async_engine
        async with async_engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        logger.info("Database connection: OK")
    except Exception as e:
        logger.error("Database connection failed", error=str(e))

    # Test Redis connection
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        logger.info("Redis connection: OK")
    except Exception as e:
        logger.warning("Redis connection failed", error=str(e))

    # Initialize Gemini rate limiter
    try:
        from app.workers.rate_limiter import rate_limiter
        rate_limiter.initialize()
    except Exception as e:
        logger.warning("Rate limiter init failed", error=str(e))

    # Ensure Supabase buckets exist
    try:
        from app.services.storage import StorageService
        storage = StorageService()
        for bucket in [
            settings.SUPABASE_BUCKET_SHEETS,
            settings.SUPABASE_BUCKET_RUBRICS,
            settings.SUPABASE_BUCKET_ANNOTATED,
        ]:
            await storage.ensure_bucket_exists(bucket)
    except Exception as e:
        logger.warning("Supabase bucket setup failed", error=str(e))

    # Start Redis pub/sub listener as background task
    pubsub_task = asyncio.create_task(redis_pubsub_listener())

    yield

    # Shutdown
    pubsub_task.cancel()
    try:
        await pubsub_task
    except asyncio.CancelledError:
        pass

    from app.db.session import async_engine
    await async_engine.dispose()
    logger.info("EvalAI API shutdown complete")


# ─── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="EvalAI API",
    version="1.0.0",
    description="AI-powered exam evaluation platform — backend API",
    lifespan=lifespan,
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request logging middleware ───────────────────────────────────────────────

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "HTTP request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            response_time_ms=elapsed_ms,
        )
        return response


app.add_middleware(RequestLoggingMiddleware)


# ─── Error handlers ───────────────────────────────────────────────────────────

def _error_response(code: str, message: str, details=None, status_code: int = 500):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": code, "message": message, "details": details},
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return _error_response(
        code="VALIDATION_ERROR",
        message="Request validation failed",
        details=exc.errors(),
        status_code=422,
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", path=request.url.path, error=str(exc))
    return _error_response(
        code="INTERNAL_ERROR",
        message="An internal server error occurred",
        details=str(exc) if not settings.is_production else None,
        status_code=500,
    )

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return _error_response(
        code="HTTP_ERROR",
        message=exc.detail,
        status_code=exc.status_code,
    )


# ─── API routes ───────────────────────────────────────────────────────────────

app.include_router(api_router, prefix="/api/v1")


# ─── WebSocket endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws/batch/{batch_id}")
async def websocket_batch(websocket: WebSocket, batch_id: str):
    """
    WebSocket endpoint for real-time batch processing updates.
    Immediately sends current batch status on connect, then stays alive
    listening for disconnect.
    """
    await manager.connect(websocket, batch_id)
    await manager.send_initial_status(websocket, batch_id)

    try:
        while True:
            # Keep connection alive — client sends pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, batch_id)
    except Exception as e:
        logger.warning("WebSocket error", batch_id=batch_id, error=str(e))
        manager.disconnect(websocket, batch_id)


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "environment": settings.ENVIRONMENT}
