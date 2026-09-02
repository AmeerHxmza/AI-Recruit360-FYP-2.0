"""
app/core/cache.py
─────────────────
Lightweight in-memory cache with TTL for local execution. Zero external dependencies.
"""

import time
import logging
from typing import Any, Optional, Dict, Tuple

logger = logging.getLogger("ai_service.core.cache")

# In-memory storage: key -> (value, expiry_timestamp)
_MEMORY_CACHE: Dict[str, Tuple[Any, float]] = {}


async def cache_get(key: str) -> Optional[Any]:
    """Retrieve a value from in-memory cache if not expired."""
    entry = _MEMORY_CACHE.get(key)
    if entry is None:
        return None
    val, expiry = entry
    if time.time() > expiry:
        _MEMORY_CACHE.pop(key, None)
        return None
    return val


async def cache_set(
    key: str,
    value: Any,
    ttl_seconds: Optional[int] = 3600,
) -> bool:
    """Store a value in in-memory cache with TTL in seconds."""
    ttl = ttl_seconds if ttl_seconds is not None else 3600
    _MEMORY_CACHE[key] = (value, time.time() + ttl)
    return True


async def cache_delete(key: str) -> bool:
    """Invalidate a cache key."""
    _MEMORY_CACHE.pop(key, None)
    return True


async def cache_exists(key: str) -> bool:
    """Check if a non-expired key exists in the cache."""
    val = await cache_get(key)
    return val is not None

