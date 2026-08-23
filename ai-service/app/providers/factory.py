import logging
from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.gemini import GeminiProvider
from app.providers.openai import OpenAIProvider

logger = logging.getLogger("ai_service.providers.factory")

def get_ai_provider() -> AIProvider:
    provider_name = settings.AI_PROVIDER.lower().strip()

    if provider_name == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("Configuration Error: OPENAI_API_KEY is missing but provider is set to openai.")
        return OpenAIProvider()

    if provider_name == "gemini":
        if not settings.GEMINI_API_KEY:
            raise ValueError("Configuration Error: GEMINI_API_KEY is missing but provider is set to gemini.")
        return GeminiProvider()

    # Fallbacks if AI_PROVIDER is not set explicitly
    if settings.OPENAI_API_KEY:
        return OpenAIProvider()
    if settings.GEMINI_API_KEY:
        return GeminiProvider()
        
    raise ValueError("Configuration Error: No AI provider credentials found. Cannot start AI engine.")
