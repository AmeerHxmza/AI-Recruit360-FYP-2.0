import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUser,
  getCurrentRole,
  getOrganizationContext,
} from "@/lib/auth/session";
import { canManageDocuments } from "@/lib/auth/permissions";
import { getCandidateById } from "@/lib/services/candidate-service";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import {
  DocumentIngestionParams,
  DocumentIngestionResult,
  CandidateDocumentRow,
} from "./types";
import {
  DocumentValidationError,
  DocumentStorageError,
  DocumentExtractionError,
  DocumentProcessingError,
  UnsupportedDocumentError,
} from "./errors";
import { DocumentParser, getParserForDocument } from "./document-parser";
import { PdfDocumentParser } from "./pdf-parser";
import { DocxDocumentParser } from "./docx-parser";
import { normalizeExtractedText } from "./text-normalizer";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

const registeredParsers: DocumentParser[] = [
  new PdfDocumentParser(),
  new DocxDocumentParser(),
];

export async function ingestCandidateDocument(
  params: DocumentIngestionParams,
): Promise<DocumentIngestionResult> {
  // 1. Server-Only Execution Boundary
  if (typeof window !== "undefined") {
    throw new DocumentProcessingError(
      "Ingestion service can only be executed on the server.",
    );
  }

  const {
    organizationId,
    candidateId,
    applicationId,
    documentType = "resume",
    fileName,
    fileType,
    fileBuffer,
  } = params;

  // 2. File Validation
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new DocumentValidationError("Uploaded document is empty (0 bytes).");
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new DocumentValidationError(
      "Uploaded document exceeds the maximum 4 MB size limit.",
    );
  }

  if (!fileName || fileName.trim().length === 0) {
    throw new DocumentValidationError("Filename is required.");
  }

  // Sanitize filename to avoid directory traversal or corrupt paths
  const sanitizedFileName = fileName.trim().replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storagePath = `${organizationId}/${candidateId}/${crypto.randomUUID()}-${sanitizedFileName}`;

  // 3. Multi-Tenant Authorization & RBAC Checks
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(
      "Authentication required to ingest candidate document.",
    );
  }

  const orgCtx = await getOrganizationContext(organizationId);
  if (!orgCtx || orgCtx.organization.id !== organizationId) {
    throw new ForbiddenError(
      "Access denied for requested organization context.",
    );
  }

  const role = await getCurrentRole(organizationId);
  if (!canManageDocuments(role)) {
    throw new ForbiddenError(
      "You do not have RBAC permission to upload candidate documents.",
    );
  }

  // 4. Candidate Ownership Verification (Ensures candidate belongs to org)
  const candidate = await getCandidateById(organizationId, candidateId);
  if (!candidate) {
    throw new NotFoundError(
      "Target candidate profile not found in your organization workspace.",
    );
  }

  const supabase = await createClient();

  if (applicationId) {
    const { data: application, error } = await supabase
      .from("applications")
      .select("status")
      .eq("id", applicationId)
      .eq("candidate_id", candidateId)
      .eq("organization_id", organizationId)
      .single();
    if (error || !application)
      throw new ForbiddenError(
        "Application does not belong to this candidate.",
      );
    if (!["applied", "extraction_failed"].includes(application.status))
      throw new DocumentValidationError(
        "Resume evidence cannot be replaced after screening has started.",
      );
  }

  // 5. Upload File to Supabase Private Storage Bucket ('candidate_documents')
  const { error: storageError } = await supabase.storage
    .from("candidate_documents")
    .upload(storagePath, fileBuffer, {
      contentType: fileType || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    console.error(
      "[DocumentIngestion] Storage upload failed:",
      storageError.message,
    );
    throw new DocumentStorageError(
      `Failed to upload file to storage: ${storageError.message}`,
    );
  }

  // 6. Create or Update Metadata Record in candidate_documents table
  // Check if existing record exists for storage_path
  const { data: existingDoc } = await supabase
    .from("candidate_documents")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("storage_path", storagePath)
    .maybeSingle();

  let documentRecord: CandidateDocumentRow;

  if (existingDoc) {
    const { data: updatedDoc, error: updateError } = await supabase
      .from("candidate_documents")
      .update({
        original_filename: sanitizedFileName,
        mime_type: fileType,
        file_size: fileBuffer.length,
        document_type: documentType,
        extraction_status: "processing",
        application_id: applicationId || null,
      })
      .eq("id", existingDoc.id)
      .select("*")
      .single();

    if (updateError || !updatedDoc) {
      throw new DocumentProcessingError(
        "Failed to update candidate document processing status.",
      );
    }
    documentRecord = updatedDoc;
  } else {
    const { data: insertedDoc, error: insertError } = await supabase
      .from("candidate_documents")
      .insert({
        organization_id: organizationId,
        candidate_id: candidateId,
        application_id: applicationId || null,
        original_filename: sanitizedFileName,
        mime_type: fileType,
        storage_path: storagePath,
        file_size: fileBuffer.length,
        document_type: documentType,
        extraction_status: "processing",
      })
      .select("*")
      .single();

    if (insertError || !insertedDoc) {
      throw new DocumentProcessingError(
        "Failed to create candidate document record.",
      );
    }
    documentRecord = insertedDoc;
  }

  // 7. Select Parser and Process Text Extraction & Normalization
  try {
    const parser = getParserForDocument(
      fileType,
      sanitizedFileName,
      registeredParsers,
    );

    // Perform text extraction
    const rawResult = await parser.parse(fileBuffer);

    // Normalize text
    const normalizedText = normalizeExtractedText(rawResult.text);

    if (!normalizedText || normalizedText.length === 0) {
      throw new DocumentExtractionError(
        "Extracted text was empty after normalization.",
        "DOCUMENT_TEXT_EXTRACTION_FAILED",
      );
    }

    const processedAt = new Date().toISOString();

    // 8. Update DB with Extracted Text & Processed Status
    const { data: finalDoc, error: finalError } = await supabase
      .from("candidate_documents")
      .update({
        extraction_status: "completed",
        extracted_text: normalizedText,
      })
      .eq("id", documentRecord.id)
      .select("*")
      .single();

    if (finalError || !finalDoc) {
      throw new DocumentProcessingError(
        "Failed to update processed document metadata.",
      );
    }

    return {
      document: finalDoc,
      extractedText: normalizedText,
      processingStatus: "processed",
      parserVersion: rawResult.parserVersion,
      processedAt,
    };
  } catch (error) {
    // 10. Failure Recovery: Set processing_status = 'failed'
    await supabase
      .from("candidate_documents")
      .update({
        extraction_status: "failed",
      })
      .eq("id", documentRecord.id);

    if (
      error instanceof DocumentValidationError ||
      error instanceof UnsupportedDocumentError ||
      error instanceof DocumentStorageError ||
      error instanceof DocumentExtractionError ||
      error instanceof DocumentProcessingError
    ) {
      throw error;
    }

    throw new DocumentProcessingError(
      `Document ingestion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
