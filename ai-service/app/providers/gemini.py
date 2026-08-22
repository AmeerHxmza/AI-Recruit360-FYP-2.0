import re
import json
import logging
import httpx
from typing import TypeVar, Type
from pydantic import BaseModel
from app.core.config import settings
from app.core.exceptions import AIProviderError, AIValidationError

T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger("ai_service.providers.gemini")

class GeminiProvider:
    name = "Google Gemini"

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL or "gemini-1.5-flash"

        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing.")

    async def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        if not self.api_key:
            raise AIProviderError("GEMINI_API_KEY is not configured in Python ai-service environment.")

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"

        contents = []
        if system_prompt:
            contents.append({
                "role": "user",
                "parts": [{"text": f"SYSTEM INSTRUCTIONS:\n{system_prompt}"}]
            })
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    endpoint,
                    json={"contents": contents},
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code != 200:
                    raise AIProviderError(f"Gemini API returned HTTP {response.status_code}: {response.text}")

                data = response.json()
                text_output = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")

                if not text_output:
                    raise AIProviderError("Gemini API returned an empty text response.")

                return text_output
            except httpx.RequestError as e:
                raise AIProviderError(f"HTTP request to Gemini API failed: {str(e)}")

    async def generate_structured(
        self, prompt: str, schema: Type[T], system_prompt: str | None = None
    ) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        augmented_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: You MUST return a strictly valid JSON object matching this JSON schema:\n"
            f"```json\n{schema_json}\n```\n"
            f"Return ONLY raw JSON. Do not add conversational text around it."
        )

        raw_text = await self.generate_text(prompt=augmented_prompt, system_prompt=system_prompt)

        clean_json = re.sub(r"^```json\s*", "", raw_text, flags=re.IGNORECASE)
        clean_json = re.sub(r"^```\s*", "", clean_json, flags=re.IGNORECASE)
        clean_json = re.sub(r"\s*```$", "", clean_json, flags=re.IGNORECASE).strip()

        try:
            parsed_data = json.loads(clean_json)
            return schema.model_validate(parsed_data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {clean_json}")
            raise AIValidationError(f"Gemini API output was not valid JSON: {str(e)}")
        except Exception as e:
            logger.error(f"Schema validation failed: {str(e)}")
            raise AIValidationError(f"Gemini output failed model validation: {str(e)}")
