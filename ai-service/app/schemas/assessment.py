from pydantic import BaseModel, Field
from typing import List

class GeneratedMCQItem(BaseModel):
    question_number: int = Field(ge=1, le=10)
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str = Field(description="A | B | C | D")
    explanation: str
    skill_category: str
    difficulty: str = Field(description="easy | medium | hard")

class GeneratedAssessmentPayload(BaseModel):
    questions: List[GeneratedMCQItem] = Field(min_length=10, max_length=10)

class CandidatePublicMCQItem(BaseModel):
    id: str
    question_number: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    skill_category: str
    difficulty: str

class MCQAnswerSubmission(BaseModel):
    assessment_id: str
    question_id: str
    question_number: int
    selected_option: str
    time_taken_seconds: int

class AssessmentFinalResult(BaseModel):
    assessment_id: str
    total_questions: int
    correct_answers: int
    score: float
    percentage: float
    passed: bool
