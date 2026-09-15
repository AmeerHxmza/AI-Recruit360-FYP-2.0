from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.services.screening.orchestrator import run_screening_pipeline
from app.schemas.screening import ScreeningDecisionResult

@pytest.mark.asyncio
@pytest.mark.parametrize("failure", ["extraction", "provider"])
async def test_outages_do_not_reject_or_assign_zero(failure):
    provider=MagicMock(generate_structured=AsyncMock(side_effect=RuntimeError("Provider unavailable")))
    cv = AsyncMock(side_effect=RuntimeError("Download unavailable")) if failure=="extraction" else AsyncMock(return_value=(b"", "resume.txt", "text/plain", "Resume evidence"))
    db=MagicMock()
    with patch("app.services.screening.orchestrator.get_supabase_client",return_value=db), patch("app.services.screening.orchestrator.run_sync",new=AsyncMock(return_value=SimpleNamespace(data=[]))), patch("app.services.screening.orchestrator.get_application_context",new=AsyncMock(return_value=({"status":"applied","organization_id":"org"},{"title":"Engineer"},{"full_name":"Candidate"}))), patch("app.services.screening.orchestrator.get_candidate_cv_data",new=cv), patch("app.services.screening.orchestrator.get_ai_provider",return_value=provider):
        with pytest.raises(ValueError): await run_screening_pipeline("app")
    db.rpc.assert_not_called()

@pytest.mark.asyncio
async def test_existing_result_does_not_call_ai():
    row={"match_score":80,"recommendation":"match","skills_score":80,"experience_score":80,"education_score":80,"keyword_score":80,"matched_skills":[],"missing_skills":[],"matched_experience":[],"missing_requirements":[],"evidence":[],"reasoning_summary":"Saved evidence"}
    with patch("app.services.screening.orchestrator.get_supabase_client"), patch("app.services.screening.orchestrator.run_sync",new=AsyncMock(return_value=SimpleNamespace(data=[row]))),patch("app.services.screening.orchestrator.get_ai_provider") as provider:
        result=await run_screening_pipeline("app")
        assert result.match_score==80
        provider.assert_not_called()

@pytest.mark.asyncio
async def test_screening_uses_configured_threshold_and_atomic_persistence(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "CV_PASS_THRESHOLD", 70)
    decision=ScreeningDecisionResult(match_score=80,recommendation="no_match",qualified=False,skills_score=80,experience_score=80,education_score=80,relevance_score=80,matched_skills=["Python"],missing_skills=[],matched_experience=[],missing_requirements=[],evidence=[],reasoning_summary="Relevant project evidence")
    provider=MagicMock(generate_structured=AsyncMock(return_value=decision))
    db=MagicMock()
    db.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data=[]
    with patch("app.services.screening.orchestrator.get_supabase_client",return_value=db),patch("app.services.screening.orchestrator.get_application_context",new=AsyncMock(return_value=({"status":"applied","organization_id":"org","job_id":"job"},{"title":"Engineer"},{"full_name":"Candidate"}))),patch("app.services.screening.orchestrator.get_candidate_cv_data",new=AsyncMock(return_value=(b"","resume.txt","text/plain","Built Python APIs"))),patch("app.services.screening.orchestrator.get_ai_provider",return_value=provider):
        result=await run_screening_pipeline("app")
    assert result.qualified is True
    assert result.recommendation=="match"
    assert db.rpc.call_args.args[0]=="save_screening_result"
    assert db.rpc.call_args.args[1]["_qualified"] is True
