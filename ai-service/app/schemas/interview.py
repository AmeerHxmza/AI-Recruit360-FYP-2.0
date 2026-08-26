from pydantic import BaseModel, Field
from typing import List, Optional

class GeneratedInterviewQuestion(BaseModel):
    id: Optional[str] = None
    question_number: int
    question_text: str
    question_type: str = Field(description="technical | behavioral | situational | follow_up")
    skill_category: str
    source: str = Field(description="job | cv | previous_answer | adaptive")
    is_follow_up: bool = False

class InterviewResponseEvaluation(BaseModel):
    technical_score: float = Field(ge=0.0, le=100.0)
    communication_score: float = Field(ge=0.0, le=100.0)
    relevance_score: float = Field(ge=0.0, le=100.0)
    overall_score: float = Field(ge=0.0, le=100.0)
    feedback: str
    strengths: List[str]
    areas_for_improvement: List[str]

class NextInterviewQuestionResponse(BaseModel):
    interview_id: str
    completed: bool
    current_question: Optional[GeneratedInterviewQuestion] = None
    questions_answered: int
    total_questions: int
