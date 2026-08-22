import io
import logging
from pypdf import PdfReader
from docx import Document
from app.core.exceptions import DocumentExtractionError

logger = logging.getLogger("ai_service.services.cv.extractor")

def extract_text_from_bytes(file_bytes: bytes, file_name: str, mime_type: str | None = None) -> str:
    filename_lower = file_name.lower()

    if filename_lower.endswith(".pdf") or (mime_type and "pdf" in mime_type):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith(".docx") or (mime_type and "word" in mime_type):
        return extract_text_from_docx(file_bytes)
    elif filename_lower.endswith(".txt") or (mime_type and "text/plain" in mime_type):
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1", errors="ignore")
    else:
        # Fallback to UTF-8 decoding
        try:
            return file_bytes.decode("utf-8")
        except Exception:
            raise DocumentExtractionError(f"Unsupported document format for '{file_name}'. Standard PDF, DOCX, or TXT required.")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(text)
        
        extracted = "\n".join(pages_text).strip()
        if not extracted:
            raise DocumentExtractionError("PDF file returned empty text. OCR may be required if PDF is image-only.")
        return extracted
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise DocumentExtractionError(f"Failed to extract text from PDF document: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        extracted = "\n".join(paragraphs).strip()
        if not extracted:
            raise DocumentExtractionError("DOCX file returned empty text.")
        return extracted
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise DocumentExtractionError(f"Failed to extract text from DOCX document: {str(e)}")
