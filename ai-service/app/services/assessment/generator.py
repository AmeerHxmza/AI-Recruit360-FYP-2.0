from app.core.operation_lock import serialized
import logging
from typing import List

from app.providers.factory import get_ai_provider
from app.schemas.assessment import GeneratedAssessmentPayload, CandidatePublicMCQItem
from app.db.supabase import get_supabase_client, run_sync
from app.core.exceptions import AssessmentGenerationError

logger = logging.getLogger("ai_service.services.assessment.generator")


SYSTEM_PROMPT = """You are an expert Technical Assessment AI Agent for AI-Recruit360.
Generate exactly 10 high-quality, non-trivia multiple-choice questions (MCQs) tailored specifically to the provided job requirements and the candidate's background.
Rules:
1. Generate exactly 10 questions numbered 1 to 10.
2. Each question must have exactly 4 options (option_a, option_b, option_c, option_d).
3. CRITICAL: You MUST strictly randomize the correct_option evenly across 'A', 'B', 'C', and 'D'. DO NOT default to 'A'.
4. Provide a clear explanation for why the answer is correct.
5. Provide skill_category and difficulty ('easy', 'medium', 'hard').
6. CRITICAL: Analyze the candidate's profile summary for specific projects. Generate meaningful technical questions that evaluate the candidate's understanding of the technologies used in those specific projects, mapping them to the job requirements."""

async def _generate_questions(
    assessment_id: str,
    job_title: str,
    job_description: str,
    cv_summary: str,
    matched_skills: List[str]
):
    supabase = get_supabase_client()
    provider = get_ai_provider()
    prompt = (
        f"TARGET POSITION: {job_title}\n\n"
        f"JOB CONTEXT:\n{job_description[:2000]}\n\n"
        f"CANDIDATE MATCHED SKILLS: {', '.join(matched_skills[:8])}\n"
        f"CANDIDATE PROFILE SUMMARY & PROJECTS: {cv_summary}\n\n"
        f"Generate 10 personalized technical questions testing candidate skill understanding, ensuring coverage of their specific project implementations."
    )

    try:
        raw_result = await provider.generate_structured(
            prompt=prompt,
            schema=GeneratedAssessmentPayload,
            system_prompt=SYSTEM_PROMPT
        )
    except Exception as e:
        logger.error(f"MCQ generation unavailable: {str(e)}")
        raise AssessmentGenerationError("Question generation is unavailable. Please retry; no assessment score has been assigned.") from e

    if sorted(q.question_number for q in raw_result.questions) != list(range(1, 11)):
        raise AssessmentGenerationError("Generated questions were incomplete. Please retry.")

    # Persist the complete validated question set in one statement.
    batch_rows = []
    for item in raw_result.questions:
        batch_rows.append({
            "assessment_id": assessment_id,
            "question_number": item.question_number,
            "question": item.question,
            "option_a": item.option_a,
            "option_b": item.option_b,
            "option_c": item.option_c,
            "option_d": item.option_d,
            "correct_option": item.correct_option,
            "explanation": item.explanation,
            "skill_category": item.skill_category,
            "difficulty": item.difficulty
        })

    await run_sync(
        lambda: supabase.table("assessment_questions").upsert(batch_rows, on_conflict="assessment_id,question_number").execute()
    )

    # Update assessment status to ready/in_progress
    await run_sync(
        lambda: supabase.table("assessments").update({"status": "in_progress"}).eq("id", assessment_id).execute()
    )



