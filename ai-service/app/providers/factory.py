import logging
from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.gemini import GeminiProvider
from app.providers.openai import OpenAIProvider

logger = logging.getLogger("ai_service.providers.factory")

def get_ai_provider() -> AIProvider:
    provider_name = (settings.AI_PROVIDER or "").lower().strip()

    # 1. Preferred provider explicitly specified with configured key
    if provider_name == "openai" and settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        return OpenAIProvider()
    if provider_name == "gemini" and settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        return GeminiProvider()

    # 2. Smart auto-detection based on configured keys
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        logger.info("[AI Factory] Auto-selected OpenAI provider based on configured API key.")
        return OpenAIProvider()
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        logger.info("[AI Factory] Auto-selected Gemini provider based on configured API key.")
        return GeminiProvider()

    # 3. If neither key is provided, raise Configuration Error
    raise ValueError("Configuration Error: No AI provider credentials found. Cannot start AI engine.")
