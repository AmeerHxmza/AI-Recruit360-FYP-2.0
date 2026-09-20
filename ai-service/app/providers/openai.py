"""One bounded structured-output request per workflow operation.

API contract: https://developers.openai.com/api/docs/guides/structured-outputs
"""
import asyncio
from typing import TypeVar
from pydantic import BaseModel
from openai import AsyncOpenAI, APIConnectionError, AuthenticationError, RateLimitError
from app.core.config import settings
from app.core.exceptions import AIProviderError

T = TypeVar("T", bound=BaseModel)

class OpenAIProvider:
    name = "OpenAI"
    _semaphore = asyncio.Semaphore(4)

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        key = api_key or settings.OPENAI_API_KEY
        if not key or key.startswith("your-"):
            raise AIProviderError("Configure OPENAI_API_KEY to enable AI processing.")
        self.model_name = model_name or settings.OPENAI_MODEL
        self.client = AsyncOpenAI(api_key=key,timeout=60.0,max_retries=0)

    async def generate_structured(self,prompt: str,schema: type[T],system_prompt: str | None = None,temperature: float = 0.2) -> T:
        messages = [{"role":"system","content":system_prompt or "Return the requested structured result."},{"role":"user","content":prompt}]
        try:
            async with self._semaphore:
                completion = await self.client.chat.completions.parse(
                    model=self.model_name,messages=messages,response_format=schema,
                    temperature=temperature,max_completion_tokens=6000,
                )
            message=completion.choices[0].message
            if message.refusal or message.parsed is None:
                raise AIProviderError("AI could not produce a valid assessment. Please retry.")
            return message.parsed
        except AIProviderError:
            raise
        except APIConnectionError as error:
            raise AIProviderError("The AI provider could not be reached. Check the backend internet connection and DNS, then retry.") from error
        except AuthenticationError as error:
            raise AIProviderError("The AI provider credentials were rejected. The project administrator must check the backend API key.") from error
        except RateLimitError as error:
            raise AIProviderError("The AI provider limit was reached. Check API quota or retry later.") from error
        except Exception as error:
            raise AIProviderError("AI processing is temporarily unavailable. Please retry.") from error

