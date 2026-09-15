"use server";

import { ingestCandidateDocument } from "./document-ingestion-service";
import { DocumentType } from "./types";
import { handleServerError } from "@/lib/utils/errors";

export interface IngestActionResult {
  success: boolean;
  document?: Record<string, unknown>;
  extractedText?: string | null;
  error?: string;
  code?: string;
}

export async function uploadAndIngestCandidateDocumentAction(
  formData: FormData,
): Promise<IngestActionResult> {
  try {
    const organizationId = formData.get("organizationId") as string;
    const candidateId = formData.get("candidateId") as string;
    const documentType =
      (formData.get("documentType") as DocumentType) || "resume";
    const applicationId = (formData.get("applicationId") as string) || null;
    const file = formData.get("file") as File;

    if (!organizationId || !candidateId || !file) {
      return {
        success: false,
        error:
          "Missing required parameters: organizationId, candidateId, or file.",
        code: "VALIDATION_ERROR",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const result = await ingestCandidateDocument({
      organizationId,
      candidateId,
      applicationId,
      documentType,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileBuffer,
    });

    return {
      success: true,
      document: result.document as unknown as Record<string, unknown>,
      extractedText: result.extractedText,
    };
  } catch (error) {
    const handled = handleServerError(error);
    return {
      success: false,
      error: handled.message,
      code: handled.code,
    };
  }
}
