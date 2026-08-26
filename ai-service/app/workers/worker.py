"""
app/workers/worker.py
─────────────────────
ARQ worker entrypoint.

Start the background worker with:
    python -m app.workers.worker

Or via Docker (add a second service in docker-compose / render.yaml):
    CMD ["python", "-m", "app.workers.worker"]
"""

import logging

from arq import run_worker
from arq.connections import RedisSettings

from app.core.config import settings
from app.core.logging_config import configure_logging
from app.workers.tasks import task_screen_cv, task_generate_assessment, task_generate_evaluation

configure_logging()
logger = logging.getLogger("ai_service.workers.worker")


class WorkerSettings:
    """ARQ worker configuration."""

    # Register all background task functions
    functions = [
        task_screen_cv,
        task_generate_assessment,
        task_generate_evaluation,
    ]

    from arq.cron import cron
    from app.workers.tasks import cleanup_abandoned_interviews
    cron_jobs = [
        cron(cleanup_abandoned_interviews, minute=set(range(0, 60, 5)))
    ]

    # Redis connection for the worker with cloud network resiliency
    _rs = RedisSettings.from_dsn(settings.REDIS_URL)
    _rs.conn_timeout = 10
    _rs.conn_retries = 10
    _rs.conn_retry_delay = 2
    _rs.retry_on_timeout = True
    redis_settings = _rs

    # How many concurrent jobs this worker will process
    max_jobs = 10

    # Job timeout — AI operations can be long
    job_timeout = 300  # 5 minutes maximum per job

    # Keep job results for 24 hours (for status polling)
    keep_result = settings.REDIS_JOB_TTL_SECONDS

    # Retry failed jobs up to 2 times with 30s delay
    max_tries = 3

    async def on_startup(ctx: dict) -> None:
        logger.info("ARQ Worker starting up.")

    async def on_shutdown(ctx: dict) -> None:
        logger.info("ARQ Worker shutting down.")


if __name__ == "__main__":
    run_worker(WorkerSettings)  # type: ignore[arg-type]
