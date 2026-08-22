import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("ai_service.supabase")

_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not key:
        logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.")
        # Create dummy client if unset to prevent crashes during startup inspection
        url = url or "https://placeholder.supabase.co"
        key = key or "placeholder-key"

    _supabase_client = create_client(url, key)
    return _supabase_client
