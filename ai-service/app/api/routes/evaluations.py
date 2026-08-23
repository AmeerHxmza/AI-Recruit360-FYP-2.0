"""
app/api/routes/evaluations.py
──────────────────────────────
Final candidate evaluation API — rate-limited.
"""

import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.core.rate_limit import limiter
from app.core.config import settings
from app.services.evaluation.evaluator import generate_final_candidate_evaluation
from app.schemas.evaluation import FinalCandidateEvaluationPayload

logger = logging.getLogger("ai_service.api.routes.evaluations")
router = APIRouter(prefix="/evaluations", tags=["Candidate Evaluations"])


class GenerateEvaluationRequest(BaseModel):
    application_id: str


@router.post("/generate", response_model=FinalCandidateEvaluationPayload)
@limiter.limit(settings.RATE_LIMIT_EVALUATION)
async def generate_evaluation(request: Request, req: GenerateEvaluationRequest):
    """Generate the final consolidated hiring scorecard for a candidate."""
    try:
        return await generate_final_candidate_evaluation(req.application_id)
    except Exception as e:
        logger.error(f"Generate evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

