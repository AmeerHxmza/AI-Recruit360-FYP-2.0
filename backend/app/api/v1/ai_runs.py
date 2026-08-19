from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_ai_runs():
    return {"ai_runs": []}
