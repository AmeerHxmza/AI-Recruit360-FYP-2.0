import asyncio
import pytest
from app.core.operation_lock import serialized
from app.services.cv.extractor import extract_text_from_bytes

@pytest.mark.asyncio
async def test_same_resource_requests_are_serialized():
    active=0
    maximum=0
    @serialized("test")
    async def operation(application_id):
        nonlocal active,maximum
        active+=1
        maximum=max(maximum,active)
        await asyncio.sleep(0)
        active-=1
    await asyncio.gather(operation(application_id="same"),operation("same"))
    assert maximum==1

def test_plain_text_resume_extraction_preserves_evidence():
    assert extract_text_from_bytes(b"Built Python APIs", "resume.txt", "text/plain")=="Built Python APIs"
