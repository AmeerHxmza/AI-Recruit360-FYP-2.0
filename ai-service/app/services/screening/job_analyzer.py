import logging
from app.providers.factory import get_ai_provider
from app.schemas.screening import JobAnalysisResult

logger = logging.getLogger("ai_service.services.screening.job_analyzer")

SYSTEM_PROMPT = """You are an expert Enterprise Job Analysis AI Agent for AI-Recruit360.
Analyze job position titles, descriptions, and requirements to extract structured technical requirements, skill importance, minimum experience, and qualifications.
Return strictly valid JSON conforming to the requested schema."""

async def analyze_job_requirements(title: str, description: str, requirements: str | None = None) -> JobAnalysisResult:
    provider = get_ai_provider()
    
    prompt = (
        f"JOB TITLE: {title}\n\n"
        f"JOB DESCRIPTION:\n{description}\n\n"
        f"JOB REQUIREMENTS:\n{requirements or 'N/A'}\n\n"
        f"Extract all critical, important, and nice-to-have skills, minimum years of experience required, education requirements, and responsibilities."
    )

    try:
        result = await provider.generate_structured(
            prompt=prompt,
            schema=JobAnalysisResult,
            system_prompt=SYSTEM_PROMPT
        )
        return result
    except Exception as e:
        logger.error(f"Job requirements analysis failed: {str(e)}")
        # Provide clean fallback model if AI provider is unconfigured/fails
        return JobAnalysisResult(
            normalized_title=title,
            critical_skills=[],
            important_skills=[],
            nice_to_have_skills=[],
            minimum_experience_years=0.0,
            preferred_experience_years=2.0,
            education_requirements=["Bachelor's degree or equivalent experience"],
            responsibilities=[description[:100]],
            technical_domains=["Software Engineering"]
        )
