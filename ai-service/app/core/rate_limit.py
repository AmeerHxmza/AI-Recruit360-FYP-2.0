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

# Single global limiter instance — storage_uri points at Redis so
# request counts are consistent across all worker processes.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=["200/minute"],  # Global fallback limit per IP
)
