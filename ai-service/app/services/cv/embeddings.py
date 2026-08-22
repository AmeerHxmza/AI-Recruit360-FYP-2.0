import math
import logging
from typing import List
from app.providers.openai import OpenAIProvider
from app.core.config import settings

logger = logging.getLogger("ai_service.services.cv.embeddings")

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(b * b for b in v2))

    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    similarity = dot_product / (norm_v1 * norm_v2)
    return max(0.0, min(1.0, similarity))

async def generate_vector_embedding(text: str) -> List[float]:
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY unset, returning dummy 1536-dim zero vector.")
        return [0.0] * 1536

    try:
        provider = OpenAIProvider()
        return await provider.generate_embedding(text)
    except Exception as e:
        logger.error(f"Failed to calculate embedding: {str(e)}")
        return [0.0] * 1536
