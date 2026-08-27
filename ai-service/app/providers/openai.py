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

        clean_json = re.sub(r"^```json\s*", "", raw_text, flags=re.IGNORECASE)
        clean_json = re.sub(r"^```\s*", "", clean_json, flags=re.IGNORECASE)
        clean_json = re.sub(r"\s*```$", "", clean_json, flags=re.IGNORECASE).strip()

        try:
            parsed_data = json.loads(clean_json)
            return schema.model_validate(parsed_data)
        except Exception as e:
            logger.error(f"OpenAI structured parsing failed: {str(e)}")
            json_match = re.search(r"\{.*\}", clean_json, re.DOTALL)
            if json_match:
                try:
                    return schema.model_validate(json.loads(json_match.group(0)))
                except Exception:
                    pass
            raise AIValidationError(f"OpenAI output validation error: {str(e)}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_embedding(self, text: str) -> List[float]:
        if not self.client:
            # Return 1536-dim normalized zero vector for offline/unconfigured embedding fallback
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
