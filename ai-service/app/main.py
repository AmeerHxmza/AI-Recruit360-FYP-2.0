"""
app/main.py
───────────
AI-Recruit360 Python FastAPI Application Entry Point.

Improvements in this version:
 ✅ Async lifespan context for Redis pool open/close
 ✅ CORS restricted to explicit ALLOWED_ORIGINS (no wildcard)
 ✅ slowapi rate limiting attached (Redis-backed, multi-process safe)
 ✅ OpenTelemetry auto-instrumentation (when OTLP_ENDPOINT is configured)
 ✅ Structured JSON logging via structlog
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging_config import configure_logging
from app.core.rate_limit import limiter
from app.core.redis import get_redis, close_redis
from app.api.routes import health, screening, assessments, interviews, evaluations

# ── Configure structured logging first ────────────────────────────────────────
configure_logging()

import logging
logger = logging.getLogger("ai_service.main")


# ── OpenTelemetry (optional — only when OTLP_ENDPOINT is set) ────────────────
def _setup_telemetry(app: FastAPI) -> None:
    """Attach OpenTelemetry auto-instrumentation if OTLP_ENDPOINT is configured."""
    if not settings.OTLP_ENDPOINT:
        logger.info("OpenTelemetry disabled (OTLP_ENDPOINT not set).")
        return
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        provider = TracerProvider()
        headers = {}
        if settings.OTLP_HEADERS:
            for item in settings.OTLP_HEADERS.split(","):
                k, _, v = item.partition("=")
                headers[k.strip()] = v.strip()

        exporter = OTLPSpanExporter(endpoint=settings.OTLP_ENDPOINT, headers=headers)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)
        FastAPIInstrumentor.instrument_app(app, tracer_provider=provider)
        logger.info(f"OpenTelemetry tracing enabled → {settings.OTLP_ENDPOINT}")
    except ImportError:
        logger.warning("opentelemetry packages not installed — skipping telemetry setup.")


# ── Application Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Startup: initialise Redis connection pool.
    Shutdown: gracefully close Redis pool.
    """
    logger.info(
        f"AI-Recruit360 starting up | env={settings.ENVIRONMENT} | "
        f"provider={settings.AI_PROVIDER}"
    )
    # Pre-warm Redis connection pool
    try:
        await get_redis()
        logger.info("Redis connection pool ready.")
    except Exception as exc:
        logger.warning(f"Redis unavailable at startup (cache/rate-limiting degraded): {exc}")

    yield  # ← application runs here

    # Graceful shutdown
    await close_redis()
    logger.info("AI-Recruit360 shut down cleanly.")


# ── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="AI-Recruit360 Intelligence Engine",
    description=(
        "Python FastAPI Multi-Agent Recruitment Intelligence Service for "
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

# ── CORS Middleware (NO wildcard — explicit origins only) ─────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "x-ai-service-secret"],
    max_age=600,  # Cache preflight for 10 minutes
)

# ── API Routers ───────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api/v1")
app.include_router(screening.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(evaluations.router, prefix="/api/v1")

# ── OpenTelemetry ─────────────────────────────────────────────────────────────
_setup_telemetry(app)


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

