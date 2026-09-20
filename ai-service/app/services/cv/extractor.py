import io
import logging
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
        try:
            return file_bytes.decode("utf-8")
        except Exception:
            raise DocumentExtractionError(f"Unsupported document format for '{file_name}'. Standard PDF, DOCX, or TXT required.")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """High-performance PDF text extraction using PyMuPDF (fitz) with fallback to pypdf."""
    # 1. Extract text with PyMuPDF; retain pypdf as a compatibility fallback.
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            text = page.get_text("text")
            if text and text.strip():
                pages_text.append(text.strip())
        doc.close()
        
        extracted = "\n".join(pages_text).strip()
        if extracted:
            return extracted
    except Exception as fitz_err:
        logger.warning(f"PyMuPDF extraction failed, trying pypdf fallback: {str(fitz_err)}")

    # 2. Fallback: pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        
        extracted = "\n".join(pages_text).strip()
        if not extracted:
            raise DocumentExtractionError("PDF file returned empty text. Image-only PDFs require OCR.")
        return extracted
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise DocumentExtractionError(f"Failed to extract text from PDF document: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        from docx.text.paragraph import Paragraph
        blocks = []
        for block in doc.iter_inner_content():
            if isinstance(block, Paragraph):
                blocks.append(block.text)
            else:
                # Resume templates often put all experience/skills inside tables.
                for row in block.rows:
                    blocks.append(" | ".join(cell.text for cell in row.cells))
        extracted = "\n".join(text for text in blocks if text.strip()).strip()
        if not extracted:
            raise DocumentExtractionError("DOCX file returned empty text.")
        return extracted
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise DocumentExtractionError(f"Failed to extract text from DOCX document: {str(e)}")
