"""
app/workers/tasks.py
────────────────────
ARQ background task definitions for all heavy AI operations.

These tasks are QUEUED by the API routes (instant HTTP response) and
EXECUTED by the ARQ worker process (see worker.py).  Results are written
directly to Supabase, and the frontend reacts via Supabase Realtime.

Each task must accept `ctx` as its first argument (ARQ context dict).
"""

import logging
from typing import List, Optional

logger = logging.getLogger("ai_service.workers.tasks")


# ── CV Screening Task ─────────────────────────────────────────────────────────

async def task_screen_cv(
    ctx: dict,
    application_id: str,
    job_title: str,
    job_description: str,
    job_requirements: Optional[str],
    cv_text: str,
    candidate_name: str = "Candidate",
    organization_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    job_id: Optional[str] = None,
) -> dict:
    """
    Background CV screening pipeline.
    Queued by POST /screening/screen-application when run in async mode.
    """
    from app.services.screening.orchestrator import run_screening_pipeline

    logger.info(f"[ARQ] Starting CV screening for application_id={application_id}")
    try:
        result = await run_screening_pipeline(
            application_id=application_id,
            job_title=job_title,
            job_description=job_description,
            job_requirements=job_requirements,
            cv_text=cv_text,
            candidate_name=candidate_name,
            organization_id=organization_id,
            candidate_id=candidate_id,
            job_id=job_id,
        )
        logger.info(
            f"[ARQ] CV screening completed for application_id={application_id} "
            f"score={result.match_score} qualified={result.qualified}"
        )
        return result.model_dump()
    except Exception as exc:
        logger.error(f"[ARQ] CV screening failed for application_id={application_id}: {exc}")
        raise


# ── MCQ Assessment Generation Task ───────────────────────────────────────────

async def task_generate_assessment(
    ctx: dict,
    application_id: str,
    job_title: str,
    job_description: str,
    matched_skills: List[str],
    cv_summary: Optional[str] = None,
) -> list:
    """Background MCQ generation task."""
    from app.services.assessment.generator import generate_personalized_mcqs

    logger.info(f"[ARQ] Generating assessment for application_id={application_id}")
    try:
        items = await generate_personalized_mcqs(
            application_id=application_id,
            job_title=job_title,
            job_description=job_description,
            matched_skills=matched_skills,
            cv_summary=cv_summary,
        )
        logger.info(f"[ARQ] Assessment generated: {len(items)} MCQs for application_id={application_id}")
        return [i.model_dump() for i in items]
    except Exception as exc:
        logger.error(f"[ARQ] Assessment generation failed for application_id={application_id}: {exc}")
        raise


# ── Final Evaluation Task ─────────────────────────────────────────────────────

async def task_generate_evaluation(
    ctx: dict,
    application_id: str,
) -> dict:
    """Background final evaluation task."""
    from app.services.evaluation.evaluator import generate_final_candidate_evaluation

    logger.info(f"[ARQ] Generating final evaluation for application_id={application_id}")
    try:
        result = await generate_final_candidate_evaluation(application_id)
        logger.info(f"[ARQ] Final evaluation completed for application_id={application_id}")
        return result.model_dump()
    except Exception as exc:
        logger.error(f"[ARQ] Final evaluation failed for application_id={application_id}: {exc}")
        raise

# ── Maintenance Tasks ─────────────────────────────────────────────────────────

async def cleanup_abandoned_interviews(ctx: dict) -> None:
    """Cron job to transition idle in_progress interviews to abandoned."""
    from app.db.supabase import get_supabase_client, run_sync
    import datetime
    
    logger.info("[ARQ] Running cleanup_abandoned_interviews")
    try:
        threshold = (datetime.datetime.utcnow() - datetime.timedelta(minutes=15)).isoformat()
        supabase = get_supabase_client()
        
        res = await run_sync(
            lambda: supabase.table("interviews")
            .update({"status": "abandoned"})
            .eq("status", "in_progress")
            .lt("updated_at", threshold)
            .execute()
        )
        
        if res.data and len(res.data) > 0:
            logger.info(f"[ARQ] Abandoned {len(res.data)} idle interviews.")
    except Exception as exc:
        logger.error(f"[ARQ] Cleanup abandoned interviews failed: {exc}")
