import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.assessment.generator import generate_fallback_mcqs, generate_personalized_mcqs
from app.services.assessment.scorer import record_candidate_answer, finalize_assessment_session
from app.schemas.assessment import MCQAnswerSubmission
from app.core.config import settings

def test_fallback_mcqs_generator():
    job_title = "Senior AI Engineer"
    skills = ["Python", "FastAPI", "RAG"]

    payload = generate_fallback_mcqs(job_title, skills)

    assert len(payload.questions) == 10
    for idx, item in enumerate(payload.questions, start=1):
        assert item.question_number == idx
        assert item.correct_option in ["A", "B", "C", "D"]
        assert item.option_a is not None
        assert item.option_b is not None
        assert item.option_c is not None
        assert item.option_d is not None
        assert item.difficulty in ["easy", "medium", "hard"]

@pytest.mark.asyncio
@patch("app.services.assessment.generator.run_sync")
async def test_generate_mcqs_idempotency(mock_run_sync):
    """Test that if an assessment already exists, we return it instead of regenerating."""
    
    # Mocking existing assessment
    mock_existing_assessment = MagicMock()
    mock_existing_assessment.data = [{"id": "ass_123"}]
    
    # Mocking existing questions
    mock_existing_questions = MagicMock()
    mock_existing_questions.data = [
        {"id": f"q_{i}", "assessment_id": "ass_123", "question_number": i, "option_a": "A", "option_b": "B", "option_c": "C", "option_d": "D"}
        for i in range(1, 11)
    ]
    
    mock_run_sync.side_effect = [
        mock_existing_assessment, # check assessment
        mock_existing_questions   # check questions
    ]
    
    result = await generate_personalized_mcqs(application_id="app_123")
    
    assert len(result) == 10
    assert result[0].assessment_id == "ass_123"
    # Ensure AI provider was NOT called
    assert mock_run_sync.call_count == 2

@pytest.mark.asyncio
@patch("app.services.assessment.scorer.get_supabase_client")
async def test_server_side_timer_validation(mock_get_supabase):
    """Test that answers submitted after the 30s limit (with 5s network grace) are marked as incorrect."""
    
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    # Mock question lookup (correct answer is A)
    mock_q_res = MagicMock()
    mock_q_res.data = [{"id": "q_123", "correct_option": "A"}]
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_q_res
    
    # Mock upsert lookup (doesn't exist)
    mock_existing_ans = MagicMock()
    mock_existing_ans.data = []
    
    # Override select behavior based on chain calls isn't perfect with simple MagicMocks
    # But we can just test the logic inside record_candidate_answer using side_effects if needed.
    # To keep it simple, we'll patch the table behavior.
    def mock_table(table_name):
        t = MagicMock()
        if table_name == "assessment_questions":
            t.select.return_value.eq.return_value.execute.return_value = mock_q_res
        elif table_name == "assessment_answers":
            t.select.return_value.eq.return_value.execute.return_value = mock_existing_ans
        return t
        
    mock_supabase.table.side_effect = mock_table
    
    # Submit correct answer, but time taken is 36 seconds (> 35s limit)
    sub = MCQAnswerSubmission(
        assessment_id="ass_123",
        question_id="q_123",
        question_number=1,
        selected_option="A",
        time_taken_seconds=36
    )
    
    res = await record_candidate_answer(sub)
    
    assert res["status"] == "recorded"
    assert res["timed_out"] is True
    
    # The insert should have been called with is_correct = False
    insert_call = mock_supabase.table("assessment_answers").insert.call_args[0][0]
    assert insert_call["is_correct"] is False
    assert insert_call["time_taken_seconds"] == 36

@pytest.mark.asyncio
@patch("app.services.assessment.scorer.get_supabase_client")
async def test_finalize_assessment_scoring(mock_get_supabase):
    """Test final scoring calculation and application status update."""
    
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    def mock_table(table_name):
        t = MagicMock()
        if table_name == "assessments":
            # Return assessment
            res = MagicMock()
            res.data = [{"id": "ass_123", "application_id": "app_123", "total_questions": 10}]
            t.select.return_value.eq.return_value.execute.return_value = res
        elif table_name == "assessment_answers":
            # Return 8 correct out of 10
            res = MagicMock()
            res.data = [{"is_correct": True} for _ in range(8)] + [{"is_correct": False} for _ in range(2)]
            t.select.return_value.eq.return_value.execute.return_value = res
        return t
        
    mock_supabase.table.side_effect = mock_table
    
    settings.ASSESSMENT_PASS_THRESHOLD = 70.0
    
    res = await finalize_assessment_session("ass_123")
    
    assert res.score == 80.0
    assert res.passed is True
    
    # Check if update was called to set application status to interview
    update_app_call = mock_supabase.table("applications").update.call_args[0][0]
    assert update_app_call["status"] == "interview"
