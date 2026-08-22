/**
 * Dedicated candidate document text normalization pipeline.
 * Clean extraction artifacts, control chars, and erratic whitespace while preserving semantic content, headings, and bullet structures.
 */
export function normalizeExtractedText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  let cleaned = rawText;

  // 1. Remove null bytes and non-printable control characters (excluding newline \n and tab \t)
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // 2. Normalize replacement characters and non-breaking spaces
  cleaned = cleaned.replace(/\u00A0/g, " ");
  cleaned = cleaned.replace(/\uFFFD/g, "");

  // 3. Normalize line endings (\r\n and \r -> \n)
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 4. Normalize per-line horizontal whitespace (tabs and multiple spaces -> single space)
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  // 5. Collapse excessive blank lines (more than 2 consecutive newlines -> 2 newlines)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 6. Trim leading and trailing whitespace
  return cleaned.trim();
}
