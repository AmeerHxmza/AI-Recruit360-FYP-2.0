"""
app/db/supabase.py
──────────────────
Supabase client singleton + async execution wrapper.

IMPORTANT: supabase-py uses a synchronous HTTP client internally. Calling it
directly inside `async def` route handlers blocks the event loop and degrades
performance at scale. Always use `run_sync()` to offload Supabase calls to a
thread pool.

Usage:
    from app.db.supabase import get_supabase_client, run_sync

    result = await run_sync(
        lambda: get_supabase_client().table("jobs").select("id, title").execute()
    )
"""

import asyncio
import logging
from typing import Any, Callable, TypeVar

from supabase import create_client, Client

from app.core.config import settings

logger = logging.getLogger("ai_service.db.supabase")

T = TypeVar("T")

# Module-level singleton — one client per Gunicorn worker process
_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Return the synchronous Supabase client singleton."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not key:
        logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.")
        url = url or "https://placeholder.supabase.co"
        key = key or "placeholder-key"

    _supabase_client = create_client(url, key)
    logger.info("Supabase client initialised.")
    return _supabase_client


async def run_sync(fn: Callable[[], T]) -> T:
    """
    Execute a synchronous Supabase (or any blocking I/O) call inside
    asyncio.to_thread() so it does NOT block the FastAPI event loop.

    Example:
        data = await run_sync(
            lambda: get_supabase_client()
                .table("cv_screenings")
                .insert(payload)
                .execute()
        )
    """
    return await asyncio.to_thread(fn)

