"""
app/core/cache.py
─────────────────────────────────────────────────────────────────────────────
Redis-backed distributed cache — replaces the old single-process in-memory
dict. Safe across multiple Gunicorn workers and Kubernetes pods.

Usage (anywhere in the codebase):
    from app.core.cache import cache_get, cache_set, cache_delete

    result = await cache_get("job_analysis:abc123")
    if result is None:
        result = await expensive_operation()
        await cache_set("job_analysis:abc123", result, ttl_seconds=3600)
"""

import json
import logging
from typing import Any, Optional

from app.core.redis import get_redis
from app.core.config import settings

logger = logging.getLogger("ai_service.core.cache")


async def cache_get(key: str) -> Optional[Any]:
    """
    Retrieve a value from Redis cache.
    Returns None on cache miss or if Redis is unreachable.
    """
    try:
        r = await get_redis()
        raw = await r.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as exc:
        logger.warning(f"Cache GET error for key '{key}': {exc}")
        return None


async def cache_set(
    key: str,
    value: Any,
    ttl_seconds: Optional[int] = None,
) -> bool:
    """
    Store a JSON-serialisable value in Redis with an optional TTL.
    Falls back gracefully if Redis is unreachable (does not raise).
    Returns True on success.
    """
    ttl = ttl_seconds if ttl_seconds is not None else settings.REDIS_CACHE_TTL_SECONDS
    try:
        r = await get_redis()
        serialised = json.dumps(value, default=str)
        await r.setex(key, ttl, serialised)
        return True
    except Exception as exc:
        logger.warning(f"Cache SET error for key '{key}': {exc}")
        return False


async def cache_delete(key: str) -> bool:
    """Invalidate a cache key. Returns True on success."""
    try:
        r = await get_redis()
        await r.delete(key)
        return True
    except Exception as exc:
        logger.warning(f"Cache DELETE error for key '{key}': {exc}")
        return False


async def cache_exists(key: str) -> bool:
    """Check if a key exists in the cache without loading its value."""
    try:
        r = await get_redis()
        return bool(await r.exists(key))
    except Exception:
        return False

