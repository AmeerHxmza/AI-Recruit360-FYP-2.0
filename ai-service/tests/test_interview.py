from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.services.interview.response_evaluator import evaluate_interview_response
from app.services.evaluation.evaluator import generate_final_candidate_evaluation

@pytest.mark.asyncio
async def test_question_from_another_interview_is_rejected_before_ai():
    records=[SimpleNamespace(data=[]),SimpleNamespace(data=[{"status":"in_progress"}]),SimpleNamespace(data=[])]
    with patch("app.services.interview.response_evaluator.get_supabase_client"),patch("app.services.interview.response_evaluator.run_sync",new=AsyncMock(side_effect=records)),patch("app.services.interview.response_evaluator.get_ai_provider") as provider:
        with pytest.raises(ValueError,match="does not belong"):
            await evaluate_interview_response("interview","other-question","Answer")
        provider.assert_not_called()

@pytest.mark.asyncio
async def test_response_retry_returns_saved_score():
    row={"technical_score":70,"communication_score":80,"relevance_score":90,"ai_feedback":"Saved feedback"}
    with patch("app.services.interview.response_evaluator.get_supabase_client"),patch("app.services.interview.response_evaluator.run_sync",new=AsyncMock(return_value=SimpleNamespace(data=[row]))),patch("app.services.interview.response_evaluator.get_ai_provider") as provider:
        result=await evaluate_interview_response("interview","question","Different answer")
    assert result.technical_score==70
    provider.assert_not_called()

@pytest.mark.asyncio
async def test_final_evaluation_never_invents_missing_assessment_score():
    records=[SimpleNamespace(data=[{"status":"completed"}]),SimpleNamespace(data=[{"match_score":80}]),SimpleNamespace(data=[]),SimpleNamespace(data=[{"id":"interview"}]),SimpleNamespace(data=[{"organization_id":"org"}])]
    with patch("app.services.evaluation.evaluator.get_supabase_client") as db,patch("app.services.evaluation.evaluator.run_sync",new=AsyncMock(side_effect=records)):
        with pytest.raises(ValueError,match="Complete screening and assessment"):
            await generate_final_candidate_evaluation("app")
        db.return_value.rpc.assert_not_called()

@pytest.mark.asyncio
async def test_missing_transcription_key_does_not_fabricate_an_answer(monkeypatch):
    from app.core.config import settings
    from app.core.exceptions import AIProviderError
    from app.services.interview.stt import transcribe_audio_file
    monkeypatch.setattr(settings,"OPENAI_API_KEY",None)
    with pytest.raises(AIProviderError,match="type your answer"):
        await transcribe_audio_file(b"audio","answer.webm")
