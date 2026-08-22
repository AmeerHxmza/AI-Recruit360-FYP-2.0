import logging
from typing import Dict, Any
from app.db.supabase import get_supabase_client
from app.services.screening.job_analyzer import analyze_job_requirements
from app.services.screening.cv_analyzer import parse_cv_text
from app.services.screening.agents import (
    evaluate_skills,
    evaluate_experience,
    evaluate_education,
    extract_evidence,
    synthesize_screening_decision
)
from app.schemas.screening import ScreeningDecisionResult
from app.core.exceptions import ScreeningError

logger = logging.getLogger("ai_service.services.screening.orchestrator")

async def run_screening_pipeline(
    application_id: str,
    job_title: str,
    job_description: str,
    job_requirements: str | None,
    cv_text: str,
    candidate_name: str = "Candidate",
    organization_id: str | None = None,
    candidate_id: str | None = None,
    job_id: str | None = None
) -> ScreeningDecisionResult:
    logger.info(f"Starting Multi-Agent CV Screening for Application: {application_id}")

    try:
        # Agent 1: Job Requirement Normalizer
        job_analysis = await analyze_job_requirements(job_title, job_description, job_requirements)

        # Agent 2: CV Extractor & Parser
        cv_data = await parse_cv_text(cv_text, candidate_name)

        # Agent 3: Skills Agent
        skills_eval = evaluate_skills(job_analysis, cv_data)

        # Agent 4: Experience Agent
        exp_eval = evaluate_experience(job_analysis, cv_data)

        # Agent 5: Education Agent
        edu_eval = evaluate_education(job_analysis, cv_data)

        # Agent 6: Evidence Agent
        evidence = extract_evidence(job_analysis, cv_data, skills_eval["matched"])

        # Agent 7: Decision Agent
        decision = synthesize_screening_decision(
            job_analysis, cv_data, skills_eval, exp_eval, edu_eval, evidence
        )

        # Persist result to Supabase cv_screenings table
        supabase = get_supabase_client()
        
        # Prepare JSON serializable evidence
        evidence_json = [e.model_dump() for e in decision.evidence]
        
        screening_payload = {
            "application_id": application_id,
            "match_score": decision.match_score,
            "skills_score": decision.skills_score,
            "experience_score": decision.experience_score,
            "education_score": decision.education_score,
            "relevance_score": decision.relevance_score,
            "recommendation": decision.recommendation,
            "matched_skills": decision.matched_skills,
            "missing_skills": decision.missing_skills,
            "matched_experience": decision.matched_experience,
            "missing_requirements": decision.missing_requirements,
            "evidence": evidence_json,
            "reasoning_summary": decision.reasoning_summary,
            "status": "completed",
        }

        # Check existing screening record
        res = supabase.table("cv_screenings").select("id").eq("application_id", application_id).execute()
        if res.data and len(res.data) > 0:
            supabase.table("cv_screenings").update(screening_payload).eq("application_id", application_id).execute()
        else:
            supabase.table("cv_screenings").insert(screening_payload).execute()

        # Update application stage to assessment or knocked_out
        target_stage = "assessment" if decision.qualified else "knocked_out"
        supabase.table("applications").update({"stage": target_stage}).eq("id", application_id).execute()

        # Log AI Activity
        if organization_id:
            try:
                supabase.table("ai_activity_logs").insert({
                    "organization_id": organization_id,
                    "application_id": application_id,
                    "job_id": job_id,
                    "event_type": "cv_screened",
                    "status": "success",
                    "metadata": {
                        "match_score": decision.match_score,
                        "qualified": decision.qualified,
                        "recommendation": decision.recommendation,
                    }
                }).execute()
            except Exception as log_err:
                logger.warning(f"Failed to write AI activity log: {str(log_err)}")

        return decision

    except Exception as e:
        logger.error(f"Screening pipeline error for app {application_id}: {str(e)}")
        # Failure recovery
        try:
            supabase = get_supabase_client()
            supabase.table("cv_screenings").upsert({
                "application_id": application_id,
                "status": "failed",
                "reasoning_summary": f"Screening pipeline error: {str(e)}"
            }).execute()
        except Exception:
            pass
        raise ScreeningError(f"Multi-Agent CV screening failed: {str(e)}")
