import time
import logging
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger("ai_service.core.cache")

class FastMemoryCache:
    """High-performance in-memory TTL + LRU cache to reduce LLM costs."""
    def __init__(self, default_ttl_seconds: int = 3600, max_items: int = 500):
        self.default_ttl = default_ttl_seconds
        self.max_items = max_items
        self._store: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None

        val, expires_at = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            return None

        return val

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = time.time() + ttl

        # Evict oldest item if capacity reached
        if len(self._store) >= self.max_items and key not in self._store:
            oldest_key = next(iter(self._store))
            del self._store[oldest_key]

        self._store[key] = (value, expires_at)

    def clear(self) -> None:
        self._store.clear()

ai_cache = FastMemoryCache()
