import { AppError } from "@/lib/utils/errors";

export class DocumentIngestionError extends AppError {
  constructor(message: string, statusCode = 400, code = "DOCUMENT_INGESTION_ERROR") {
    super(message, statusCode, code);
  }
}

export class DocumentValidationError extends DocumentIngestionError {
  constructor(message: string) {
    super(message, 422, "DOCUMENT_VALIDATION_ERROR");
  }
}

export class UnsupportedDocumentError extends DocumentIngestionError {
  constructor(message = "Unsupported document format for text extraction.") {
    super(message, 415, "UNSUPPORTED_DOCUMENT_TYPE");
  }
}

export class DocumentStorageError extends DocumentIngestionError {
  constructor(message = "Failed to store document in secure storage bucket.") {
    super(message, 500, "DOCUMENT_STORAGE_ERROR");
  }
}

export class DocumentExtractionError extends DocumentIngestionError {
  constructor(message = "Failed to extract text from document.", code = "DOCUMENT_TEXT_EXTRACTION_FAILED") {
    super(message, 422, code);
  }
}

export class DocumentProcessingError extends DocumentIngestionError {
  constructor(message = "An error occurred during document ingestion processing.") {
    super(message, 500, "DOCUMENT_PROCESSING_FAILED");
  }
}
