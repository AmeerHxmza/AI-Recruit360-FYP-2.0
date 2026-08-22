import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, screening, assessments, interviews, evaluations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ai_service.main")

app = FastAPI(
    title="AI-Recruit360 Intelligence Engine",
    description="Python FastAPI Multi-Agent Recruitment Intelligence Service for CV Screening, Personalized MCQs, Adaptive AI Interviews, and Final Candidate Evaluations.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(screening.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(evaluations.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "service": "AI-Recruit360 Python AI Engine",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.AI_SERVICE_PORT, reload=True)
