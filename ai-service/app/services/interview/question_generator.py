import json
import logging
from app.providers.factory import get_ai_provider
from app.schemas.interview import GeneratedInterviewQuestion, NextInterviewQuestionResponse
from app.db.supabase import get_supabase_client, run_sync
from app.services.ai_activity import log_ai_activity

logger = logging.getLogger("ai_service.services.interview.question_generator")

SYSTEM_PROMPT = """You are an expert AI Technical Interviewer for AI-Recruit360.
Your goal is to conduct a highly personalized, dynamic, adaptive voice technical interview.
You MUST generate questions tailored specifically to the candidate's actual CV/Resume, their stated projects, technologies, and the target job position requirements.
Do NOT generate generic textbook questions. Ground your questions in the candidate's actual background and previous answers in this session."""

async def get_or_create_interview_session(application_id: str) -> dict:
    supabase = get_supabase_client()
    res = await run_sync(lambda: supabase.table("interviews").select("*").eq("application_id", application_id).order("created_at", desc=True).execute())
    if res.data and len(res.data) > 0:
        for s in res.data:
            if s.get("status") in ["pending", "in_progress"]:
                s["interview_id"] = s["id"]
                return s

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

    # Fetch interview details with application, job, and candidate
    int_res = await run_sync(lambda: supabase.table("interviews").select("*, applications(*, jobs(*), candidates(*))").eq("id", interview_id).execute())
    if not int_res.data or len(int_res.data) == 0:
        raise ValueError(f"Interview {interview_id} not found.")

    interview = int_res.data[0]
    app = interview.get("applications") or {}
    job = app.get("jobs") or {}
    cand = app.get("candidates") or {}

    application_id = interview.get("application_id")
    candidate_id = cand.get("id") or app.get("candidate_id")

    job_title = job.get("title", "Software Engineer")
    job_desc = job.get("description") or job.get("raw_text") or "Technical position"
    job_reqs = job.get("requirements_structured") or {}
    cand_name = cand.get("full_name", "Candidate")

    # 1. Fetch Candidate's uploaded CV / Resume extracted text
    cv_text = ""
    try:
        doc_res = await run_sync(lambda: supabase.table("candidate_documents")
            .select("extracted_text, original_filename")
            .eq("application_id", application_id)
            .limit(1)
            .execute())
        if doc_res.data and len(doc_res.data) > 0:
            cv_text = doc_res.data[0].get("extracted_text") or ""
        
        if not cv_text and candidate_id:
            cand_doc = await run_sync(lambda: supabase.table("candidate_documents")
                .select("extracted_text, original_filename")
                .eq("candidate_id", candidate_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute())
            if cand_doc.data and len(cand_doc.data) > 0:
                cv_text = cand_doc.data[0].get("extracted_text") or ""
    except Exception as doc_err:
        logger.warning(f"Could not retrieve candidate document text: {doc_err}")

    # 2. Fetch CV Screening findings (matched skills, missing skills, summary)
    matched_skills = []
    missing_skills = []
    screening_summary = ""
    try:
        screen_res = await run_sync(lambda: supabase.table("cv_screenings")
            .select("matched_skills, missing_skills, reasoning_summary, evidence")
            .eq("application_id", application_id)
            .limit(1)
            .execute())
        if screen_res.data and len(screen_res.data) > 0:
            sc_data = screen_res.data[0]
            matched_skills = sc_data.get("matched_skills") or []
            missing_skills = sc_data.get("missing_skills") or []
            screening_summary = sc_data.get("reasoning_summary") or ""
    except Exception as sc_err:
        logger.warning(f"Could not retrieve cv screening info: {sc_err}")

    # 3. Fetch existing generated questions and answers for this session
    q_res = await run_sync(lambda: supabase.table("interview_questions").select("*").eq("interview_id", interview_id).order("question_number").execute())
    existing_questions = q_res.data or []

    resp_res = await run_sync(lambda: supabase.table("interview_responses").select("question_id, response_text, transcript, technical_score, ai_feedback").eq("interview_id", interview_id).execute())
    responses = resp_res.data or []
    resp_map = {r["question_id"]: r for r in responses}
    answered_q_ids = set(resp_map.keys())

    total_allowed = 5

    # If there is already an unanswered question generated, return it first (recovery / page reload)
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
            scores = []
            for r in responses:
                ts = r.get("technical_score")
                cs = r.get("communication_score")
                rs = r.get("relevance_score")
                item_scores = [s for s in (ts, cs, rs) if s is not None]
                if item_scores:
                    scores.append(sum(item_scores) / len(item_scores))
            avg_score = round(sum(scores) / len(scores), 1) if scores else 85.0

            await run_sync(lambda: supabase.table("interviews").update({
                "status": "completed",
                "questions_answered": len(answered_q_ids),
                "overall_score": avg_score
            }).eq("id", interview_id).execute())

            org_id = app.get("organization_id")
            if org_id:
                await log_ai_activity(
                    application_id=interview["application_id"],
                    event_type="interview_evaluated",
                    organization_id=org_id,
                    metadata={"interview_id": interview_id, "questions_answered": len(answered_q_ids), "overall_score": avg_score}
                )

        return NextInterviewQuestionResponse(
            interview_id=interview_id,
            completed=True,
            current_question=None,
            questions_answered=len(answered_q_ids),
            total_questions=total_allowed
        )

    question_num = len(answered_q_ids) + 1

    # 4. Build dialogue history of previous questions and candidate's transcribed spoken answers
    prev_dialogue = []
    for eq in existing_questions:
        if eq["id"] in resp_map:
            r = resp_map[eq["id"]]
            ans = r.get("transcript") or r.get("response_text") or "No verbal response recorded."
            prev_dialogue.append(f"Q#{eq.get('question_number')}: \"{eq.get('question_text')}\"\nCandidate Answer: \"{ans}\"")

    # 5. Define question intent based on interview progression
    stage_prompts = {
        1: "STAGE 1 (CV Deep Dive): Specifically identify a project, framework, or technology mentioned in the candidate's CV. Ask them to explain its architecture, why they chose that approach, and how they built it.",
        2: "STAGE 2 (Core Technical Competency): Ask a practical, in-depth question testing one of the primary technical skills required for this job position (e.g., Python algorithms, PyTorch/LLMs, database querying, asynchronous APIs).",
        3: "STAGE 3 (Problem Solving & Engineering Edge Cases): Present a realistic system breakdown, scaling challenge, or debugging scenario relevant to the target job position.",
        4: "STAGE 4 (Adaptive Follow-up & Deep Probe): Review the candidate's previous answers in this session. Either probe deeper into a concept they mentioned, or ask about an area where they showed uncertainty.",
        5: "STAGE 5 (Production Architecture & Best Practices): Ask about production reliability, model evaluation, CI/CD, testing methodologies, or architectural trade-offs."
    }
    stage_guideline = stage_prompts.get(question_num, "Evaluate practical technical capability and system design.")

    # 6. Construct full dynamic prompt with CV, Job, and Session context
    cv_excerpt = cv_text[:3000] if cv_text else "No uploaded CV text found. Tailor question to candidate name and job title."
    matched_skills_text = ", ".join(matched_skills[:10]) if matched_skills else "General technical skills"
    missing_skills_text = ", ".join(missing_skills[:5]) if missing_skills else "None identified"

    prompt = (
        f"--- CANDIDATE DETAILS ---\n"
        f"Name: {cand_name}\n"
        f"Target Position: {job_title}\n\n"
        f"--- JOB DESCRIPTION & REQUIREMENTS ---\n"
        f"{job_desc[:1200]}\n\n"
        f"--- CANDIDATE'S ACTUAL CV / RESUME TEXT ---\n"
        f"{cv_excerpt}\n\n"
        f"--- CV SCREENING FINDINGS ---\n"
        f"Verified Matched Skills: {matched_skills_text}\n"
        f"Missing / Unverified Skills: {missing_skills_text}\n"
        f"AI Analysis: {screening_summary[:400]}\n\n"
        f"--- INTERVIEW PROGRESSION (Question {question_num} of {total_allowed}) ---\n"
        f"Goal: {stage_guideline}\n\n"
        f"--- PREVIOUS QUESTIONS & CANDIDATE ANSWERS IN THIS SESSION ---\n"
        f"{chr(10).join(prev_dialogue) if prev_dialogue else 'None (This is the very first question of the interview)'}\n\n"
        f"--- INSTRUCTIONS ---\n"
        f"1. Generate Question #{question_num} for candidate {cand_name}.\n"
        f"2. Reference actual projects, tools, or libraries mentioned in their CV where applicable.\n"
        f"3. Keep the spoken question concise (2-3 sentences max) so it sounds natural when spoken aloud via Text-to-Speech.\n"
        f"4. Do NOT repeat topics or questions already covered in previous questions.\n"
        f"5. Return valid structured JSON with question_text, question_type, and skill_category."
    )

    provider = get_ai_provider()

    try:
        generated = await provider.generate_structured(
            prompt=prompt,
            schema=GeneratedInterviewQuestion,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.7
        )
        q_text = generated.question_text
        q_type = generated.question_type
        skill_cat = generated.skill_category
    except Exception as e:
        logger.warning(f"Interview question generation AI failed, using fallback: {str(e)}")
        q_text = f"Looking at your experience as {cand_name}, could you explain how you would design and optimize a production-ready system for the {job_title} role?"
        q_type = "technical"
        skill_cat = "System Architecture"

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
            is_follow_up=(question_num == 4)
        ),
        questions_answered=len(answered_q_ids),
        total_questions=total_allowed
    )

