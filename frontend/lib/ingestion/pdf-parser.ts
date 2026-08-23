import { DocumentParser } from "./document-parser";
import { ParsedDocumentResult } from "./types";
import { DocumentExtractionError } from "./errors";

// Polyfills for pdf-parse (pdf.js) to avoid ReferenceErrors in Next.js Server environment
if (typeof globalThis !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalAny = globalThis as any;
  if (typeof globalAny.DOMMatrix === "undefined") {
    globalAny.DOMMatrix = class DOMMatrix {};
  }
  if (typeof globalAny.Path2D === "undefined") {
    globalAny.Path2D = class Path2D {};
  }
  if (typeof globalAny.ImageData === "undefined") {
    globalAny.ImageData = class ImageData {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export class PdfDocumentParser implements DocumentParser {
  public readonly name = "PdfDocumentParser";
  public readonly version = "pdf-parse@1.1.1";

  public supports(mimeType: string, filename: string): boolean {
    const isPdfMime = mimeType === "application/pdf";
    const isPdfExt = filename.toLowerCase().endsWith(".pdf");
    return isPdfMime || isPdfExt;
  }

  public async parse(buffer: Buffer): Promise<ParsedDocumentResult> {
    try {
      let text = "";
      let pageCount: number | undefined;

      if (typeof pdfParse === "function") {
        const data = await pdfParse(buffer);
        text = data.text ? data.text.trim() : "";
        pageCount = data.numpages;
      } else if (pdfParse && typeof pdfParse.PDFParse === "function") {
        const parser = new pdfParse.PDFParse({ data: buffer });
        await parser.load();
        const res = await parser.getText();
        text = res && res.text ? res.text.trim() : "";
        pageCount = res ? res.total : undefined;
      } else if (pdfParse && typeof pdfParse.default === "function") {
        const data = await pdfParse.default(buffer);
        text = data.text ? data.text.trim() : "";
        pageCount = data.numpages;
      } else {
        throw new DocumentExtractionError(
          "PDF parser library binding unavailable.",
          "DOCUMENT_TEXT_EXTRACTION_FAILED"
        );
      }

      if (!text || text.length === 0) {
        throw new DocumentExtractionError(
          "No readable text found in PDF document (scanned/image-only PDFs require OCR).",
          "DOCUMENT_TEXT_EXTRACTION_FAILED"
        );
      }

      return {
        text,
        pageCount,
        parserVersion: this.version,
      };
    } catch (error) {
      if (error instanceof DocumentExtractionError) {
        throw error;
      }
      throw new DocumentExtractionError(
        `Failed to parse PDF document: ${error instanceof Error ? error.message : "Invalid or corrupt PDF"}`,
        "DOCUMENT_TEXT_EXTRACTION_FAILED"
      );
    }
  }
}
