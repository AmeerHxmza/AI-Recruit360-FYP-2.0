import { Database } from "@/types/database.types";

export type ProcessingStatus = "uploaded" | "processing" | "processed" | "failed";
export type DocumentType = "resume" | "cover_letter" | "portfolio" | "assessment" | "other";

export type CandidateDocumentRow = Database["public"]["Tables"]["candidate_documents"]["Row"];
export type CandidateDocumentInsert = Database["public"]["Tables"]["candidate_documents"]["Insert"];
export type CandidateDocumentUpdate = Database["public"]["Tables"]["candidate_documents"]["Update"];

export interface ParsedDocumentResult {
  text: string;
  pageCount?: number;
  parserVersion: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentIngestionParams {
  organizationId: string;
  candidateId: string;
  applicationId?: string | null;
  documentType?: DocumentType;
  fileName: string;
  fileType: string;
  fileBuffer: Buffer;
}

export interface DocumentIngestionResult {
  document: CandidateDocumentRow;
  extractedText: string | null;
  processingStatus: ProcessingStatus;
  parserVersion: string | null;
  processedAt: string | null;
}
