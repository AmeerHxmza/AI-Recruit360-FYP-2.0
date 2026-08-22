# Candidate Document Ingestion Architecture

## Executive Summary
STEP 21 implements a server-only, multi-tenant candidate document ingestion pipeline for **AI-Recruit360**. It handles secure file uploading, storage isolation, text extraction from PDF and DOC/DOCX documents, normalization, and database status lifecycle management.

---

## Ingestion Architecture

```
User (Client)
  │
  ▼
Server Action / Service Boundary (`ingestCandidateDocument`)
  ├── 1. Verify User Session & Org Membership
  ├── 2. Verify Candidate Tenant Ownership
  ├── 3. Validate File Rules (MIME, Extension, Max 20 MB Limit)
  ├── 4. Upload to Private Bucket (`candidate-documents/{org_id}/{cand_id}/{filename}`)
  ├── 5. Create DB Record (`candidate_documents` with `processing_status = 'processing'`)
  ├── 6. Extract Raw Text (PdfDocumentParser / DocxDocumentParser)
  ├── 7. Normalize Text (Strip nulls, control chars, clean excessive linebreaks)
  ├── 8. Update DB Record (`processing_status = 'processed'`, `extracted_text`, `parser_version`)
  └── 9. Log Safe AI Activity Stream Event (`document_ingest_completed`)
```

---

## Key Modules & Responsibilities

| File Path | Description |
|---|---|
| `frontend/lib/ingestion/index.ts` | Server-only boundary export file with runtime environment guards. |
| `frontend/lib/ingestion/types.ts` | Core domain interfaces, parser results, ingestion params, and DB row mappings. |
| `frontend/lib/ingestion/errors.ts` | Domain-specific typed errors (`DocumentValidationError`, `UnsupportedDocumentError`, `DocumentStorageError`, `DocumentExtractionError`, `DocumentProcessingError`). |
| `frontend/lib/ingestion/document-parser.ts` | Abstract `DocumentParser` interface and factory `getParserForDocument(...)`. |
| `frontend/lib/ingestion/pdf-parser.ts` | `PdfDocumentParser` extracting text via `pdf-parse` (supports function & class exports). |
| `frontend/lib/ingestion/docx-parser.ts` | `DocxDocumentParser` extracting raw text via `mammoth`. |
| `frontend/lib/ingestion/text-normalizer.ts` | Text normalization engine cleaning control characters, linebreaks, and formatting artifacts. |
| `frontend/lib/ingestion/document-ingestion-service.ts` | Server-side orchestration service handling auth, storage, database records, and failure recovery. |
| `frontend/lib/ingestion/actions.ts` | Server Action handler for browser UI uploads. |

---

## Multi-Tenant Security & Storage Contract

1. **Authentication & Membership**: User must be authenticated and active member of requested `organization_id`.
2. **Candidate Ownership**: Candidate ID must exist within the authenticated organization (`public.candidates(id, organization_id)`).
3. **RBAC Authorization**: User role must have `"documents:upload"` permission (`owner`, `admin`, `recruiter`).
4. **Supabase Storage Path**: Storage path MUST match `{organization_id}/{candidate_id}/{filename}` in the private `candidate-documents` bucket.
5. **Credentials Boundary**: Service role credentials or raw credentials are NEVER exposed to the browser.

---

## Supported Formats & OCR Extension Strategy

- **Supported Text Formats**:
  - `PDF` (`application/pdf`)
  - `DOCX` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
  - `DOC` (`application/msword`)
- **Image Formats (PNG/JPEG)**:
  - Allowed for file upload & storage, but text extraction is explicitly flagged with `UnsupportedDocumentError` ("OCR not implemented yet"). No fake text is synthesized.
- **Future OCR Extension**:
  - An `OcrDocumentParser` implementing `DocumentParser` can be registered into `registeredParsers` in Step 23 without breaking existing service contracts.

---

## Processing Status Lifecycle

- `uploaded`: File uploaded to storage before processing begins.
- `processing`: Document currently undergoing parser text extraction and normalization.
- `processed`: Extraction and normalization completed successfully; `extracted_text` and `parser_version` populated.
- `failed`: Extraction failed due to corrupt document, scanned PDF, or unsupported format. State updated immediately in DB.

---

## Audit & Error Safeguards

- Activity logging records only non-sensitive metadata (`file_name`, `file_size`, `parser_version`, `extracted_text_length`).
- CV content, credentials, or personal identifiers are NEVER stored inside `ai_activity_logs.metadata`.
