"""
app/core/keep_alive.py
───────────────────────
Automated Background Keep-Alive Worker for Render Free Tier.

Every 12 minutes (safely under Render's 15-minute inactivity timeout),
this task sends an HTTP GET request to the service's public URL /api/v1/health/live.
This generates inbound traffic on Render's HTTP routing layer, resetting the idle
timer and keeping the container 100% active 24/7.
"""

import asyncio
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger("ai_service.keep_alive")

_keep_alive_task: asyncio.Task | None = None


async def _keep_alive_loop() -> None:
    """Continuous loop pinging the public Render URL."""
    base_url = settings.RENDER_EXTERNAL_URL.rstrip("/")
    target_url = f"{base_url}/api/v1/health/live"
    interval_seconds = max(60, settings.KEEP_ALIVE_INTERVAL_MINUTES * 60)

    logger.info(
        f"[KeepAlive] Worker started. Target: {target_url} | Interval: {settings.KEEP_ALIVE_INTERVAL_MINUTES} mins"
    )

    # Initial brief delay before starting periodic pings so app finishes boot
    await asyncio.sleep(30)

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            try:
                logger.info(f"[KeepAlive] Sending heartbeat ping to {target_url}...")
                response = await client.get(
                    target_url,
                    headers={"User-Agent": "AI-Recruit360-KeepAlive/2.0"},
                )
                if response.status_code == 200:
                    logger.info(
                        f"[KeepAlive] Heartbeat SUCCESS (HTTP {response.status_code}) - Container kept active."
                    )
                else:
                    logger.warning(
                        f"[KeepAlive] Heartbeat returned unexpected HTTP {response.status_code}: {response.text[:200]}"
                    )
            except asyncio.CancelledError:
                logger.info("[KeepAlive] Task cancelled. Shutting down keep-alive worker.")
                break
            except Exception as exc:
                logger.warning(f"[KeepAlive] Heartbeat ping error (will retry next interval): {exc}")

            try:
                await asyncio.sleep(interval_seconds)
            except asyncio.CancelledError:
                logger.info("[KeepAlive] Sleep interrupted. Shutting down keep-alive worker.")
                break


def start_keep_alive_worker() -> None:
    """Start the keep-alive background task if enabled."""
    global _keep_alive_task
    if not settings.ENABLE_KEEP_ALIVE:
        logger.info("[KeepAlive] Keep-alive worker is disabled in settings.")
        return

    if _keep_alive_task is None or _keep_alive_task.done():
        _keep_alive_task = asyncio.create_task(_keep_alive_loop())
        logger.info("[KeepAlive] Background keep-alive task scheduled successfully.")


def stop_keep_alive_worker() -> None:
    """Gracefully cancel the keep-alive background task."""
    global _keep_alive_task
    if _keep_alive_task and not _keep_alive_task.done():
        _keep_alive_task.cancel()
        logger.info("[KeepAlive] Cancel signal sent to keep-alive worker.")
