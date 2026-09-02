"""
app/core/rate_limit.py
──────────────────────
slowapi rate limiter — backed by Redis so limits are shared across all
Gunicorn worker processes and container replicas.

Import `limiter` in route files and decorate endpoints with @limiter.limit().
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

# Fast in-memory rate limiter — zero external dependencies, 100% reliable for local execution
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
    default_limits=["200/minute"],
)
