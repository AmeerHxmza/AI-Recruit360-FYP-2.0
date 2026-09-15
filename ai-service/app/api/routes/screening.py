"""CV screening endpoint; results are saved before the response is returned."""
import logging
from fastapi import APIRouter,HTTPException,Request
from pydantic import BaseModel
from app.core.rate_limit import limiter
from app.core.config import settings
from app.services.screening.orchestrator import run_screening_pipeline

logger=logging.getLogger(__name__)
router=APIRouter(prefix="/screening",tags=["CV Screening"])

class ScreenApplicationRequest(BaseModel):
    application_id: str

@router.post("/screen-application")
@limiter.limit(settings.RATE_LIMIT_SCREEN)
async def screen_application(request: Request,req: ScreenApplicationRequest):
    try:
        result=await run_screening_pipeline(req.application_id)
        return {"status":"completed","application_id":req.application_id,"result":result.model_dump()}
    except ValueError as error:
        raise HTTPException(status_code=400,detail=str(error)) from error
    except Exception as error:
        logger.exception("Screening failed")
        raise HTTPException(status_code=503,detail="Screening is unavailable. Your application is saved; please retry.") from error
