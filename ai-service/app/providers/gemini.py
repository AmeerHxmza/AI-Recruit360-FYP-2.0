import re
import json
import logging
import httpx
from typing import TypeVar, Type
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.core.exceptions import AIProviderError, AIValidationError

T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger("ai_service.providers.gemini")

# ── Persistent connection-pooled HTTP/2 client (one per worker process) ───────
_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    """Return a module-level persistent httpx client with connection pooling."""
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=10.0),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            http2=True,
        )
    return _http_client


class GeminiProvider:
    name = "Google Gemini"

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL

        if not self.model_name:
            raise AIProviderError("Configure GEMINI_MODEL with an enabled model for your account.")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing.")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True,
    )
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> str:
        if not self.api_key:
            raise AIProviderError("GEMINI_API_KEY is not configured in Python ai-service environment.")

        # SECURITY: API key in header, NOT URL query parameter
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }

        # Build request body with native system_instruction support
        body: dict = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature},
        }
        if system_prompt:
            body["system_instruction"] = {"parts": [{"text": system_prompt}]}

        client = _get_http_client()
        try:
            response = await client.post(endpoint, json=body, headers=headers)

            if response.status_code != 200:
                raise AIProviderError(f"Gemini API returned HTTP {response.status_code}: {response.text[:500]}")

            data = response.json()
            text_output = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")

            if not text_output:
                raise AIProviderError("Gemini API returned an empty text response.")

            return text_output
        except httpx.RequestError as e:
            raise AIProviderError(f"HTTP request to Gemini API failed: {str(e)}")

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        augmented_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: You MUST return a strictly valid JSON object matching this JSON schema:\n"
            f"```json\n{schema_json}\n```\n"
            f"Return ONLY raw JSON. Do not add conversational text around it."
        )

        raw_text = await self.generate_text(
            prompt=augmented_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        )

        # 1. Clean markdown code fences
        clean_text = re.sub(r"^```json\s*", "", raw_text.strip(), flags=re.IGNORECASE)
        clean_text = re.sub(r"^```\s*", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.IGNORECASE).strip()

        # 2. Try direct parse
        try:
            parsed_data = json.loads(clean_text)
            return schema.model_validate(parsed_data)
        except Exception:
            pass

        # 3. Fallback: extract JSON substring via regex
        json_match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", clean_text)
        if json_match:
            try:
                parsed_data = json.loads(json_match.group(0))
                return schema.model_validate(parsed_data)
            except Exception as match_err:
                logger.error(f"Failed to validate extracted JSON match: {match_err}")

        logger.error(f"Gemini output parsing completely failed on: {raw_text[:500]}")
        raise AIValidationError("Failed to parse valid structured JSON from Gemini output.")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True,
    )
    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        if not self.api_key:
            raise AIProviderError("GEMINI_API_KEY is not configured in Python ai-service environment.")
            
        if not texts:
            return []

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }

        # Gemini expects {"requests": [{"model": "models/text-embedding-004", "content": {"parts": [{"text": t}]}}]}
        requests = [
            {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text}]}
            } for text in texts
        ]
        
        body = {"requests": requests}

        client = _get_http_client()
        try:
            response = await client.post(endpoint, json=body, headers=headers)
            
            if response.status_code != 200:
                raise AIProviderError(f"Gemini API returned HTTP {response.status_code}: {response.text[:500]}")
                
            data = response.json()
            embeddings = []
            
            for item in data.get("embeddings", []):
                embeddings.append(item.get("values", []))
                
            if len(embeddings) != len(texts):
                raise AIProviderError(f"Gemini returned {len(embeddings)} embeddings for {len(texts)} texts.")
                
            return embeddings
        except httpx.RequestError as e:
            raise AIProviderError(f"HTTP request to Gemini API failed: {str(e)}")
