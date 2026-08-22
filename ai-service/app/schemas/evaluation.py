from pydantic import BaseModel, Field
from typing import List

class FinalCandidateEvaluationPayload(BaseModel):
    cv_score: float = Field(ge=0.0, le=100.0)
    assessment_score: float = Field(ge=0.0, le=100.0)
    interview_score: float = Field(ge=0.0, le=100.0)
    overall_score: float = Field(ge=0.0, le=100.0)
    recommendation: str = Field(description="strong_hire | hire | review | no_hire")
    strengths: List[str]
    weaknesses: List[str]
    evidence: List[str]
    ai_summary: str
