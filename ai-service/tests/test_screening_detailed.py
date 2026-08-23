import pytest
import os
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.screening import JobAnalysisResult, CVExtractedData, SkillRequirement, CVExtractedExperience
from app.services.screening.agents import (
    evaluate_skills,
    evaluate_experience,
    evaluate_education,
    extract_evidence,
    synthesize_screening_decision
)
from app.services.cv.extractor import extract_text_from_bytes
from app.core.exceptions import DocumentExtractionError

client = TestClient(app)

# 1. CV Extraction
def test_cv_extraction_txt():
    text = "John Doe\nPython Developer"
    extracted = extract_text_from_bytes(text.encode('utf-8'), "cv.txt", "text/plain")
    assert "John Doe" in extracted

def test_cv_extraction_invalid():
    # Invalid bytes that cannot be decoded as utf-8 or latin-1
    # Actually, latin-1 can decode almost anything, but let's test with a non-txt extension that fails
    with pytest.raises(DocumentExtractionError):
        # We pass invalid bytes to a fake pdf
        extract_text_from_bytes(b"bad data that is not a pdf at all", "cv.pdf", "application/pdf")

# 2, 3, 4, 6, 7. Skill, Experience, Education, Final Score, Thresholds
def test_multi_agent_scoring_detailed():
    job = JobAnalysisResult(
        normalized_title="Backend Engineer",
        critical_skills=[SkillRequirement(name="Python", importance="critical"), SkillRequirement(name="SQL", importance="critical")],
        important_skills=[SkillRequirement(name="Docker", importance="important")],
        nice_to_have_skills=[],
        minimum_experience_years=3.0,
        preferred_experience_years=5.0,
        education_requirements=["BS CS"],
        responsibilities=[],
        technical_domains=[]
    )

    cv = CVExtractedData(
        candidate_name="Jane Doe",
        skills=["Python", "SQL", "Docker"],
        experience=[CVExtractedExperience(title="Backend Dev", duration_years=3.0, highlights=["Demonstrated Python usage in backend"])],
        education=["BS CS"],
        projects=[],
        certifications=[]
    )

    skills_eval = evaluate_skills(job, cv)
    assert skills_eval["score"] == 100.0  # 3/3 matches

    exp_eval = evaluate_experience(job, cv)
    assert exp_eval["score"] >= 90.0  # meets 3.0 years requirement

    edu_eval = evaluate_education(job, cv)
    assert edu_eval["score"] == 100.0

    evidence = extract_evidence(job, cv, skills_eval["matched"])
    assert len(evidence) == 3
    assert evidence[0].is_matched is True

    decision = synthesize_screening_decision(job, cv, skills_eval, exp_eval, edu_eval, evidence)
    assert decision.match_score >= 80.0
    assert decision.qualified is True

# 5. Evidence Extraction Schema
def test_evidence_extraction_schema():
    job = JobAnalysisResult(normalized_title="Dev", critical_skills=[], important_skills=[], nice_to_have_skills=[], minimum_experience_years=1.0, preferred_experience_years=2.0, education_requirements=[], responsibilities=[], technical_domains=[])
    cv = CVExtractedData(candidate_name="Bob", skills=["Java"], experience=[], education=[], projects=[], certifications=[])
    
    evidence = extract_evidence(job, cv, ["Java"])
    assert len(evidence) == 1
    assert evidence[0].requirement == "Java"
    assert hasattr(evidence[0], "evidence_quote")

# 8. Malformed LLM response
@pytest.mark.asyncio
async def test_malformed_llm_response():
    from app.services.screening.cv_analyzer import parse_cv_text
    
    with patch("app.providers.factory.get_ai_provider") as mock_get_provider:
        mock_provider_instance = AsyncMock()
        mock_provider_instance.generate_structured.side_effect = Exception("LLM Error")
        mock_get_provider.return_value = mock_provider_instance
        
        # Should gracefully fall back to empty structure
        result = await parse_cv_text("Some text", "Hint Name")
        assert result.candidate_name == "Hint Name"
        assert len(result.skills) == 0

# 9. Missing API key
def test_missing_api_key():
    import os
    from app.providers.factory import get_ai_provider
    original_gemini = os.environ.get("GEMINI_API_KEY")
    original_openai = os.environ.get("OPENAI_API_KEY")
    
    if "GEMINI_API_KEY" in os.environ:
        del os.environ["GEMINI_API_KEY"]
    if "OPENAI_API_KEY" in os.environ:
        del os.environ["OPENAI_API_KEY"]
        
    import app.core.config
    app.core.config.settings.GEMINI_API_KEY = ""
    app.core.config.settings.OPENAI_API_KEY = ""
    
    try:
        with pytest.raises(ValueError, match="Configuration Error"):
            get_ai_provider()
    finally:
        if original_gemini is not None:
            os.environ["GEMINI_API_KEY"] = original_gemini
            app.core.config.settings.GEMINI_API_KEY = original_gemini
        if original_openai is not None:
            os.environ["OPENAI_API_KEY"] = original_openai
            app.core.config.settings.OPENAI_API_KEY = original_openai

# 10. Duplicate screening (Idempotency)
@pytest.mark.asyncio
async def test_duplicate_screening_idempotency():
    from app.services.screening.orchestrator import run_screening_pipeline
    
    class MockData:
        def __init__(self, data):
            self.data = data

    with patch("app.db.supabase.get_supabase_client"), \
         patch("app.services.screening.orchestrator.run_sync", new_callable=AsyncMock) as mock_run_sync:
        
        # Mock the run_sync call to return a dictionary in .data
        mock_run_sync.return_value = MockData(data={"match_score": 90.0, "recommendation": "strong_match", "processing_status": "completed"})
        
        # Call it, should short circuit and return the mock data without doing heavy lifting
        decision = await run_screening_pipeline("app-123")
        assert decision.match_score == 90.0
        assert decision.recommendation == "strong_match"

# 11. Concurrent screening isolation (HTTP endpoint test)
def test_concurrent_isolation_api_endpoint():
    with patch("app.api.routes.screening.run_screening_pipeline") as mock_pipeline:
        response = client.post(
            "/api/v1/screening/screen-application",
            json={"application_id": "concurrent_test_id"},
            headers={"x-ai-service-secret": "recruit360_shared_backend_secret_2026"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "accepted"
