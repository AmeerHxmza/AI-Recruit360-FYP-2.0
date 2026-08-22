import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.assessment.generator import generate_personalized_mcqs
from app.services.assessment.scorer import record_candidate_answer, finalize_assessment_session
from app.schemas.assessment import CandidatePublicMCQItem, MCQAnswerSubmission, AssessmentFinalResult

logger = logging.getLogger("ai_service.api.routes.assessments")
router = APIRouter(prefix="/assessments", tags=["Assessments"])

class GenerateAssessmentRequest(BaseModel):
    application_id: str
    job_title: str
    job_description: str
    matched_skills: List[str] = []
    cv_summary: Optional[str] = None

class FinalizeAssessmentRequest(BaseModel):
    assessment_id: str

@router.post("/generate", response_model=List[CandidatePublicMCQItem])
async def generate_assessment(req: GenerateAssessmentRequest):
    try:
        return await generate_personalized_mcqs(
            application_id=req.application_id,
            job_title=req.job_title,
            job_description=req.job_description,
            matched_skills=req.matched_skills,
            cv_summary=req.cv_summary
        )
    except Exception as e:
        logger.error(f"Assessment generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-answer")
async def submit_answer(submission: MCQAnswerSubmission):
    try:
        return await record_candidate_answer(submission)
    except Exception as e:
        logger.error(f"Submit answer error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/finalize", response_model=AssessmentFinalResult)
async def finalize_assessment(req: FinalizeAssessmentRequest):
    try:
        return await finalize_assessment_session(req.assessment_id)
    except Exception as e:
        logger.error(f"Finalize assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
