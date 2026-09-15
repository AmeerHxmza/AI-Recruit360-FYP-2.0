"""Recruit360 API: synchronous, retryable AI workflows for local FYP use."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings
from app.core.logging_config import configure_logging
from app.core.rate_limit import limiter
from app.core.auth import verify_service_secret
from app.api.routes import health, screening, assessments, interviews, evaluations

# ── Configure structured logging first ────────────────────────────────────────
configure_logging()

import logging
logger = logging.getLogger("ai_service.main")


# ── Application Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Startup & Shutdown lifecycle for AI-Recruit360 engine.
    """
    logger.info(
        f"AI-Recruit360 starting up | env={settings.ENVIRONMENT} | "
        f"provider={settings.AI_PROVIDER}"
    )
    yield
    logger.info("AI-Recruit360 shut down cleanly.")


# ── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="AI-Recruit360 Intelligence Engine",
    description=(
        "Python FastAPI Recruitment Service for "
        "CV Screening, Personalized MCQs, Adaptive AI Interviews, and Final "
        "Candidate Evaluations."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# ── Rate Limiter (must be attached to app.state before routes are added) ──────
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": "Too many requests. Please slow down and try again.",
            "retry_after": str(exc.retry_after) if hasattr(exc, "retry_after") else "60",
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log the full stack trace securely to the backend logs
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    # Return a masked 500 response to the client
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Something went wrong. Please try again."
        }
    )

# ── Security Headers Middleware ───────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ── CORS Middleware (explicit origins + regex for Vercel preview URLs) ───────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight for 10 minutes
)

# ── API Routers ───────────────────────────────────────────────────────────────
# Health endpoints are public (no auth) — used by Render health checks
app.include_router(health.router, prefix="/api/v1")

# All AI service endpoints require shared secret authentication
app.include_router(screening.router, prefix="/api/v1", dependencies=[Depends(verify_service_secret)])
app.include_router(assessments.router, prefix="/api/v1", dependencies=[Depends(verify_service_secret)])
app.include_router(interviews.router, prefix="/api/v1", dependencies=[Depends(verify_service_secret)])
app.include_router(evaluations.router, prefix="/api/v1", dependencies=[Depends(verify_service_secret)])


# ── Root Redirect ─────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "service": "AI-Recruit360 Python AI Engine",
        "version": "2.0.0",
        "health": "/api/v1/health",
        "docs": "/docs" if settings.ENVIRONMENT != "production" else "disabled",
    }


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.AI_SERVICE_PORT,
        reload=True,
    )

