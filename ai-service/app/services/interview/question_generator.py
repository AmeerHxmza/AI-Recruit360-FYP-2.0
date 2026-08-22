import logging
from app.providers.factory import get_ai_provider
from app.schemas.interview import GeneratedInterviewQuestion, NextInterviewQuestionResponse
from app.db.supabase import get_supabase_client

logger = logging.getLogger("ai_service.services.interview.question_generator")

SYSTEM_PROMPT = """You are an expert AI Voice Interviewer & Evaluator for AI-Recruit360.
Generate concise, realistic technical interview questions tailored to the candidate's CV and target job position.
Questions should test practical system understanding, architectural reasoning, and real-world problem solving."""

async def get_or_create_interview_session(application_id: str) -> dict:
    supabase = get_supabase_client()
    res = supabase.table("interviews").select("*").eq("application_id", application_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]

    # Create new interview record
    new_int = supabase.table("interviews").insert({
        "application_id": application_id,
        "interview_type": "technical_ai",
        "status": "pending"
    }).execute()
    return new_int.data[0]

async def generate_next_interview_question(interview_id: str) -> NextInterviewQuestionResponse:
    supabase = get_supabase_client()

    # Fetch interview details
    int_res = supabase.table("interviews").select("*, applications(*, jobs(*), candidates(*))").eq("id", interview_id).execute()
    if not int_res.data or len(int_res.data) == 0:
        raise ValueError(f"Interview {interview_id} not found.")

    interview = int_res.data[0]
    app = interview.get("applications") or {}
    job = app.get("jobs") or {}
    cand = app.get("candidates") or {}

    job_title = job.get("title", "Software Engineer")
    cand_name = cand.get("full_name", "Candidate")

    # Fetch existing generated questions
    q_res = supabase.table("interview_questions").select("*").eq("interview_id", interview_id).order("question_number").execute()
    existing_questions = q_res.data or []

    # Maximum 5 interview questions per session
    total_allowed = 5
    current_count = len(existing_questions)

    if current_count >= total_allowed:
        return NextInterviewQuestionResponse(
            interview_id=interview_id,
            completed=True,
            current_question=None,
            questions_answered=current_count,
            total_questions=total_allowed
        )

    question_num = current_count + 1

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
    ins = supabase.table("interview_questions").insert({
        "interview_id": interview_id,
        "question_number": question_num,
        "question_text": q_text,
        "question_type": q_type,
        "skill_category": skill_cat
    }).execute()

    db_q = ins.data[0]

    return NextInterviewQuestionResponse(
        interview_id=interview_id,
        completed=False,
        current_question=GeneratedInterviewQuestion(
            question_number=db_q["question_number"],
            question_text=db_q["question_text"],
            question_type=db_q["question_type"],
            skill_category=db_q["skill_category"],
            source="ai_adaptive",
            is_follow_up=False
        ),
        questions_answered=current_count,
        total_questions=total_allowed
    )
