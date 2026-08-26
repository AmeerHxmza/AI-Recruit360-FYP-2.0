import logging
from datetime import datetime, timezone
from app.db.supabase import get_supabase_client, run_sync
from app.schemas.assessment import MCQAnswerSubmission, AssessmentFinalResult
from app.core.config import settings
from app.services.ai_activity import log_ai_activity

logger = logging.getLogger("ai_service.services.assessment.scorer")

async def record_candidate_answer(submission: MCQAnswerSubmission) -> dict:
    supabase = get_supabase_client()

    # Retrieve real question with correct_option from database
    q_res = await run_sync(
        lambda: supabase.table("assessment_questions").select("id, correct_option, assessments(status)").eq("id", submission.question_id).execute()
    )
    if not q_res.data or len(q_res.data) == 0:
        raise ValueError(f"Question with ID {submission.question_id} not found.")

    question = q_res.data[0]
    
    # SECURITY: Check assessment status
    assessment = question.get("assessments", {})
    if assessment.get("status") == "completed":
        raise ValueError("Assessment is already completed. Cannot modify answers.")

    expected_correct = question["correct_option"].strip().upper()
    user_choice = submission.selected_option.strip().upper()

    # Server-side timer validation: verify time taken <= 35 seconds (30s limit + 5s network grace)
    is_timed_out = submission.time_taken_seconds > 35
    is_correct = (user_choice == expected_correct) and not is_timed_out

    # Record response in assessment_answers table
    answer_payload = {
        "assessment_id": submission.assessment_id,
        "question_id": submission.question_id,
        "selected_option": user_choice,
        "is_correct": is_correct,
        "time_taken_seconds": submission.time_taken_seconds
    }

    # SECURITY: Check if already answered (prevent modifying answers)
    existing = await run_sync(
        lambda: supabase.table("assessment_answers").select("id").eq("question_id", submission.question_id).execute()
    )
    if existing.data and len(existing.data) > 0:
        raise ValueError("Question has already been answered. Modification is not allowed.")

    await run_sync(
        lambda: supabase.table("assessment_answers").insert(answer_payload).execute()
    )

    return {
        "status": "recorded",
        "question_number": submission.question_number,
        "timed_out": is_timed_out
    }

async def finalize_assessment_session(assessment_id: str) -> AssessmentFinalResult:
    supabase = get_supabase_client()

    # Get assessment record
    ass_res = await run_sync(
        lambda: supabase.table("assessments").select("id, application_id, status, total_questions, correct_answers, score, organization_id").eq("id", assessment_id).execute()
    )
    if not ass_res.data or len(ass_res.data) == 0:
        raise ValueError(f"Assessment {assessment_id} not found.")

    assessment = ass_res.data[0]
    application_id = assessment["application_id"]
    
    # SECURITY: Idempotency / Prevent double finalization
    if assessment["status"] == "completed":
        return AssessmentFinalResult(
            assessment_id=assessment_id,
            total_questions=assessment.get("total_questions", 10),
            correct_answers=assessment.get("correct_answers", 0),
            score=assessment.get("score", 0),
            percentage=assessment.get("score", 0),
            passed=assessment.get("score", 0) >= settings.ASSESSMENT_PASS_THRESHOLD
        )

    # Get all submitted answers
    ans_res = await run_sync(
        lambda: supabase.table("assessment_answers").select("is_correct").eq("assessment_id", assessment_id).execute()
    )
    answers = ans_res.data or []

    total_q = assessment.get("total_questions", 10)
    correct_count = sum(1 for a in answers if a.get("is_correct") is True)

    percentage = round((correct_count / total_q) * 100.0, 1) if total_q > 0 else 0.0
    pass_threshold = settings.ASSESSMENT_PASS_THRESHOLD
    passed = percentage >= pass_threshold

    now_iso = datetime.now(timezone.utc).isoformat()

    # Update assessment record
    await run_sync(
        lambda: supabase.table("assessments").update({
            "score": int(round(percentage)),
            "percentage": percentage,
            "correct_answers": correct_count,
            "total_questions": total_q,
            "status": "completed",
            "completed_at": now_iso
        }).eq("id", assessment_id).execute()
    )

    # Update application status: interview if passed, else assessment_failed
    next_stage = "interview" if passed else "assessment_failed"
    await run_sync(
        lambda: supabase.table("applications").update({"status": next_stage}).eq("id", application_id).execute()
    )

    organization_id = assessment.get("organization_id")
    if organization_id:
        await log_ai_activity(
            application_id=application_id,
            event_type="assessment_completed",
            organization_id=organization_id,
            metadata={
                "assessment_id": assessment_id,
                "score": percentage,
                "passed": passed
            }
        )

    return AssessmentFinalResult(
        assessment_id=assessment_id,
        total_questions=total_q,
        correct_answers=correct_count,
        score=percentage,
        percentage=percentage,
        passed=passed
    )
