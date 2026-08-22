import logging
from typing import List
from app.providers.factory import get_ai_provider
from app.schemas.assessment import GeneratedAssessmentPayload, GeneratedMCQItem, CandidatePublicMCQItem
from app.db.supabase import get_supabase_client
from app.core.exceptions import AssessmentGenerationError

logger = logging.getLogger("ai_service.services.assessment.generator")

SYSTEM_PROMPT = """You are an expert Technical Assessment AI Agent for AI-Recruit360.
Generate exactly 10 high-quality, non-trivia multiple-choice questions (MCQs) tailored specifically to the provided job requirements and candidate background.
Rules:
1. Generate exactly 10 questions numbered 1 to 10.
2. Each question must have exactly 4 options (option_a, option_b, option_c, option_d).
3. Specify correct_option strictly as 'A', 'B', 'C', or 'D'.
4. Provide a clear explanation for why the answer is correct.
5. Provide skill_category and difficulty ('easy', 'medium', 'hard')."""

async def generate_personalized_mcqs(
    application_id: str,
    job_title: str,
    job_description: str,
    matched_skills: List[str],
    cv_summary: str | None = None
) -> List[CandidatePublicMCQItem]:
    supabase = get_supabase_client()

    # Check if assessment already exists for this application (Idempotency)
    existing_assessment = supabase.table("assessments").select("*").eq("application_id", application_id).execute()
    
    if existing_assessment.data and len(existing_assessment.data) > 0:
        assessment_id = existing_assessment.data[0]["id"]
        q_res = supabase.table("assessment_questions").select("*").eq("assessment_id", assessment_id).order("question_number").execute()
        if q_res.data and len(q_res.data) >= 10:
            logger.info(f"Returning existing {len(q_res.data)} assessment questions for application {application_id}")
            return [
                CandidatePublicMCQItem(
                    id=q["id"],
                    question_number=q["question_number"],
                    question=q["question_text"],
                    option_a=q["option_a"],
                    option_b=q["option_b"],
                    option_c=q["option_c"],
                    option_d=q["option_d"],
                    skill_category=q.get("skill_category", "General"),
                    difficulty=q.get("difficulty", "medium")
                )
                for q in q_res.data
            ]

    # Create new assessment record if none exists
    if not existing_assessment.data or len(existing_assessment.data) == 0:
        ass_ins = supabase.table("assessments").insert({
            "application_id": application_id,
            "total_questions": 10,
            "status": "pending"
        }).execute()
        assessment_id = ass_ins.data[0]["id"]
    else:
        assessment_id = existing_assessment.data[0]["id"]

    # Call AI Provider to generate 10 MCQs
    provider = get_ai_provider()
    prompt = (
        f"TARGET POSITION: {job_title}\n\n"
        f"JOB CONTEXT:\n{job_description[:2000]}\n\n"
        f"CANDIDATE MATCHED SKILLS: {', '.join(matched_skills[:8])}\n"
        f"CANDIDATE PROFILE SUMMARY: {cv_summary or 'General Technical Candidate'}\n\n"
        f"Generate 10 personalized technical questions testing candidate skill understanding."
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

    # Insert 10 questions into database (keeping correct_option server-side only!)
    inserted_public_items: List[CandidatePublicMCQItem] = []
    for item in raw_result.questions:
        q_row = supabase.table("assessment_questions").insert({
            "assessment_id": assessment_id,
            "question_number": item.question_number,
            "question_text": item.question,
            "option_a": item.option_a,
            "option_b": item.option_b,
            "option_c": item.option_c,
            "option_d": item.option_d,
            "correct_option": item.correct_option.upper(),
            "explanation": item.explanation,
            "skill_category": item.skill_category,
            "difficulty": item.difficulty
        }).execute()

        db_q = q_row.data[0]
        # Return stripped public representation (NO correct_option or explanation!)
        inserted_public_items.append(CandidatePublicMCQItem(
            id=db_q["id"],
            question_number=db_q["question_number"],
            question=db_q["question_text"],
            option_a=db_q["option_a"],
            option_b=db_q["option_b"],
            option_c=db_q["option_c"],
            option_d=db_q["option_d"],
            skill_category=db_q["skill_category"],
            difficulty=db_q["difficulty"]
        ))

    return inserted_public_items

def generate_fallback_mcqs(job_title: str, skills: List[str]) -> GeneratedAssessmentPayload:
    primary_skill = skills[0] if skills else "Software Engineering"
    questions = []
    for idx in range(1, 11):
        questions.append(GeneratedMCQItem(
            question_number=idx,
            question=f"Question #{idx}: What is a core best practice when working with {primary_skill} in production environments for {job_title}?",
            option_a="Ensure modular code separation and comprehensive automated testing",
            option_b="Avoid error handling to improve execution speed",
            option_c="Hardcode environment variables directly inside component code",
            option_d="Disable database indexing to conserve storage",
            correct_option="A",
            explanation="Modular separation and automated testing ensure reliability and maintainability.",
            skill_category=primary_skill,
            difficulty="medium"
        ))
    return GeneratedAssessmentPayload(questions=questions)
