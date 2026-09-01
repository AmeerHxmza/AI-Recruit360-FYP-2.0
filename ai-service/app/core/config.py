from typing import Optional, List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    AI_SERVICE_PORT: int = 8000
    WORKER_COUNT: int = 4  # Gunicorn worker processes (2 * CPU cores + 1 recommended)

    # ── Supabase ────────────────────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ── AI Providers ────────────────────────────────────────────────────────────
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "EXAVITQu4vr4xnSDxMaL"  # Bella
    
    SIMLI_API_KEY: Optional[str] = None
    SIMLI_FACE_ID: str = "cace3ef7-a4c4-425d-a8cf-a5358eb0c427"

    # ── Security ─────────────────────────────────────────────────────────────────
    AI_SERVICE_SHARED_SECRET: str = ""
    # Comma-separated list or JSON array loaded from env
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-recruit360.vercel.app",
        "https://ai-recruit360-fyp.onrender.com",
    ]

    # ── Keep-Alive / Anti-Sleep Configuration ────────────────────────────────────
    RENDER_EXTERNAL_URL: str = "https://ai-recruit360-fyp.onrender.com"
    KEEP_ALIVE_INTERVAL_MINUTES: int = 12
    ENABLE_KEEP_ALIVE: bool = True

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://ai-recruit360.vercel.app",
            "https://ai-recruit360-fyp.onrender.com",
        ]
        if isinstance(v, str):
            v = v.strip()
            if v == "*":
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    return list(set(parsed + default_origins))
                except Exception:
                    pass
            custom = [origin.strip() for origin in v.split(",") if origin.strip()]
            return list(set(custom + default_origins))
        if isinstance(v, list):
            return list(set(v + default_origins))
        return default_origins

    # ── Redis (Distributed Cache + ARQ Job Queue) ───────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL_SECONDS: int = 3600        # 1 hour default cache TTL
    REDIS_JOB_TTL_SECONDS: int = 86400         # 24-hour job result retention

    # ── AI Scoring Thresholds ───────────────────────────────────────────────────
    CV_PASS_THRESHOLD: float = 70.0
    ASSESSMENT_PASS_THRESHOLD: float = 60.0

    # ── Rate Limiting ───────────────────────────────────────────────────────────
    RATE_LIMIT_SCREEN: str = "20/minute"       # CV screening per IP
    RATE_LIMIT_ASSESSMENT: str = "30/minute"   # Assessment ops per IP
    RATE_LIMIT_INTERVIEW: str = "60/minute"    # Interview ops per IP
    RATE_LIMIT_EVALUATION: str = "10/minute"   # Final evaluation per IP

    # ── OpenTelemetry Observability ──────────────────────────────────────────────
    OTLP_ENDPOINT: Optional[str] = None        # e.g. https://api.honeycomb.io/v1/traces
    OTLP_HEADERS: Optional[str] = None         # e.g. x-honeycomb-team=YOUR_KEY

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

