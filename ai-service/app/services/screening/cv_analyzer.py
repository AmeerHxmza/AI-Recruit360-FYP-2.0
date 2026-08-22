import logging
from app.providers.factory import get_ai_provider
from app.schemas.screening import CVExtractedData

logger = logging.getLogger("ai_service.services.screening.cv_analyzer")

SYSTEM_PROMPT = """You are an expert CV Parser & Extractor AI Agent for AI-Recruit360.
Extract candidate contact info, technical skills, work history (roles, companies, duration in years), education, projects, and certifications from resume text.
Do not fabricate candidate details. If a field is missing, return empty lists or null."""

async def parse_cv_text(cv_text: str, candidate_name_hint: str = "Candidate") -> CVExtractedData:
    provider = get_ai_provider()
    
    prompt = (
        f"CANDIDATE NAME HINT: {candidate_name_hint}\n\n"
        f"FULL CV / RESUME TEXT:\n{cv_text[:12000]}\n\n"
        f"Extract candidate name, contact info, all technical skills, work experience list, and education history."
    )

    try:
        result = await provider.generate_structured(
            prompt=prompt,
            schema=CVExtractedData,
            system_prompt=SYSTEM_PROMPT
        )
        return result
    except Exception as e:
        logger.error(f"CV parsing failed: {str(e)}")
        # Provide clean fallback extraction if AI provider fails
        return CVExtractedData(
            candidate_name=candidate_name_hint,
            skills=[],
            experience=[],
            education=[],
            projects=[],
            certifications=[]
        )
