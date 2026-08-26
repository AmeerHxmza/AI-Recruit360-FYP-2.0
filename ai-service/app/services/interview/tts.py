import logging
import asyncio
import io
from app.core.exceptions import AIProviderError

logger = logging.getLogger("ai_service.services.interview.tts")

def _generate_gtts_sync(text: str, lang: str, tld: str) -> bytes:
    from gtts import gTTS
    tts = gTTS(text=text, lang=lang, tld=tld, slow=False)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    return fp.getvalue()

async def generate_female_voice_tts(text: str, lang: str = "en", tld: str = "com") -> bytes:
    """
    Generate MP3 audio bytes using gTTS (Google TTS) in a threadpool to prevent blocking.
    """
    if not text or len(text.strip()) == 0:
        raise AIProviderError("Text input for TTS voice generation cannot be empty.")

    clean_text = text.strip()

    try:
        audio_bytes = await asyncio.to_thread(_generate_gtts_sync, clean_text, lang, tld)
        return audio_bytes
    except Exception as e:
        logger.error(f"gTTS generation failed: {str(e)}")
        raise AIProviderError(f"Failed to generate interviewer voice audio: {str(e)}")
