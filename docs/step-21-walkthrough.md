# STEP 21 Walkthrough — Candidate Document Intelligence / Ingestion Pipeline

## Overview
STEP 21 implements a server-only, multi-tenant candidate document ingestion pipeline for **AI-Recruit360**. It enables secure document upload, private Supabase storage placement, text extraction for PDF and DOC/DOCX resumes, text normalization, DB status tracking, AI activity logging, and test verification.

---

## 1. Files Created & Modified

### Created Files
- [`frontend/lib/ingestion/types.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/types.ts) — Ingestion parameters, interfaces, and parser types.
- [`frontend/lib/ingestion/errors.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/errors.ts) — Typed domain errors extending `AppError`.
- [`frontend/lib/ingestion/text-normalizer.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/text-normalizer.ts) — Normalization engine for cleaning control characters, newlines, and whitespace artifacts.
- [`frontend/lib/ingestion/document-parser.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/document-parser.ts) — `DocumentParser` interface and factory resolution logic.
- [`frontend/lib/ingestion/pdf-parser.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/pdf-parser.ts) — `PdfDocumentParser` using `pdf-parse`.
- [`frontend/lib/ingestion/docx-parser.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/docx-parser.ts) — `DocxDocumentParser` using `mammoth`.
- [`frontend/lib/ingestion/document-ingestion-service.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/document-ingestion-service.ts) — Core server-side orchestration service.
- [`frontend/lib/ingestion/actions.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/actions.ts) — Server action handler `uploadAndIngestCandidateDocumentAction`.
- [`frontend/components/candidates/candidate-document-uploader.tsx`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/components/candidates/candidate-document-uploader.tsx) — Drag & drop upload UI with status progress and text inspector modal.
- [`frontend/scripts/test-ingestion.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/scripts/test-ingestion.ts) — Automated verification test suite for all 10 test scenarios.
- [`docs/document-ingestion-architecture.md`](file:///d:/FinalYearProject(2026)/AI-Recruit360/docs/document-ingestion-architecture.md) — Architecture reference documentation.
- [`docs/step-21-walkthrough.md`](file:///d:/FinalYearProject(2026)/AI-Recruit360/docs/step-21-walkthrough.md) — Step completion walkthrough.

### Modified Files
- [`frontend/lib/ingestion/index.ts`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/lib/ingestion/index.ts) — Server-only boundary exports and runtime environment guards.
- [`frontend/app/candidates/[id]/page.tsx`](file:///d:/FinalYearProject(2026)/AI-Recruit360/frontend/app/candidates/[id]/page.tsx) — Candidate details page integrated with `CandidateDocumentUploader`.

---

## 2. Parser Libraries Used

- **`pdf-parse`**: Server-side Node PDF text extraction library. Wrapped with fallback handling to support both legacy CommonJS exports and ES module resolution.
- **`mammoth`**: Server-side DOCX text extraction library. Converts raw Word document structure into plain text preserving paragraphs without HTML styling overhead.

---

## 3. Security Decisions

1. **Strict Multi-Tenant Verification**: User identity, organization membership, candidate ownership, and RBAC permissions (`canManageDocuments`) are strictly validated on the server before storage or database operations occur.
2. **Private Storage Path Format**: Enforced path format `{organization_id}/{candidate_id}/{filename}` in Supabase private bucket `candidate-documents`.
3. **No Credential Exposure**: Supabase service-role keys and AI provider keys remain strictly server-side.
4. **No Unprocessed CV Logging**: Activity logs record only non-sensitive metadata (`file_name`, `file_size`, `parser_version`, `text_length`). Complete CV text is stored only in private database table `candidate_documents`.

---

## 4. Test Verification Results

Automated test runner output from `npx tsx scripts/test-ingestion.ts`:

```
=================================================
STEP 21: CANDIDATE DOCUMENT INGESTION TEST SUITE
=================================================

✅ [PASS] TEST 1: Valid PDF extraction
✅ [PASS] TEST 2: Valid DOCX extraction
✅ [PASS] TEST 3: Unsupported file type
✅ [PASS] TEST 4: File larger than 20 MB
✅ [PASS] TEST 5: Empty/corrupt document
✅ [PASS] TEST 6: Text normalization
✅ [PASS] TEST 7: Unauthorized organization upload
✅ [PASS] TEST 8: Candidate belonging to another organization
✅ [PASS] TEST 9: Processing failure correctly changes status to failed
✅ [PASS] TEST 10: Successful processing stores extracted_text and parser_version

=================================================
SUMMARY: 10 PASSED, 0 FAILED out of 10 tests.
=================================================
```

---

## 5. Build Verification Results

- `npm run lint`: **0 errors, 0 warnings**
- `npm run build`: **0 TypeScript / compilation errors**

---

## 6. Scope Boundary for Step 22

**Included in Step 21**:
- Secure document upload & private storage
- PDF & DOCX text extraction
- Text normalization pipeline
- Processing status lifecycle (`uploaded` -> `processing` -> `processed` / `failed`)
- Persisted extracted text in `candidate_documents`

**Explicitly Excluded (Belongs to Step 22 & Later)**:
- Candidate AI profile extraction
- Vector embeddings generation
- Candidate-job matching & vector similarity search
- Automated candidate ranking
- AI interview generation
