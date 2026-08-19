from fastapi import APIRouter
from app.api.v1 import (
    auth,
    jobs,
    candidates,
    applications,
    interviews,
    evaluations,
    ai_runs,
    health,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(ai_runs.router, prefix="/ai-runs", tags=["ai-runs"])
api_router.include_router(health.router, tags=["health"])
