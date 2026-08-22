import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from app.services.screening.job_analyzer import analyze_job_requirements
from app.services.screening.orchestrator import run_screening_pipeline
from app.services.cv.extractor import extract_text_from_bytes
from app.schemas.screening import JobAnalysisResult, ScreeningDecisionResult

logger = logging.getLogger("ai_service.api.routes.screening")
router = APIRouter(prefix="/screening", tags=["CV Screening"])

class AnalyzeJobRequest(BaseModel):
    job_id: str
    title: str
    description: str
    requirements: Optional[str] = None

class ScreenApplicationRequest(BaseModel):
    application_id: str
    job_title: str
    job_description: str
    job_requirements: Optional[str] = None
    cv_text: str
    candidate_name: Optional[str] = "Candidate"
    organization_id: Optional[str] = None
    candidate_id: Optional[str] = None
    job_id: Optional[str] = None

@router.post("/analyze-job", response_model=JobAnalysisResult)
async def analyze_job(req: AnalyzeJobRequest):
    try:
        return await analyze_job_requirements(req.title, req.description, req.requirements)
    except Exception as e:
        logger.error(f"Job analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/screen-application", response_model=ScreeningDecisionResult)
async def screen_application(req: ScreenApplicationRequest):
    try:
        return await run_screening_pipeline(
            application_id=req.application_id,
            job_title=req.job_title,
            job_description=req.job_description,
            job_requirements=req.job_requirements,
            cv_text=req.cv_text,
            candidate_name=req.candidate_name or "Candidate",
            organization_id=req.organization_id,
            candidate_id=req.candidate_id,
            job_id=req.job_id
        )
    except Exception as e:
        logger.error(f"CV screening error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-cv")
async def extract_cv_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_text = extract_text_from_bytes(content, file.filename or "cv.pdf", file.content_type)
        return {"filename": file.filename, "extracted_text": extracted_text}
    except Exception as e:
        logger.error(f"CV extraction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
