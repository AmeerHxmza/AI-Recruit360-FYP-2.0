from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.schemas.assessment import MCQAnswerSubmission, GeneratedMCQItem
from app.services.assessment.scorer import record_candidate_answer
from app.services.assessment.generator import generate_personalized_mcqs, _generate_questions
from app.core.exceptions import AssessmentGenerationError

@pytest.mark.asyncio
async def test_answer_ignores_browser_time_and_question_number():
    db = MagicMock()
    db.rpc.return_value.execute.return_value.data = {"status": "recorded"}
    submission = MCQAnswerSubmission(assessment_id="session", question_id="question", question_number=999, selected_option="b", time_taken_seconds=-999)
    with patch("app.services.assessment.scorer.get_supabase_client", return_value=db):
        assert await record_candidate_answer(submission) == {"status": "recorded"}
    db.rpc.assert_called_once_with("record_assessment_answer", {"_assessment": "session", "_question": "question", "_option": "B"})

@pytest.mark.asyncio
async def test_ai_outage_does_not_create_fallback_questions():
    provider = MagicMock(generate_structured=AsyncMock(side_effect=RuntimeError("Unavailable")))
    with patch("app.services.assessment.generator.get_supabase_client"), patch("app.services.assessment.generator.get_ai_provider", return_value=provider), patch("app.services.assessment.generator.run_sync", new_callable=AsyncMock) as database:
        with pytest.raises(AssessmentGenerationError):
            await _generate_questions("assessment", "Engineer", "Job", "Resume", ["Python"])
        database.assert_not_called()

@pytest.mark.asyncio
async def test_generation_retry_returns_saved_questions_without_correct_options():
    questions = [{"id":str(i),"assessment_id":"assessment","question_number":i,"question":"Question", "option_a":"A", "option_b":"B", "option_c":"C", "option_d":"D", "correct_option":"A"} for i in range(1,11)]
    with patch("app.services.assessment.generator.get_supabase_client"), patch("app.services.assessment.generator.run_sync", new=AsyncMock(side_effect=[SimpleNamespace(data=[{"id":"assessment","status":"in_progress"}]),SimpleNamespace(data=questions)])):
        result = await generate_personalized_mcqs(application_id="app")
    assert len(result["questions"]) == 10
    assert all("correct_option" not in question for question in result["questions"])

def test_invalid_generated_answer_key_is_rejected():
    with pytest.raises(ValueError):
        GeneratedMCQItem(question_number=1,question="Q",option_a="A",option_b="B",option_c="C",option_d="D",correct_option="E",explanation="Why",skill_category="SQL",difficulty="medium")
