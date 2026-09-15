"""Read saved interview questions using a consistent configured voice."""
import base64
from openai import AsyncOpenAI
from app.core.config import settings
from app.db.supabase import get_supabase_client, run_sync


async def synthesize_question(interview_id: str, question_id: str) -> dict:
    db = get_supabase_client()
    result = await run_sync(lambda: db.table("interview_questions")
        .select("question_text").eq("id", question_id)
        .eq("interview_id", interview_id).limit(1).execute())
    if not result.data:
        raise ValueError("Question does not belong to this interview.")
    text = result.data[0]["question_text"]
    if not text or len(text) > 4000:
        raise ValueError("Question is unavailable for audio playback.")
    if not settings.OPENAI_API_KEY:
        raise ValueError("Configure the backend OpenAI key to enable interviewer speech.")
    async with AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=45, max_retries=0) as client:
        response = await client.audio.speech.create(
            model="tts-1", voice=settings.OPENAI_TTS_VOICE,
            input=text, response_format="wav",
        )
    return {"audio": base64.b64encode(response.content).decode("ascii"), "mime_type": "audio/wav"}
