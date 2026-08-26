"""
app/api/routes/screening.py
────────────────────────────
CV Screening API — rate-limited to prevent LLM cost abuse.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request
from pydantic import BaseModel

from app.core.rate_limit import limiter
from app.core.config import settings
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


@router.post("/analyze-job", response_model=JobAnalysisResult)
@limiter.limit(settings.RATE_LIMIT_SCREEN)
async def analyze_job(request: Request, req: AnalyzeJobRequest):
    """Analyse job requirements and extract structured skill taxonomy."""
    try:
        return await analyze_job_requirements(req.title, req.description, req.requirements)
    except Exception as e:
        logger.error(f"Job analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screen-application")
@limiter.limit(settings.RATE_LIMIT_SCREEN)
async def screen_application(request: Request, req: ScreenApplicationRequest, background_tasks: __import__('fastapi').BackgroundTasks):
    """
    Run Multi-Agent CV screening pipeline asynchronously in the background.
    """
    try:
        background_tasks.add_task(run_screening_pipeline, req.application_id)
        return {"status": "accepted", "message": "Screening started in the background", "application_id": req.application_id}
    except Exception as e:
        logger.error(f"Failed to start CV screening: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-cv")
@limiter.limit("5/minute")
async def extract_cv_document(request: Request, file: UploadFile = File(...)):
    """Extract plain text from a PDF/DOCX CV upload."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds 10MB limit.")
        
    allowed_mimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    if file.content_type not in allowed_mimes:
        raise HTTPException(status_code=415, detail="Unsupported MIME type. Only PDF, DOCX, and TXT are allowed.")

    try:
        content = await file.read()
        extracted_text = extract_text_from_bytes(
            content, file.filename or "cv.pdf", file.content_type
        )
        return {"filename": file.filename, "extracted_text": extracted_text}
    except Exception as e:
        logger.error(f"CV extraction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

