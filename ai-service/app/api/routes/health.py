"""
app/api/routes/health.py
─────────────────────────
Enhanced health check endpoints for Kubernetes liveness / readiness probes.
"""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.redis import redis_ping
from app.db.supabase import get_supabase_client, run_sync

logger = logging.getLogger("ai_service.api.routes.health")
router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="Full service health check")
async def health_check() -> JSONResponse:
    """
    Returns 200 when service is healthy, 503 when a critical dependency is down.
    Used for Kubernetes readiness probe.
    """
    redis_ok = await redis_ping()
    supabase_ok = False
    try:
        supabase = get_supabase_client()
        # Just a simple ping to see if DB is reachable
        await run_sync(lambda: supabase.table("organizations").select("id").limit(1).execute())
        supabase_ok = True
    except Exception as e:
        logger.error(f"Health check failed to connect to Supabase: {e}")

    is_ok = redis_ok and supabase_ok

    payload = {
        "status": "ok" if is_ok else "degraded",
        "service": "AI-Recruit360 Python AI Engine",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "cv_pass_threshold": settings.CV_PASS_THRESHOLD,
        "assessment_pass_threshold": settings.ASSESSMENT_PASS_THRESHOLD,
        "dependencies": {
            "redis": "ok" if redis_ok else "unavailable",
            "supabase": "ok" if supabase_ok else "unavailable",
        },
    }

    status_code = 200 if is_ok else 503
    return JSONResponse(content=payload, status_code=status_code)


@router.get("/live", summary="Kubernetes liveness probe")
async def liveness() -> dict:
    """Always returns 200 — process is alive."""
    return {"status": "alive"}


@router.get("/ready", summary="Kubernetes readiness probe")
async def readiness() -> JSONResponse:
    """Returns 200 only when all dependencies are ready to serve traffic."""
    redis_ok = await redis_ping()
    supabase_ok = False
    try:
        supabase = get_supabase_client()
        await run_sync(lambda: supabase.table("organizations").select("id").limit(1).execute())
        supabase_ok = True
    except Exception:
        pass

    if not redis_ok or not supabase_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready", 
                "reason": "Dependencies unavailable",
                "redis": redis_ok,
                "supabase": supabase_ok
            },
        )
    return JSONResponse(status_code=200, content={"status": "ready"})