@serialized("assessment")
async def generate_personalized_mcqs(application_id: str) -> dict:
    supabase = get_supabase_client()

    # Check if assessment already exists for this application (Idempotency)
    existing_assessment = await run_sync(
        lambda: supabase.table("assessments").select("id, status").eq("application_id", application_id).execute()
    )

    if existing_assessment.data and len(existing_assessment.data) > 0:
        assessment_id = existing_assessment.data[0]["id"]
        q_res = await run_sync(
            lambda: supabase.table("assessment_questions")
            .select("id, assessment_id, question_number, question, option_a, option_b, option_c, option_d, skill_category, difficulty")
            .eq("assessment_id", assessment_id)
            .order("question_number")
            .execute()
        )
        if q_res.data and len(q_res.data) >= 10:
            if existing_assessment.data[0].get("status") in ("pending", "failed"):
                await run_sync(lambda: supabase.table("assessments").update({"status":"in_progress"}).eq("id",assessment_id).execute())
            logger.info(f"Returning existing {len(q_res.data)} assessment questions for application {application_id}")
            return {
                "status": "ready",
                "questions": [
                    CandidatePublicMCQItem(
                        id=q["id"],
                        assessment_id=q["assessment_id"],
                        question_number=q["question_number"],
                        question=q.get("question") or q.get("question_text", "Technical Question"),
                        option_a=q.get("option_a", ""),
                        option_b=q.get("option_b", ""),
                        option_c=q.get("option_c", ""),
                        option_d=q.get("option_d", ""),
                        skill_category=q.get("skill_category", "General"),
                        difficulty=q.get("difficulty", "medium")
                    ).model_dump()
                    for q in q_res.data
                ]
            }

    # Fetch required data (Application, Job, and CV Screening)
    app_res = await run_sync(
        lambda: supabase.table("applications").select("id, organization_id, status, jobs(title, description)").eq("id", application_id).execute()
    )
    if not app_res.data or len(app_res.data) == 0:
        raise AssessmentGenerationError(f"Application {application_id} not found.")
    
    app_record = app_res.data[0]
    
    current_status = app_record.get("status")
    if current_status not in ["assessment"]:
        raise AssessmentGenerationError(f"Application {application_id} is in status '{current_status}'. Not eligible for assessment.")
        
    org_id = app_record.get("organization_id")
    job_record = app_record.get("jobs", {})
    job_title = job_record.get("title", "Technical Position") if job_record else "Technical Position"
    job_description = job_record.get("description", "") if job_record else ""

    # Fetch screening result for candidate skills/summary
    screen_res = await run_sync(
        lambda: supabase.table("cv_screenings").select("matched_skills, reasoning_summary").eq("application_id", application_id).execute()
    )
    screening = screen_res.data[0] if screen_res.data and len(screen_res.data) > 0 else {}
    matched_skills = screening.get("matched_skills", ["Software Engineering"])
    cv_summary = screening.get("reasoning_summary", "General Technical Candidate")

    # Create new assessment record if none exists
    if not existing_assessment.data or len(existing_assessment.data) == 0:
        ass_payload = {
            "application_id": application_id,
            "total_questions": 10,
            "status": "pending"
        }
        if org_id:
            ass_payload["organization_id"] = org_id

        ass_ins = await run_sync(
            lambda: supabase.table("assessments").insert(ass_payload).execute()
        )
        assessment_id = ass_ins.data[0]["id"]
    else:
        assessment_id = existing_assessment.data[0]["id"]

    # Generate and persist before responding; failed requests can be retried.
    await _generate_questions(assessment_id, job_title, job_description, cv_summary, matched_skills)
    
    # Fetch the newly generated questions
    q_res = await run_sync(
        lambda: supabase.table("assessment_questions")
        .select("id, assessment_id, question_number, question, option_a, option_b, option_c, option_d, skill_category, difficulty")
        .eq("assessment_id", assessment_id)
        .order("question_number")
        .execute()
    )
    return {
        "status": "ready",
        "questions": [
            CandidatePublicMCQItem(
                id=q["id"],
                assessment_id=q["assessment_id"],
                question_number=q["question_number"],
                question=q.get("question") or q.get("question_text", "Technical Question"),
                option_a=q.get("option_a", ""),
                option_b=q.get("option_b", ""),
                option_c=q.get("option_c", ""),
                option_d=q.get("option_d", ""),
                skill_category=q.get("skill_category", "General"),
                difficulty=q.get("difficulty", "medium")
            ).model_dump()
            for q in (q_res.data or [])
        ]
    }
