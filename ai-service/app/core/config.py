from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    AI_SERVICE_PORT: int = 8000
    
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    AI_SERVICE_SHARED_SECRET: str = "recruit360_shared_backend_secret_2026"
    
    CV_PASS_THRESHOLD: float = 70.0
    ASSESSMENT_PASS_THRESHOLD: float = 60.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
