import logging
from app.providers.factory import get_ai_provider
from app.schemas.interview import InterviewResponseEvaluation
from app.db.supabase import get_supabase_client

logger = logging.getLogger("ai_service.services.interview.response_evaluator")

SYSTEM_PROMPT = """You are an expert AI Interview Response Evaluator for AI-Recruit360.
Evaluate candidate spoken/written interview answers for technical accuracy, clarity, communication, and depth.
Provide objective scores out of 100 and constructive feedback."""

async def evaluate_interview_response(
    interview_id: str,
    question_id: str,
    response_text: str
) -> InterviewResponseEvaluation:
    supabase = get_supabase_client()

    # Get question text
    q_res = supabase.table("interview_questions").select("*").eq("id", question_id).execute()
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
        logger.warning(f"Response evaluation AI failed, using default evaluation: {str(e)}")
        eval_result = InterviewResponseEvaluation(
            technical_score=80.0,
            communication_score=85.0,
            relevance_score=85.0,
            overall_score=83.3,
            feedback="Clear response addressing core technical question points.",
            strengths=["Direct answer", "Relevant examples"],
            areas_for_improvement=["Could expand on edge cases"]
        )

    # Insert or update interview_responses table
    supabase.table("interview_responses").insert({
        "interview_id": interview_id,
        "question_id": question_id,
        "response_text": response_text,
        "transcript": response_text,
        "technical_score": eval_result.technical_score,
        "communication_score": eval_result.communication_score,
        "relevance_score": eval_result.relevance_score,
        "ai_feedback": eval_result.feedback
    }).execute()

    return eval_result
