import base64
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.services.interview.tts import synthesize_question


@pytest.mark.asyncio
async def test_speech_rejects_question_outside_interview():
    with patch("app.services.interview.tts.get_supabase_client"), patch("app.services.interview.tts.run_sync", new=AsyncMock(return_value=SimpleNamespace(data=[]))), patch("app.services.interview.tts.AsyncOpenAI") as provider:
        with pytest.raises(ValueError, match="does not belong"):
            await synthesize_question("interview", "other-question")
        provider.assert_not_called()


@pytest.mark.asyncio
async def test_speech_uses_saved_text_and_configured_voice(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "test-only")
    monkeypatch.setattr(settings, "OPENAI_TTS_VOICE", "nova")
    provider = MagicMock()
    provider.audio.speech.create = AsyncMock(return_value=SimpleNamespace(content=b"RIFF-test"))
    context = MagicMock()
    context.__aenter__ = AsyncMock(return_value=provider)
    context.__aexit__ = AsyncMock(return_value=None)
    db = MagicMock()
    db.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[{"question_text": "Describe your project."}])
    with patch("app.services.interview.tts.get_supabase_client", return_value=db), patch("app.services.interview.tts.AsyncOpenAI", return_value=context):
        result = await synthesize_question("interview", "question")
    provider.audio.speech.create.assert_awaited_once_with(model="tts-1", voice="nova", input="Describe your project.", response_format="wav")
    assert base64.b64decode(result["audio"]) == b"RIFF-test"
    assert db.table.return_value.select.return_value.eq.call_args.args == ("id", "question")
    assert db.table.return_value.select.return_value.eq.return_value.eq.call_args.args == ("interview_id", "interview")
