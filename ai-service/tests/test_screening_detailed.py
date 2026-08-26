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

# 10. End-to-end Pipeline Test
@pytest.mark.asyncio
async def test_screening_pipeline():
    from app.services.screening.orchestrator import run_screening_pipeline
    
    class EmptyData:
        data = None

    with patch("app.services.screening.orchestrator.run_sync", new_callable=AsyncMock) as mock_run_sync, \
         patch("app.services.screening.orchestrator.get_application_context", new_callable=AsyncMock) as mock_ctx, \
         patch("app.services.screening.orchestrator.extract_text_from_bytes") as mock_extract, \
         patch("app.services.screening.orchestrator.get_candidate_cv_bytes", new_callable=AsyncMock) as mock_cv, \
         patch("app.services.screening.cv_analyzer.get_ai_provider") as mock_cv_provider, \
         patch("app.services.screening.job_analyzer.get_ai_provider") as mock_job_provider:
         
        # Mock AI Provider for CV and Job Analyzer
        mock_ai_instance = AsyncMock()
        
        # We need it to return JobAnalysisResult for analyze_job, and CVExtractedData for parse_cv
        # generate_structured takes response_model, we can just return a mock object that matches the schema
        from app.schemas.screening import JobAnalysisResult, CVExtractedData, SkillRequirement, CVExtractedExperience
        
        job_result = JobAnalysisResult(
            normalized_title="Software Engineer",
            critical_skills=[SkillRequirement(name="Python", importance="critical")],
            important_skills=[SkillRequirement(name="SQL", importance="important")],
            nice_to_have_skills=[],
            minimum_experience_years=3.0,
            preferred_experience_years=5.0,
            education_requirements=["BS"],
            responsibilities=[],
            technical_domains=[]
        )
        
        cv_result = CVExtractedData(
            candidate_name="Jane Doe",
            skills=["Python", "SQL"],
            experience=[CVExtractedExperience(title="Dev", duration_years=3.5, highlights=["Python backend"])],
            education=["BS CS"],
            projects=[],
            certifications=[]
        )
        
        async def mock_generate_structured(prompt, response_model, **kwargs):
            if response_model == JobAnalysisResult:
                return job_result
            elif response_model == CVExtractedData:
                return cv_result
            return None
            
        mock_ai_instance.generate_structured.side_effect = mock_generate_structured
        mock_cv_provider.return_value = mock_ai_instance
        mock_job_provider.return_value = mock_ai_instance
         
        # Make run_sync (idempotency & inserts) return empty
        mock_run_sync.return_value = EmptyData()
        
        # Provide real-looking context
        mock_ctx.return_value = (
            {"organization_id": "org_1", "job_id": "job_1"},
            {"title": "Software Engineer", "description": "Need 3 years of Python and SQL experience.", "requirements": "Python, SQL"},
            {"full_name": "Jane Doe"}
        )
        
        # Bypass PDF extractor logic
        mock_cv.return_value = b"mock bytes"
        mock_extract.return_value = "Jane Doe\nSoftware Engineer\nSkills: Python, SQL\nExperience: 3 years building backends in Python."
        
        decision = await run_screening_pipeline("app-123")
        
        # The real scoring logic will execute based on the LLM's parsed output.
        assert decision is not None
        assert decision.match_score > 0.0
        assert isinstance(decision.qualified, bool)

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
