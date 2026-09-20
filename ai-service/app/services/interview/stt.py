import logging
import io
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import AIProviderError

logger = logging.getLogger("ai_service.services.interview.stt")

async def transcribe_audio_file(file_content: bytes, filename: str) -> str:
    """
    Transcribes audio bytes to text using OpenAI Whisper API.
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key or "your-openai-api-key" in api_key:
        raise AIProviderError("Voice transcription is not configured. Please type your answer instead.")

    try:
        # Wrap the bytes in a file-like object with a name attribute so openai client accepts it
        audio_file = io.BytesIO(file_content)
        audio_file.name = filename if filename else "audio.webm"
        
        async with AsyncOpenAI(api_key=api_key, timeout=45, max_retries=0) as client:
            response = await client.audio.transcriptions.create(
                model="whisper-1", file=audio_file
            )
        
        transcript = response.text
        if not transcript:
            raise AIProviderError("OpenAI returned an empty transcript.")
        
        return transcript
    except Exception as e:
        logger.error(f"OpenAI transcription error: {str(e)}")
        raise AIProviderError("Voice transcription is temporarily unavailable. Please retry or type your answer.") from e
