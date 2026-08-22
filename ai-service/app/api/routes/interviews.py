import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.interview.question_generator import get_or_create_interview_session, generate_next_interview_question
from app.services.interview.response_evaluator import evaluate_interview_response
from app.schemas.interview import NextInterviewQuestionResponse, InterviewResponseEvaluation

logger = logging.getLogger("ai_service.api.routes.interviews")
router = APIRouter(prefix="/interviews", tags=["AI Interviews"])

class InitializeInterviewRequest(BaseModel):
    application_id: str

class NextQuestionRequest(BaseModel):
    interview_id: str

class EvaluateResponseRequest(BaseModel):
    interview_id: str
    question_id: str
    response_text: str

@router.post("/initialize")
async def initialize_interview(req: InitializeInterviewRequest):
    try:
        return await get_or_create_interview_session(req.application_id)
    except Exception as e:
        logger.error(f"Initialize interview error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/next-question", response_model=NextInterviewQuestionResponse)
async def next_question(req: NextQuestionRequest):
    try:
        return await generate_next_interview_question(req.interview_id)
    except Exception as e:
        logger.error(f"Next question error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-response", response_model=InterviewResponseEvaluation)
async def evaluate_response(req: EvaluateResponseRequest):
    try:
        return await evaluate_interview_response(req.interview_id, req.question_id, req.response_text)
    except Exception as e:
        logger.error(f"Evaluate response error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class TTSRequest(BaseModel):
    text: str
    tld: str = "com"

@router.post("/tts")
async def generate_interview_tts(req: TTSRequest):
    try:
        from fastapi.responses import Response
        from app.services.interview.tts import generate_female_voice_tts
        audio_bytes = generate_female_voice_tts(req.text, tld=req.tld)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS audio error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

