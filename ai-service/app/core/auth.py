"""
app/core/auth.py
────────────────
Shared secret authentication dependency for FastAPI.

All AI service endpoints (except /health) require the frontend to send
the shared secret via the Authorization header:

    Authorization: Bearer <AI_SERVICE_SHARED_SECRET>

This prevents unauthorized public access to the AI backend.
"""

import logging
from typing import Optional

from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

logger = logging.getLogger("ai_service.core.auth")

# Auto-scheme: returns None instead of 401 when header is missing
# (we handle the error ourselves for clearer messages)
_bearer_scheme = HTTPBearer(auto_error=False)


async def verify_service_secret(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer_scheme),
) -> None:
    """
    FastAPI dependency that validates the shared service secret.

    Usage:
        @router.post("/endpoint", dependencies=[Depends(verify_service_secret)])
        async def my_endpoint(...): ...

    Or apply globally to a router:
        router = APIRouter(dependencies=[Depends(verify_service_secret)])
    """
    # In development without a configured secret, allow all requests
    if not settings.AI_SERVICE_SHARED_SECRET:
        if settings.ENVIRONMENT == "production":
            logger.error("AI_SERVICE_SHARED_SECRET is not configured in production!")
            raise HTTPException(
                status_code=503,
                detail="Service misconfigured: authentication secret not set.",
            )
        return  # Development mode — skip auth

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header. Expected: Bearer <service_secret>",
        )

    if credentials.credentials != settings.AI_SERVICE_SHARED_SECRET:
        logger.warning("Invalid service secret received — rejecting request.")
        raise HTTPException(
            status_code=403,
            detail="Invalid service credentials.",
        )
