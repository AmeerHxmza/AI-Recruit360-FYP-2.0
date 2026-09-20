import { ParsedDocumentResult } from "./types";
import { UnsupportedDocumentError } from "./errors";

export interface DocumentParser {
  readonly name: string;
  readonly version: string;

  /**
   * Check if this parser supports the given document format.
   */
  supports(mimeType: string, filename: string): boolean;

  /**
   * Parse the document buffer and extract text content.
   */
  parse(buffer: Buffer): Promise<ParsedDocumentResult>;
}

export function getParserForDocument(
  mimeType: string,
  filename: string,
  parsers: DocumentParser[],
): DocumentParser {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = filename.toLowerCase();

  // Explicit check for image formats (OCR not implemented yet)
  if (
    lowerMime.includes("image/png") ||
    lowerMime.includes("image/jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg")
  ) {
    throw new UnsupportedDocumentError(
      "Image formats (PNG/JPEG) are preserved in storage, but OCR text extraction is not implemented yet.",
    );
  }

  for (const parser of parsers) {
    if (parser.supports(mimeType, filename)) {
      return parser;
    }
  }

  throw new UnsupportedDocumentError(
    `No supported document parser found for file format: '${mimeType || filename}'. Supported formats are PDF and DOCX.`,
  );
}
