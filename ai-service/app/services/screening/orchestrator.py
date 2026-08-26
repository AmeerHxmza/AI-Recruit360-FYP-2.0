import logging
from typing import Dict, Any, Optional

from app.db.supabase import get_supabase_client, run_sync
from app.repositories.application_repo import get_application_context, get_candidate_cv_bytes
from app.services.cv.extractor import extract_text_from_bytes
from app.services.screening.job_analyzer import analyze_job_requirements
from app.services.screening.cv_analyzer import parse_cv_text
from app.services.screening.agents import (
    evaluate_skills,
    evaluate_experience,
    evaluate_education,
    extract_evidence,
    synthesize_screening_decision,
)
from app.schemas.screening import ScreeningDecisionResult
from app.services.ai_activity import log_ai_activity

logger = logging.getLogger("ai_service.services.screening.orchestrator")


async def run_screening_pipeline(application_id: str) -> Optional[ScreeningDecisionResult]:
    logger.info(f"Starting Multi-Agent CV Screening for Application: {application_id}")
    
    supabase = get_supabase_client()

    # 0. Idempotency Check (non-blocking)
    existing_screening = await run_sync(
        lambda: supabase.table("cv_screenings")
        .select("match_score, recommendation, skills_score, experience_score, education_score, keyword_score, matched_skills, missing_skills, matched_experience, missing_requirements, evidence, reasoning_summary")
        .eq("application_id", application_id)
        .eq("processing_status", "completed")
        .limit(1)
        .execute()
    )

    if existing_screening.data and len(existing_screening.data) > 0:
        logger.info(f"Screening for {application_id} already completed. Returning existing.")
        data = existing_screening.data[0]
        return ScreeningDecisionResult(
            match_score=data.get("match_score", 0.0),
            recommendation=data.get("recommendation", "no_match"),
            qualified=data.get("recommendation") in ["match", "strong_match"],
            skills_score=data.get("skills_score", 0.0),
            experience_score=data.get("experience_score", 0.0),
            education_score=data.get("education_score", 0.0),
            relevance_score=data.get("keyword_score", 0.0),
            matched_skills=data.get("matched_skills", []),
            missing_skills=data.get("missing_skills", []),
            matched_experience=data.get("matched_experience", []),
            missing_requirements=data.get("missing_requirements", []),
            evidence=data.get("evidence", []),
            reasoning_summary=data.get("reasoning_summary", "")
        )

    # 1. Fetch necessary context (blocking via run_sync under the hood, but awaited)
    try:
        app_data, job_data, cand_data = await get_application_context(application_id)
    except Exception as e:
        logger.error(f"Failed to fetch context for {application_id}: {e}")
        return None

    # 2. Extract CV text from storage
    try:
        cv_bytes = await get_candidate_cv_bytes(application_id)
        cv_text = extract_text_from_bytes(cv_bytes, "cv.pdf", "application/pdf") # We guess PDF if unknown, extractor has fallbacks
    except Exception as e:
        logger.error(f"Failed to fetch/extract CV for {application_id}: {e}")
        await run_sync(
            lambda: supabase.table("applications")
            .update({"status": "extraction_failed"})
            .eq("id", application_id)
            .execute()
        )
        return ScreeningDecisionResult(
            match_score=0.0,
            recommendation="no_match",
            qualified=False,
            skills_score=0.0,
            experience_score=0.0,
            education_score=0.0,
            relevance_score=0.0,
            matched_skills=[],
            missing_skills=[],
            matched_experience=[],
            missing_requirements=[],
            evidence=[],
            reasoning_summary=f"CV Extraction Failed: {e}"
        )

    job_title = job_data.get("title", "")
    job_description = job_data.get("description", "")
    job_requirements = job_data.get("requirements")
    candidate_name = cand_data.get("full_name", "Candidate")
    organization_id = app_data.get("organization_id")
    job_id = app_data.get("job_id")

    # ── Agent 1 & 2: Job Requirement Normalizer & CV Extractor (CONCURRENT) ────
    import asyncio
    job_analysis, cv_data = await asyncio.gather(
        analyze_job_requirements(job_title, job_description, job_requirements),
        parse_cv_text(cv_text, candidate_name),
    )

    # ── Agent 3–5: Scoring Agents (pure CPU — no I/O, no await needed) ─────────
    skills_eval = evaluate_skills(job_analysis, cv_data)
    exp_eval = evaluate_experience(job_analysis, cv_data)
    edu_eval = evaluate_education(job_analysis, cv_data)

    # ── Agent 6: Evidence Extraction ────────────────────────────────────────────
    evidence = extract_evidence(job_analysis, cv_data, skills_eval["matched"])

    # ── Agent 7: Final Decision Synthesis ───────────────────────────────────────
    decision = synthesize_screening_decision(
        job_analysis, cv_data, skills_eval, exp_eval, edu_eval, evidence
    )

    # ── Database Persistence (non-blocking via run_sync) ────────────────────────
    try:
        evidence_json = [e.model_dump() for e in decision.evidence]

        screening_payload: Dict[str, Any] = {
            "application_id": application_id,
            "organization_id": organization_id,
            "match_score": decision.match_score,
            "skills_score": decision.skills_score,
            "experience_score": decision.experience_score,
            "education_score": decision.education_score,
            "keyword_score": decision.relevance_score,
            "recommendation": decision.recommendation,
            "matched_skills": decision.matched_skills,
            "missing_skills": decision.missing_skills,
            "matched_experience": decision.matched_experience,
            "missing_requirements": decision.missing_requirements,
            "evidence": evidence_json,
            "reasoning_summary": decision.reasoning_summary,
            "processing_status": "completed",
        }

        # Upsert screening record (non-blocking)
        existing_check = await run_sync(
            lambda: supabase.table("cv_screenings")
            .select("id")
            .eq("application_id", application_id)
            .execute()
        )

        if existing_check.data:
            await run_sync(
                lambda: supabase.table("cv_screenings")
                .update(screening_payload)
                .eq("application_id", application_id)
                .execute()
            )
        else:
            await run_sync(
                lambda: supabase.table("cv_screenings")
                .insert(screening_payload)
                .execute()
            )

        # Update application pipeline stage (non-blocking)
        target_stage = "assessment" if decision.qualified else "knocked_out"
        await run_sync(
            lambda: supabase.table("applications")
            .update({"status": target_stage})
            .eq("id", application_id)
            .execute()
        )

        # Log AI Activity
        if organization_id:
            await log_ai_activity(
                application_id=application_id,
                event_type="cv_screened",
                organization_id=organization_id,
                metadata={
                    "job_id": job_id,
                    "match_score": decision.match_score,
                    "qualified": decision.qualified,
                    "recommendation": decision.recommendation,
                }
            )

    except Exception as db_err:
        logger.warning(f"Supabase DB sync warning during CV screening: {db_err}")

    return decision

