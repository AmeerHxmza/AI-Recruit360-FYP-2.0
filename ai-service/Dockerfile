# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder — Install all Python dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — Lean production image
# ──────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Prevent Python from writing .pyc files & buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Copy installed packages from builder stage (no dev tools in final image)
COPY --from=builder /install /usr/local

# Copy application source code
COPY . .

# Non-root user for security hardening
RUN addgroup --system aiservice && adduser --system --ingroup aiservice aiuser
USER aiuser

EXPOSE 8000

# ── Gunicorn with 4 Uvicorn workers ───────────────────────────────────────────
# --workers         : 4 processes (recommended: 2*CPU+1 in production)
# --worker-class    : UvicornWorker for async FastAPI
# --max-requests    : Restart workers after 1000 requests to prevent memory leaks
# --graceful-timeout: 30s for in-flight requests to finish on shutdown
# ─────────────────────────────────────────────────────────────────────────────
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--graceful-timeout", "30", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
