import logging
from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.gemini import GeminiProvider
from app.providers.openai import OpenAIProvider

logger = logging.getLogger("ai_service.providers.factory")

def get_ai_provider() -> AIProvider:
    provider_name = settings.AI_PROVIDER.lower().strip()

    if provider_name == "openai" or settings.OPENAI_API_KEY:
        return OpenAIProvider()

    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()

    if settings.OPENAI_API_KEY:
        return OpenAIProvider()
    
    return GeminiProvider()
