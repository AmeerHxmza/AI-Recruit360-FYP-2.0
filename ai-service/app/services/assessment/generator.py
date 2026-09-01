import logging
from typing import List

from app.providers.factory import get_ai_provider
from app.schemas.assessment import GeneratedAssessmentPayload, GeneratedMCQItem, CandidatePublicMCQItem
from app.db.supabase import get_supabase_client, run_sync
from app.core.exceptions import AssessmentGenerationError
from app.services.ai_activity import log_ai_activity

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

async def _generate_mcqs_background_task(
    application_id: str,
    assessment_id: str,
    job_title: str,
    job_description: str,
    cv_summary: str,
    matched_skills: List[str],
    organization_id: str = None
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
        logger.error(f"MCQ Generation AI call failed, generating fallback standard MCQs: {str(e)}")
        # Fallback question generation if LLM fails
        raw_result = generate_fallback_mcqs(job_title, matched_skills)

    # Insert all 10 questions in a SINGLE BATCH DATABASE INSERT (< 40ms)
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
            "correct_option": item.correct_option.strip().upper()[:1] if item.correct_option.strip().upper()[:1] in ("A", "B", "C", "D") else "A",
            "explanation": item.explanation,
            "skill_category": item.skill_category,
            "difficulty": item.difficulty
        })

    await run_sync(
        lambda: supabase.table("assessment_questions").insert(batch_rows).execute()
    )

    # Update assessment status to ready/in_progress
    await run_sync(
        lambda: supabase.table("assessments").update({"status": "in_progress"}).eq("id", assessment_id).execute()
    )

    # Log AI Activity
    await log_ai_activity(
        application_id=application_id,
        event_type="assessment_generated",
        organization_id=organization_id,
        metadata={
            "assessment_id": assessment_id,
            "total_questions": len(raw_result.questions)
        }
    )


async def generate_personalized_mcqs(application_id: str, background_tasks = None) -> dict:
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
        elif existing_assessment.data[0].get("status") == "pending":
            return {"status": "generating", "message": "Assessment generation is already in progress."}

    # Fetch required data (Application, Job, and CV Screening)
    app_res = await run_sync(
        lambda: supabase.table("applications").select("id, organization_id, status, jobs(title, description)").eq("id", application_id).execute()
    )
    if not app_res.data or len(app_res.data) == 0:
        raise AssessmentGenerationError(f"Application {application_id} not found.")
    
    app_record = app_res.data[0]
    
    current_status = app_record.get("status")
    if current_status not in ["assessment", "screening", "applied"]:
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

    if background_tasks:
        background_tasks.add_task(
            _generate_mcqs_background_task,
            application_id, assessment_id, job_title, job_description, cv_summary, matched_skills, org_id
        )
        return {"status": "generating", "message": "Assessment generation started in background."}
    else:
        # Fallback to synchronous generation if no background tasks provided
        await _generate_mcqs_background_task(application_id, assessment_id, job_title, job_description, cv_summary, matched_skills, org_id)
        
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

def generate_fallback_mcqs(job_title: str, skills: List[str]) -> GeneratedAssessmentPayload:
    """Generate deterministic fallback MCQs when LLM fails. Correct answers are randomized across positions."""
    import random
    primary_skill = skills[0] if skills else "Software Engineering"
    correct_options = ["A", "B", "C", "D"]
    questions = []

    templates = [
        ("What is a core best practice when working with {skill} in production for {job}?",
         "Ensure modular code separation and comprehensive automated testing",
         "Avoid error handling to improve execution speed",
         "Hardcode environment variables directly inside component code",
         "Disable database indexing to conserve storage"),
        ("Which approach is recommended for scaling {skill} systems in a {job} context?",
         "Implement horizontal scaling with load balancing and caching",
         "Store all data in a single monolithic table",
         "Disable logging in production to improve performance",
         "Use synchronous blocking calls for all network operations"),
        ("What is the primary benefit of automated testing in {skill} development?",
         "Early detection of regressions and reliable deployments",
         "Eliminates the need for code documentation",
         "Guarantees zero runtime bugs in production",
         "Reduces the need for version control"),
    ]

    for idx in range(1, 11):
        template = templates[idx % len(templates)]
        correct_pos = correct_options[(idx - 1) % 4]
        
        # Build options list with correct answer rotated to the right position
        options = list(template[1:])
        correct_answer = options[0]
        random.shuffle(options)
        # Ensure correct answer is at the designated position
        correct_idx = correct_options.index(correct_pos)
        options.remove(correct_answer)
        options.insert(correct_idx, correct_answer)
        
        skill_for_q = skills[idx % len(skills)] if skills else primary_skill
        questions.append(GeneratedMCQItem(
            question_number=idx,
            question=template[0].format(skill=skill_for_q, job=job_title),
            option_a=options[0],
            option_b=options[1],
            option_c=options[2],
            option_d=options[3],
            correct_option=correct_pos,
            explanation=f"{correct_answer} — this ensures reliability and maintainability.",
            skill_category=skill_for_q,
            difficulty=["easy", "medium", "hard"][idx % 3]
        ))
    return GeneratedAssessmentPayload(questions=questions)
