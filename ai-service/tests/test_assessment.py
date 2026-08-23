import pytest
from app.services.assessment.generator import generate_fallback_mcqs

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
