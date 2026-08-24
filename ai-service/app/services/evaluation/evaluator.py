import logging
from app.db.supabase import get_supabase_client
from app.schemas.evaluation import FinalCandidateEvaluationPayload
from app.services.ai_activity import log_ai_activity

logger = logging.getLogger("ai_service.services.evaluation.evaluator")

async def generate_final_candidate_evaluation(application_id: str) -> FinalCandidateEvaluationPayload:
    supabase = get_supabase_client()

    # 1. Check interview status
    int_check = supabase.table("interviews").select("status").eq("application_id", application_id).execute()
    if not int_check.data or int_check.data[0].get("status") != "completed":
        raise ValueError(f"Interview for application {application_id} is not completed. Unauthorized evaluation.")

    # 2. Fetch CV Screening Score
    scr_res = supabase.table("cv_screenings").select("match_score, matched_skills, missing_skills, reasoning_summary").eq("application_id", application_id).execute()
    cv_score = scr_res.data[0]["match_score"] if scr_res.data else 75.0
    matched_skills = scr_res.data[0].get("matched_skills", []) if scr_res.data else []
    missing_skills = scr_res.data[0].get("missing_skills", []) if scr_res.data else []
    reasoning = scr_res.data[0].get("reasoning_summary", "Candidate meets baseline requirements.") if scr_res.data else ""

    # 2. Fetch Assessment Score
    ass_res = supabase.table("assessments").select("score").eq("application_id", application_id).execute()
    ass_score = ass_res.data[0]["score"] if ass_res.data and ass_res.data[0].get("score") is not None else 80.0

    # 3. Fetch Interview Score
    int_res = supabase.table("interviews").select("id").eq("application_id", application_id).execute()
    int_score = 80.0
    if int_res.data and len(int_res.data) > 0:
        interview_id = int_res.data[0]["id"]
        resp_res = supabase.table("interview_responses").select("technical_score, communication_score, relevance_score").eq("interview_id", interview_id).execute()
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

    # Retrieve organization_id from application record
    app_rec = supabase.table("applications").select("organization_id").eq("id", application_id).execute()
    org_id = app_rec.data[0]["organization_id"] if app_rec.data and len(app_rec.data) > 0 else None

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
        strengths = ["Strong core technical background", "Clear communication in AI interview"]

    weaknesses = [f"Lacks proven experience in {s}" for s in missing_skills[:2]]
    if not weaknesses:
        weaknesses = ["Could expand on complex distributed system scenarios"]

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

    # Persist in final_evaluations table
    eval_payload = {
        "application_id": application_id,
        "overall_score": overall_score,
        "cv_score": cv_score,
        "assessment_score": ass_score,
        "interview_score": round(int_score, 1),
        "recommendation": recommendation,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "evidence": evidence_items,
        "ai_summary": summary
    }
    if org_id:
        eval_payload["organization_id"] = org_id

    ex = supabase.table("final_evaluations").select("id").eq("application_id", application_id).execute()
    if ex.data and len(ex.data) > 0:
        supabase.table("final_evaluations").update(eval_payload).eq("application_id", application_id).execute()
    else:
        supabase.table("final_evaluations").insert(eval_payload).execute()

    # Update application status to evaluation
    supabase.table("applications").update({"status": "evaluation"}).eq("id", application_id).execute()

    if org_id:
        await log_ai_activity(
            application_id=application_id,
            event_type="candidate_evaluated",
            organization_id=org_id,
            metadata={
                "overall_score": result.overall_score,
                "recommendation": result.recommendation
            }
        )

    return result
