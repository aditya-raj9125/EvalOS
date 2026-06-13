"""API v1 main router — mounts all endpoint routers."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, batches, review, student, exports

router = APIRouter()

router.include_router(auth.router)
router.include_router(batches.router)
router.include_router(review.router)
router.include_router(student.router)
router.include_router(exports.router)
