"""
app/core/redis.py
─────────────────
Async Redis client — single connection pool shared across all coroutines.
Works with Upstash Redis, Redis Cloud, or any redis:// compatible URL.
"""

import logging
from typing import Optional

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.core.config import settings

logger = logging.getLogger("ai_service.core.redis")

# Module-level pool — created once per Gunicorn worker process
_redis_pool: Optional[Redis] = None


async def get_redis() -> Redis:
    """Return the shared async Redis connection pool."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_keepalive=True,
            health_check_interval=30,
        )
        logger.info("Redis connection pool initialised.")
    return _redis_pool


async def close_redis() -> None:
    """Gracefully close the Redis connection pool (call on app shutdown)."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
        logger.info("Redis connection pool closed.")


async def redis_ping() -> bool:
    """Health-check helper — returns True if Redis is reachable."""
    try:
        r = await get_redis()
        return await r.ping()
    except Exception as exc:
        logger.warning(f"Redis ping failed: {str(exc)}")
        return False
