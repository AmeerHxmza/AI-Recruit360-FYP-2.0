import mammoth from "mammoth";
import { DocumentParser } from "./document-parser";
import { ParsedDocumentResult } from "./types";
import { DocumentExtractionError } from "./errors";

export class DocxDocumentParser implements DocumentParser {
  public readonly name = "DocxDocumentParser";
  public readonly version = "mammoth@1.11.0";

  public supports(mimeType: string, filename: string): boolean {
    const lowerMime = mimeType.toLowerCase();
    const lowerName = filename.toLowerCase();

    const isDocxMime =
      lowerMime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerMime === "application/msword";
    const isDocxExt = lowerName.endsWith(".docx") || lowerName.endsWith(".doc");

    return isDocxMime || isDocxExt;
  }

  public async parse(buffer: Buffer): Promise<ParsedDocumentResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value ? result.value.trim() : "";

      if (!text || text.length === 0) {
        throw new DocumentExtractionError(
          "No readable text found in Word document. Corrupted or image-only documents cannot be processed.",
          "DOCUMENT_TEXT_EXTRACTION_FAILED",
        );
      }

      return {
        text,
        parserVersion: this.version,
        metadata: {
          messages: result.messages,
        },
      };
    } catch (error) {
      if (error instanceof DocumentExtractionError) {
        throw error;
      }
      throw new DocumentExtractionError(
        `Failed to parse Word document: ${error instanceof Error ? error.message : "Invalid or corrupt DOC/DOCX file"}`,
        "DOCUMENT_TEXT_EXTRACTION_FAILED",
      );
    }
  }
}
