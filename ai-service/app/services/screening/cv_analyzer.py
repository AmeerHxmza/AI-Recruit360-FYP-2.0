import logging
from typing import List
from app.providers.factory import get_ai_provider
from app.schemas.screening import CVMetaData

logger = logging.getLogger("ai_service.services.screening.cv_analyzer")

SYSTEM_PROMPT = """You are an ultra-fast CV Metadata Extractor.
Given the text of a CV, extract ONLY the total accumulated years of professional experience (as a float, e.g., 5.5) and whether the candidate holds a Bachelor's degree or higher (true/false).
Do not extract skills or descriptions. Be extremely brief."""

def chunk_cv_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    """Splits raw CV text into overlapping chunks for vectorization."""
    # Simple whitespace split to avoid breaking words
    words = text.split()
    chunks = []
    
    current_chunk = []
    current_length = 0
    
    for word in words:
        current_chunk.append(word)
        current_length += len(word) + 1
        
        if current_length >= chunk_size:
            chunks.append(" ".join(current_chunk))
            
            # Keep overlap for next chunk
            overlap_words = []
            overlap_length = 0
            for w in reversed(current_chunk):
                if overlap_length + len(w) > overlap:
                    break
                overlap_words.insert(0, w)
                overlap_length += len(w) + 1
                
            current_chunk = overlap_words
            current_length = overlap_length

    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

async def fast_extract_metadata(cv_text: str, candidate_name_hint: str = "Candidate") -> CVMetaData:
    provider = get_ai_provider()
    
    prompt = (
        f"CANDIDATE NAME HINT: {candidate_name_hint}\n\n"
        f"CV TEXT EXTRACT:\n{cv_text[:4000]}\n\n"
        f"Extract candidate name, total years of experience, and if they have a degree."
    )

    try:
        result = await provider.generate_structured(
            prompt=prompt,
            schema=CVMetaData,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.0
        )
        result.raw_text = cv_text
        return result
    except Exception as e:
        logger.error(f"CV fast metadata extraction failed: {str(e)}")
        # Provide clean fallback extraction if AI provider fails
        return CVMetaData(
            candidate_name=candidate_name_hint,
            total_years_experience=0.0,
            has_degree=False,
            raw_text=cv_text
        )
