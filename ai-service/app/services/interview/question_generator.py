import logging
from app.providers.factory import get_ai_provider
from app.schemas.interview import GeneratedInterviewQuestion, NextInterviewQuestionResponse
from app.db.supabase import get_supabase_client, run_sync
from app.services.ai_activity import log_ai_activity

logger = logging.getLogger("ai_service.services.interview.question_generator")

SYSTEM_PROMPT = """You are an expert AI Voice Interviewer & Evaluator for AI-Recruit360.
Generate concise, realistic technical interview questions tailored to the candidate's CV and target job position.
Questions should test practical system understanding, architectural reasoning, and real-world problem solving."""

async def get_or_create_interview_session(application_id: str) -> dict:
    supabase = get_supabase_client()
    res = await run_sync(lambda: supabase.table("interviews").select("*").eq("application_id", application_id).execute())
    if res.data and len(res.data) > 0:
        session = res.data[0]
        session["interview_id"] = session["id"]
        return session

    # Retrieve organization_id and status from application record
    app_rec = await run_sync(lambda: supabase.table("applications").select("organization_id, status").eq("id", application_id).execute())
    if not app_rec.data or len(app_rec.data) == 0:
        raise ValueError(f"Application {application_id} not found.")
        
    app_record = app_rec.data[0]
    current_status = app_record.get("status")
    if current_status in ["knocked_out", "assessment_failed", "rejected"]:
        raise ValueError(f"Application {application_id} is in status '{current_status}'. Not eligible for interview.")
        
    org_id = app_record.get("organization_id")

    # Create new interview record
    int_payload = {
        "application_id": application_id,
        "interview_type": "ai_adaptive",
        "status": "pending"
    }
    if org_id:
        int_payload["organization_id"] = org_id

    new_int = await run_sync(lambda: supabase.table("interviews").insert(int_payload).execute())
    
    interview_session = new_int.data[0]
    interview_id = interview_session["id"]
    interview_session["interview_id"] = interview_id

    if org_id:
        await log_ai_activity(
            application_id=application_id,
            event_type="interview_started",
            organization_id=org_id,
            metadata={"interview_id": interview_id}
        )
        
    return interview_session

async def generate_next_interview_question(interview_id: str) -> NextInterviewQuestionResponse:
    supabase = get_supabase_client()

    # Fetch interview details
    int_res = await run_sync(lambda: supabase.table("interviews").select("*, applications(*, jobs(*), candidates(*))").eq("id", interview_id).execute())
    if not int_res.data or len(int_res.data) == 0:
        raise ValueError(f"Interview {interview_id} not found.")

    interview = int_res.data[0]
    app = interview.get("applications") or {}
    job = app.get("jobs") or {}
    cand = app.get("candidates") or {}

    job_title = job.get("title", "Software Engineer")
    cand_name = cand.get("full_name", "Candidate")

    # Fetch existing generated questions and answers
    q_res = await run_sync(lambda: supabase.table("interview_questions").select("*").eq("interview_id", interview_id).order("question_number").execute())
    existing_questions = q_res.data or []

    resp_res = await run_sync(lambda: supabase.table("interview_responses").select("question_id").eq("interview_id", interview_id).execute())
    answered_q_ids = {r["question_id"] for r in (resp_res.data or [])}

    total_allowed = 5

    # If there is already an unanswered question generated, return it first (recovery)
    for eq in existing_questions:
        if eq["id"] not in answered_q_ids:
            return NextInterviewQuestionResponse(
                interview_id=interview_id,
                completed=False,
                current_question=GeneratedInterviewQuestion(
                    id=eq["id"],
                    question_number=eq["question_number"],
                    question_text=eq["question_text"],
                    question_type=eq.get("question_type", "technical"),
                    skill_category=eq.get("skill_category", "Technical Competency"),
                    source=eq.get("source", "ai_adaptive"),
                    is_follow_up=eq.get("is_follow_up", False)
                ),
                questions_answered=len(answered_q_ids),
                total_questions=total_allowed
            )

    # All existing questions answered. Check if we reached the cap (5 questions)
    if len(answered_q_ids) >= total_allowed:
        if interview.get("status") != "completed":
            await run_sync(lambda: supabase.table("interviews").update({"status": "completed"}).eq("id", interview_id).execute())
            org_id = app.get("organization_id")
            if org_id:
                await log_ai_activity(
                    application_id=interview["application_id"],
                    event_type="interview_completed",
                    organization_id=org_id,
                    metadata={"interview_id": interview_id, "questions_answered": len(answered_q_ids)}
                )

        return NextInterviewQuestionResponse(
            interview_id=interview_id,
            completed=True,
            current_question=None,
            questions_answered=len(answered_q_ids),
            total_questions=total_allowed
        )

    question_num = len(answered_q_ids) + 1

    # Call AI Provider to generate next adaptive question
    provider = get_ai_provider()
    prompt = (
        f"CANDIDATE: {cand_name}\n"
        f"TARGET POSITION: {job_title}\n"
        f"QUESTION NUMBER: {question_num} of {total_allowed}\n\n"
        f"Generate Question #{question_num} evaluating practical technical competency."
    )

    try:
        generated = await provider.generate_structured(
            prompt=prompt,
            schema=GeneratedInterviewQuestion,
            system_prompt=SYSTEM_PROMPT
        )
        q_text = generated.question_text
        q_type = generated.question_type
        skill_cat = generated.skill_category
    except Exception as e:
        logger.warning(f"Interview question generation AI failed, using fallback: {str(e)}")
        q_text = f"Question #{question_num}: Can you describe a challenging technical architecture decision you made when working on {job_title} systems?"
        q_type = "technical"
        skill_cat = "Architecture"

    # Insert into interview_questions table
    ins = await run_sync(lambda: supabase.table("interview_questions").insert({
        "interview_id": interview_id,
        "question_number": question_num,
        "question_text": q_text,
        "question_type": q_type,
        "skill_category": skill_cat
    }).execute())

    db_q = ins.data[0]

    return NextInterviewQuestionResponse(
        interview_id=interview_id,
        completed=False,
        current_question=GeneratedInterviewQuestion(
            id=db_q["id"],
            question_number=db_q["question_number"],
            question_text=db_q["question_text"],
            question_type=db_q["question_type"],
            skill_category=db_q["skill_category"],
            source="ai_adaptive",
            is_follow_up=False
        ),
        questions_answered=len(answered_q_ids),
        total_questions=total_allowed
    )
