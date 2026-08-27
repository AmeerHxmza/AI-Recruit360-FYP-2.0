import logging
import asyncio
import io
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import AIProviderError

logger = logging.getLogger("ai_service.services.interview.tts")

openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

def _generate_gtts_sync(text: str, lang: str, tld: str) -> bytes:
    from gtts import gTTS
    tts = gTTS(text=text, lang=lang, tld=tld, slow=False)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    return fp.getvalue()

async def generate_female_voice_tts(text: str, lang: str = "en", tld: str = "com") -> bytes:
    """
    Generate ultra-low-latency voice audio bytes using OpenAI tts-1 (voice: nova),
    with graceful fallback to gTTS.
    """
    if not text or len(text.strip()) == 0:
        raise AIProviderError("Text input for TTS voice generation cannot be empty.")

    clean_text = text.strip()

    if openai_client and settings.OPENAI_API_KEY:
        try:
            response = await openai_client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=clean_text,
                speed=1.05
            )
            return response.content
        except Exception as e:
            logger.warning(f"OpenAI TTS API call failed, falling back to gTTS: {e}")

    try:
        audio_bytes = await asyncio.to_thread(_generate_gtts_sync, clean_text, lang, tld)
        return audio_bytes
    except Exception as e:
        logger.error(f"gTTS fallback generation failed: {str(e)}")
        raise AIProviderError(f"Failed to generate interviewer voice audio: {str(e)}")
