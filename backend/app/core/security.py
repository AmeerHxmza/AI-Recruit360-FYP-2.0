from datetime import datetime, timedelta, timezone
from typing import Optional, Any


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    """Placeholder for JWT creation."""
    return "token_placeholder"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Placeholder for password verification."""
    return True


def get_password_hash(password: str) -> str:
    """Placeholder for password hashing."""
    return f"hashed_{password}"
