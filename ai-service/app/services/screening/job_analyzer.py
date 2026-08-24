import logging
import hashlib
import json
from app.providers.factory import get_ai_provider
from app.schemas.screening import JobAnalysisResult
from app.core.cache import cache_get, cache_set

logger = logging.getLogger("ai_service.services.screening.job_analyzer")

SYSTEM_PROMPT = """You are an expert Enterprise Job Analysis AI Agent for AI-Recruit360.
Analyze job position titles, descriptions, and requirements to extract structured technical requirements, skill importance, minimum experience, and qualifications.
Return strictly valid JSON conforming to the requested schema."""

async def analyze_job_requirements(title: str, description: str, requirements: str | None = None) -> JobAnalysisResult:
    # Create a deterministic cache key based on the job content
    content_hash = hashlib.sha256(
        f"{title}:{description}:{requirements or ''}".encode('utf-8')
    ).hexdigest()
    cache_key = f"job_analysis:{content_hash}"

    # Try to load from Redis cache first
    cached = await cache_get(cache_key)
    if cached:
        logger.info(f"Job requirements analysis loaded from cache for '{title}'")
        try:
            return JobAnalysisResult(**cached)
        except Exception as e:
            logger.warning(f"Failed to parse cached job analysis: {e}")

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
        
        # Save to Redis for 7 days (604800 seconds) since job requirements don't change often
        await cache_set(cache_key, result.model_dump(), ttl_seconds=604800)
        
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
