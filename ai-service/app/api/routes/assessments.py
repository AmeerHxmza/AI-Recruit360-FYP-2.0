"""
app/api/routes/assessments.py
──────────────────────────────
MCQ Assessment API — rate-limited.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.core.rate_limit import limiter
from app.core.config import settings
from app.services.assessment.generator import generate_personalized_mcqs
from app.services.assessment.scorer import record_candidate_answer, finalize_assessment_session
from app.schemas.assessment import CandidatePublicMCQItem, MCQAnswerSubmission, AssessmentFinalResult

logger = logging.getLogger("ai_service.api.routes.assessments")
router = APIRouter(prefix="/assessments", tags=["Assessments"])


class GenerateAssessmentRequest(BaseModel):
    application_id: str


class FinalizeAssessmentRequest(BaseModel):
    assessment_id: str


@router.post("/generate", response_model=List[CandidatePublicMCQItem])
@limiter.limit(settings.RATE_LIMIT_ASSESSMENT)
async def generate_assessment(request: Request, req: GenerateAssessmentRequest):
    """Generate 10 personalized MCQs for a candidate assessment."""
    try:
        return await generate_personalized_mcqs(application_id=req.application_id)
    except Exception as e:
        logger.error(f"Assessment generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit-answer")
@limiter.limit(settings.RATE_LIMIT_ASSESSMENT)
async def submit_answer(request: Request, submission: MCQAnswerSubmission):
    """Record a single candidate MCQ answer with server-side timer validation."""
    try:
        return await record_candidate_answer(submission)
    except Exception as e:
        logger.error(f"Submit answer error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/finalize", response_model=AssessmentFinalResult)
@limiter.limit(settings.RATE_LIMIT_ASSESSMENT)
async def finalize_assessment(request: Request, req: FinalizeAssessmentRequest):
    """Finalize assessment, compute score, and update application stage."""
    try:
        return await finalize_assessment_session(req.assessment_id)
    except Exception as e:
        logger.error(f"Finalize assessment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

