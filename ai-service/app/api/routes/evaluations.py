import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.evaluation.evaluator import generate_final_candidate_evaluation
from app.schemas.evaluation import FinalCandidateEvaluationPayload

logger = logging.getLogger("ai_service.api.routes.evaluations")
router = APIRouter(prefix="/evaluations", tags=["Candidate Evaluations"])

class GenerateEvaluationRequest(BaseModel):
    application_id: str

@router.post("/generate", response_model=FinalCandidateEvaluationPayload)
async def generate_evaluation(req: GenerateEvaluationRequest):
    try:
        return await generate_final_candidate_evaluation(req.application_id)
    except Exception as e:
        logger.error(f"Generate evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
