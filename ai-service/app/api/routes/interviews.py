"""
app/api/routes/interviews.py
─────────────────────────────
AI Adaptive Interview API — rate-limited.
"""

import logging

from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from pydantic import BaseModel

from app.core.rate_limit import limiter
from app.core.config import settings
from app.services.interview.question_generator import (
    get_or_create_interview_session,
    generate_next_interview_question,
)
from app.services.interview.response_evaluator import evaluate_interview_response
from app.schemas.interview import NextInterviewQuestionResponse, InterviewResponseEvaluation

logger = logging.getLogger("ai_service.api.routes.interviews")
router = APIRouter(prefix="/interviews", tags=["AI Interviews"])


class InitializeInterviewRequest(BaseModel):
    application_id: str


class NextQuestionRequest(BaseModel):
    interview_id: str


class InterviewSpeechRequest(BaseModel):
    interview_id: str
    question_id: str


@router.post("/speech")
@limiter.limit("10/minute")
async def interview_speech(request: Request, req: InterviewSpeechRequest):
    from app.services.interview.tts import synthesize_question
    try:
        return await synthesize_question(req.interview_id, req.question_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.warning("Interview speech unavailable: %s", type(error).__name__)
        raise HTTPException(status_code=503, detail="Interviewer audio is unavailable. You can still read and answer the question.") from error


class EvaluateResponseRequest(BaseModel):
    interview_id: str
    question_id: str
    response_text: str


@router.post("/initialize")
@limiter.limit(settings.RATE_LIMIT_INTERVIEW)
async def initialize_interview(request: Request, req: InitializeInterviewRequest):
    """Create or retrieve an existing adaptive interview session."""
    try:
        return await get_or_create_interview_session(req.application_id)
    except Exception as e:
        logger.error(f"Initialize interview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/next-question", response_model=NextInterviewQuestionResponse)
@limiter.limit(settings.RATE_LIMIT_INTERVIEW)
async def next_question(request: Request, req: NextQuestionRequest):
    """Fetch or generate the next adaptive interview question."""
    try:
        return await generate_next_interview_question(req.interview_id)
    except Exception as e:
        logger.error(f"Next question error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-response", response_model=InterviewResponseEvaluation)
@limiter.limit(settings.RATE_LIMIT_INTERVIEW)
async def evaluate_response(request: Request, req: EvaluateResponseRequest):
    """Evaluate a candidate's interview answer using LLM scoring."""
    try:
        return await evaluate_interview_response(
            req.interview_id, req.question_id, req.response_text
        )
    except Exception as e:
        logger.error(f"Evaluate response error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt")
@limiter.limit("30/minute")
async def process_speech_to_text(request: Request, audio: UploadFile = File(...)):
    """Transcribe audio bytes to text using OpenAI Whisper."""
    try:
        from app.services.interview.stt import transcribe_audio_file
        content = await audio.read(10 * 1024 * 1024 + 1)
        if len(content) > 10 * 1024 * 1024:
            raise ValueError("Recording exceeds 10 MB. Please use a shorter answer.")
        transcript = await transcribe_audio_file(content, audio.filename)
        return {"transcript": transcript}
    except Exception as e:
        logger.error(f"STT audio error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

