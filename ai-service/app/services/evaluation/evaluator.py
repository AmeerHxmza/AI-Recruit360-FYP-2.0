from app.core.operation_lock import serialized
import asyncio
import logging
from app.db.supabase import get_supabase_client, run_sync
from app.schemas.evaluation import FinalCandidateEvaluationPayload

logger = logging.getLogger("ai_service.services.evaluation.evaluator")

@serialized("evaluation")
async def generate_final_candidate_evaluation(application_id: str) -> FinalCandidateEvaluationPayload:
    supabase = get_supabase_client()

    # ── Concurrent data fetch (ALL queries in parallel via asyncio.gather) ─────
    int_check, scr_res, ass_res, int_res = await asyncio.gather(
        run_sync(lambda: supabase.table("interviews").select("status").eq("application_id", application_id).execute()),
        run_sync(lambda: supabase.table("cv_screenings").select("match_score, matched_skills, missing_skills, reasoning_summary").eq("application_id", application_id).execute()),
        run_sync(lambda: supabase.table("assessments").select("score, status").eq("application_id", application_id).execute()),
        run_sync(lambda: supabase.table("interviews").select("id").eq("application_id", application_id).execute()),
    )

    # 1. Check interview status
    if not int_check.data or int_check.data[0].get("status") != "completed":
        raise ValueError(f"Interview for application {application_id} is not completed. Unauthorized evaluation.")

    if not scr_res.data or scr_res.data[0].get("match_score") is None or not ass_res.data or ass_res.data[0].get("score") is None or ass_res.data[0].get("status") != "completed":
        raise ValueError("Complete screening and assessment before evaluation.")

    # 2. Fetch CV Screening Score
    cv_score = scr_res.data[0]["match_score"] if scr_res.data else None
    matched_skills = scr_res.data[0].get("matched_skills", []) if scr_res.data else []
    missing_skills = scr_res.data[0].get("missing_skills", []) if scr_res.data else []
    reasoning = scr_res.data[0].get("reasoning_summary", "Candidate meets baseline requirements.") if scr_res.data else ""

    # 3. Fetch Assessment Score
    ass_score = ass_res.data[0]["score"] if ass_res.data and ass_res.data[0].get("score") is not None else None

    # 4. Fetch Interview Score (from individual responses)
    int_score = None
    if int_res.data and len(int_res.data) > 0:
        interview_id = int_res.data[0]["id"]
        resp_res = await run_sync(
            lambda: supabase.table("interview_responses")
            .select("technical_score, communication_score, relevance_score")
            .eq("interview_id", interview_id)
            .execute()
        )
        if resp_res.data and len(resp_res.data) > 0:
            scores = []
            for r in resp_res.data:
                ts = r.get("technical_score")
                cs = r.get("communication_score")
                rs = r.get("relevance_score")
                item_scores = [s for s in (ts, cs, rs) if s is not None]
                if item_scores:
                    scores.append(sum(item_scores) / len(item_scores))
            if scores:
                int_score = sum(scores) / len(scores)

    if int_score is None:
        raise ValueError("Interview evidence is incomplete. Please retry evaluation after all responses are scored.")


    # Deterministic Weighted Scoring Formula:
    # CV Match = 40%, MCQ Score = 25%, Interview Score = 35%
    overall_score = round(
        cv_score * 0.40 +
        ass_score * 0.25 +
        int_score * 0.35,
        1
    )

    if overall_score >= 85.0:
        recommendation = "strong_hire"
    elif overall_score >= 70.0:
        recommendation = "hire"
    elif overall_score >= 55.0:
        recommendation = "review"
    else:
        recommendation = "no_hire"

    strengths = [f"Strong proficiency in {s}" for s in matched_skills[:3]]
    if not strengths:
        strengths = []

    weaknesses = [f"Lacks proven experience in {s}" for s in missing_skills[:2]]
    if not weaknesses:
        weaknesses = []

    evidence_items = [
        f"CV Screening Score: {cv_score}% match against role requirements.",
        f"Technical Assessment Score: {ass_score}% on 10 candidate-specific MCQs.",
        f"AI Interview Score: {round(int_score, 1)}% across technical interview questions."
    ]

    summary = (
        f"Comprehensive Candidate AI Evaluation Complete. Overall Composite Score: {overall_score}%. "
        f"Recommendation: {recommendation.upper().replace('_', ' ')}. {reasoning}"
    )

    result = FinalCandidateEvaluationPayload(
        cv_score=cv_score,
        assessment_score=ass_score,
        interview_score=round(int_score, 1),
        overall_score=overall_score,
        recommendation=recommendation,
        strengths=strengths,
        weaknesses=weaknesses,
        evidence=evidence_items,
        ai_summary=summary
    )

    saved = await run_sync(lambda: supabase.rpc("save_final_evaluation", {
        "_application": application_id, "_result": result.model_dump()
    }).execute())
    result = FinalCandidateEvaluationPayload.model_validate(saved.data)


    return result
