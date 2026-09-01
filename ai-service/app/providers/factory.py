import logging
from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.gemini import GeminiProvider
from app.providers.openai import OpenAIProvider

logger = logging.getLogger("ai_service.providers.factory")

# ── Singleton cache (one provider instance per worker process) ────────────────
_cached_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    """Return the cached AI provider singleton (instantiated once per worker)."""
    global _cached_provider
    if _cached_provider is not None:
        return _cached_provider

    provider_name = (settings.AI_PROVIDER or "").lower().strip()

    # 1. Preferred provider explicitly specified with configured key
    if provider_name == "openai" and settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        _cached_provider = OpenAIProvider()
    elif provider_name == "gemini" and settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        _cached_provider = GeminiProvider()
    # 2. Smart auto-detection based on configured keys (Prioritize OpenAI)
    elif settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        logger.info("[AI Factory] Auto-selected OpenAI provider based on configured API key.")
        _cached_provider = OpenAIProvider()
    elif settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        logger.info("[AI Factory] Auto-selected Gemini provider based on configured API key.")
        _cached_provider = GeminiProvider()
    else:
        # 3. If neither key is provided, raise Configuration Error
        raise ValueError("Configuration Error: No AI provider credentials found. Cannot start AI engine.")

    logger.info(f"[AI Factory] Provider initialised: {_cached_provider.name}")
    return _cached_provider
