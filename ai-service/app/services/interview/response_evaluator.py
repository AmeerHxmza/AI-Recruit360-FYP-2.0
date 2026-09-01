import logging
from app.providers.factory import get_ai_provider
from app.schemas.interview import InterviewResponseEvaluation
from app.db.supabase import get_supabase_client, run_sync

logger = logging.getLogger("ai_service.services.interview.response_evaluator")

SYSTEM_PROMPT = """You are an expert AI Interview Response Evaluator for AI-Recruit360.
Evaluate candidate spoken/written interview answers for technical accuracy, clarity, communication, and depth.
Provide objective scores out of 100 and constructive feedback."""

async def evaluate_interview_response(
    interview_id: str,
    question_id: str,
    response_text: str
) -> InterviewResponseEvaluation:
    # INPUT SANITIZATION: Truncate overly long responses to prevent prompt injection
    response_text = response_text[:5000].strip() if response_text else ""
    if not response_text:
        raise ValueError("Response text cannot be empty.")

    supabase = get_supabase_client()

    # SECURITY: Check interview status and existing answers
    int_res = await run_sync(lambda: supabase.table("interviews").select("status").eq("id", interview_id).execute())
    if not int_res.data or int_res.data[0].get("status") == "completed":
        raise ValueError(f"Interview {interview_id} is completed or not found. Cannot evaluate response.")

    existing = await run_sync(lambda: supabase.table("interview_responses").select("id").eq("question_id", question_id).execute())
    if existing.data and len(existing.data) > 0:
        raise ValueError(f"Question {question_id} has already been answered. Modification is not allowed.")

    # Get question text
    q_res = await run_sync(lambda: supabase.table("interview_questions").select("*").eq("id", question_id).execute())
    q_text = q_res.data[0]["question_text"] if q_res.data else "Technical Question"

    provider = get_ai_provider()
    prompt = (
        f"INTERVIEW QUESTION:\n{q_text}\n\n"
        f"CANDIDATE RESPONSE:\n{response_text}\n\n"
        f"Evaluate response quality, technical accuracy, and communication clarity."
    )

    try:
        eval_result = await provider.generate_structured(
            prompt=prompt,
            schema=InterviewResponseEvaluation,
            system_prompt=SYSTEM_PROMPT
        )
    except Exception as e:
        logger.warning(f"Response evaluation AI failed, using conservative fallback: {str(e)}")
        # SAFE fallback: conservative scores — AI failure should NOT give a free pass
        eval_result = InterviewResponseEvaluation(
            technical_score=50.0,
            communication_score=50.0,
            relevance_score=50.0,
            overall_score=50.0,
            feedback="Automated evaluation was unavailable. This response requires manual review.",
            strengths=["Response was provided"],
            areas_for_improvement=["Manual evaluation recommended"]
        )

    # Insert or update interview_responses table
    await run_sync(lambda: supabase.table("interview_responses").insert({
        "interview_id": interview_id,
        "question_id": question_id,
        "response_text": response_text,
        "transcript": response_text,
        "technical_score": eval_result.technical_score,
        "communication_score": eval_result.communication_score,
        "relevance_score": eval_result.relevance_score,
        "ai_feedback": eval_result.feedback
    }).execute())

    # Dynamically update interviews table with updated questions_answered count & overall_score
    try:
        resp_all = await run_sync(lambda: supabase.table("interview_responses").select("technical_score, communication_score, relevance_score").eq("interview_id", interview_id).execute())
        if resp_all.data and len(resp_all.data) > 0:
            scores = []
            for r in resp_all.data:
                ts = r.get("technical_score")
                cs = r.get("communication_score")
                rs = r.get("relevance_score")
                item_scores = [s for s in (ts, cs, rs) if s is not None]
                if item_scores:
                    scores.append(sum(item_scores) / len(item_scores))
            avg_score = round(sum(scores) / len(scores), 1) if scores else None

            update_payload = {
                "questions_answered": len(resp_all.data),
                "overall_score": avg_score
            }
            if len(resp_all.data) >= 5:
                update_payload["status"] = "completed"

            await run_sync(lambda: supabase.table("interviews").update(update_payload).eq("id", interview_id).execute())
    except Exception as update_err:
        logger.warning(f"Failed to update interview aggregate metrics: {update_err}")

    return eval_result
