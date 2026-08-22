from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def health_check():
    return {
        "status": "ok",
        "service": "AI-Recruit360 Python AI Engine",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "cv_pass_threshold": settings.CV_PASS_THRESHOLD,
        "assessment_pass_threshold": settings.ASSESSMENT_PASS_THRESHOLD
    }
