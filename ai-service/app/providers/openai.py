import re
import json
import logging
import asyncio
from typing import TypeVar, Type, List
from pydantic import BaseModel
from openai import AsyncOpenAI
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.core.exceptions import AIProviderError, AIValidationError

T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger("ai_service.providers.openai")

class OpenAIProvider:
    name = "OpenAI (gpt-4o-mini)"
    
    # Class-level semaphore to bound concurrent API requests
    _semaphore = asyncio.Semaphore(10)

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model_name = model_name or settings.OPENAI_MODEL or "gpt-4o-mini"
        self.embedding_model = "text-embedding-3-small"

        if self.api_key and "your-openai-api-key" not in self.api_key:
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                timeout=httpx.Timeout(45.0)  # 45 seconds total timeout
            )
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY is not configured in Python environment.")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2
    ) -> str:
        if not self.client:
            logger.warning("OPENAI_API_KEY is unconfigured. Using heuristic fallback response.")
            return (
                "Candidate demonstrates relevant experience, technical skills, and project accomplishments "
                "suitable for the position requirements. Candidate is recommended for assessment."
            )

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            async with self._semaphore:
                response = await self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=1500
                )

            text_output = response.choices[0].message.content
            if not text_output:
                raise AIProviderError("OpenAI returned empty text response.")

            return text_output
        except Exception as e:
            logger.error(f"OpenAI completion error: {str(e)}")
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str | None = None,
        temperature: float = 0.2
    ) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        augmented_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: You MUST return a strictly valid JSON object matching this JSON schema:\n"
            f"```json\n{schema_json}\n```\n"
            f"Return ONLY raw JSON."
        )

        raw_text = await self.generate_text(
            prompt=augmented_prompt,
            system_prompt=system_prompt,
            temperature=temperature
        )

        clean_text = re.sub(r"^```json\s*", "", raw_text.strip(), flags=re.IGNORECASE)
        clean_text = re.sub(r"^```\s*", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.IGNORECASE).strip()

        try:
            parsed_data = json.loads(clean_text)
            return schema.model_validate(parsed_data)
        except Exception:
            json_match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", clean_text)
            if json_match:
                try:
                    return schema.model_validate(json.loads(json_match.group(0)))
                except Exception as match_err:
                    logger.error(f"OpenAI JSON match validation failed: {match_err}")
            raise AIValidationError("OpenAI output validation failed.")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_embedding(self, text: str) -> List[float]:
        if not self.client:
            return [0.0] * 1536

        try:
            async with self._semaphore:
                response = await self.client.embeddings.create(
                    model=self.embedding_model,
                    input=text[:4000]
                )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding generation failed: {str(e)}")
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        if not self.client or not texts:
            return [[0.0] * 1536 for _ in texts]

        try:
            # Safe truncation for each text chunk
            safe_texts = [text[:4000] for text in texts]
            async with self._semaphore:
                response = await self.client.embeddings.create(
                    model=self.embedding_model,
                    input=safe_texts
                )
            # Ensure correct order
            return [data.embedding for data in sorted(response.data, key=lambda x: x.index)]
        except Exception as e:
            logger.error(f"OpenAI batch embedding generation failed: {str(e)}")
            raise e

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(x * y for x, y in zip(v1, v2))
    norm1 = sum(x * x for x in v1) ** 0.5
    norm2 = sum(x * x for x in v2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)
