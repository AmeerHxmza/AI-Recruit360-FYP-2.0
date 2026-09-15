"""Assessment integrity and timing are enforced atomically by PostgreSQL."""
from app.db.supabase import get_supabase_client, run_sync
from app.schemas.assessment import MCQAnswerSubmission, AssessmentFinalResult
from app.core.config import settings

async def record_candidate_answer(submission: MCQAnswerSubmission) -> dict:
    db = get_supabase_client()
    result = await run_sync(lambda: db.rpc("record_assessment_answer", {
        "_assessment": submission.assessment_id, "_question": submission.question_id,
        "_option": submission.selected_option.strip().upper(),
    }).execute())
    return result.data

async def finalize_assessment_session(assessment_id: str) -> AssessmentFinalResult:
    db = get_supabase_client()
    result = await run_sync(lambda: db.rpc("finish_assessment", {
        "_assessment": assessment_id, "_threshold": settings.ASSESSMENT_PASS_THRESHOLD,
    }).execute())
    return AssessmentFinalResult.model_validate(result.data)
