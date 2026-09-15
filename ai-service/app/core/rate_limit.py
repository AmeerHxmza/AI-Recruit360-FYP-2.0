"""In-memory rate limiting for the single-process FYP service."""
from slowapi import Limiter
from slowapi.util import get_remote_address


# Limits reset when the local service restarts.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
    default_limits=["200/minute"],
)
