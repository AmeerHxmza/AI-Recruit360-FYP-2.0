from typing import Protocol, TypeVar, Type
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class AIProvider(Protocol):
    name: str

    async def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        ...

    async def generate_structured(
        self, prompt: str, schema: Type[T], system_prompt: str | None = None
    ) -> T:
        ...
