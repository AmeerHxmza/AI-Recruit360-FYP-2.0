import io
import logging
from gtts import gTTS
from app.core.exceptions import AIProviderError

logger = logging.getLogger("ai_service.services.interview.tts")

def generate_female_voice_tts(text: str, lang: str = "en", tld: str = "com") -> bytes:
    """
    Generate MP3 audio bytes using free female voice Google Text-to-Speech (gTTS).
    tld="co.uk" or "com" produces clear natural female accents.
    """
    if not text or len(text.trim() if hasattr(text, "trim") else text.strip()) == 0:
        raise AIProviderError("Text input for TTS voice generation cannot be empty.")

    clean_text = text.strip()

    try:
        # gTTS default voice in English (tld="co.uk" or "com") is a natural female voice
        tts = gTTS(text=clean_text, lang=lang, tld=tld, slow=False)
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        return audio_fp.read()
    except Exception as e:
        logger.error(f"Text-to-Speech generation failed: {str(e)}")
        raise AIProviderError(f"Failed to generate interviewer voice audio: {str(e)}")
