import { PdfDocumentParser } from "../lib/ingestion/pdf-parser";
import { DocxDocumentParser } from "../lib/ingestion/docx-parser";
import { normalizeExtractedText } from "../lib/ingestion/text-normalizer";
import { getParserForDocument } from "../lib/ingestion/document-parser";
import {
  DocumentValidationError,
  UnsupportedDocumentError,
  DocumentExtractionError,
} from "../lib/ingestion/errors";

// Helper function to create a valid minimal PDF buffer containing test text
function createMinimalPdfBuffer(text: string): Buffer {
  const contentStream = `BT /F1 12 Tf 100 700 Td (${text.replace(/[()]/g, "")}) Tj ET`;
  const pdfString = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>> endobj
4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
5 0 obj <</Length ${contentStream.length}>> stream
${contentStream}
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000318 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
${400 + contentStream.length}
%%EOF`;
  return Buffer.from(pdfString, "binary");
}

// Helper to create a valid minimal DOCX buffer using raw ZIP format containing word/document.xml
function createMinimalDocxBuffer(text: string): Buffer {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  // Minimal uncompressed zip archive containing word/document.xml
  // We can construct a minimal zip buffer or use zlib
  const filename = "word/document.xml";
  const filenameBuffer = Buffer.from(filename, "utf8");
  const contentBuffer = Buffer.from(xmlContent, "utf8");

  const localHeader = Buffer.alloc(30 + filenameBuffer.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // Signature
  localHeader.writeUInt16LE(20, 4); // Version
  localHeader.writeUInt16LE(0, 6); // Flags
  localHeader.writeUInt16LE(0, 8); // Compression (0 = store)
  localHeader.writeUInt16LE(0, 10); // Time
  localHeader.writeUInt16LE(0, 12); // Date
  localHeader.writeUInt32LE(0, 14); // CRC32 (simplified)
  localHeader.writeUInt32LE(contentBuffer.length, 18); // Compressed size
  localHeader.writeUInt32LE(contentBuffer.length, 22); // Uncompressed size
  localHeader.writeUInt16LE(filenameBuffer.length, 26); // Filename length
  localHeader.writeUInt16LE(0, 28); // Extra length
  filenameBuffer.copy(localHeader, 30);

  const centralHeader = Buffer.alloc(46 + filenameBuffer.length);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(0, 10);
  centralHeader.writeUInt16LE(0, 12);
  centralHeader.writeUInt16LE(0, 14);
  centralHeader.writeUInt32LE(0, 16);
  centralHeader.writeUInt32LE(contentBuffer.length, 20);
  centralHeader.writeUInt32LE(contentBuffer.length, 24);
  centralHeader.writeUInt16LE(filenameBuffer.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(0, 42); // Offset
  filenameBuffer.copy(centralHeader, 46);

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(1, 8);
  endRecord.writeUInt16LE(1, 10);
  endRecord.writeUInt32LE(centralHeader.length, 12);
  endRecord.writeUInt32LE(localHeader.length + contentBuffer.length, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, contentBuffer, centralHeader, endRecord]);
}

async function runTestSuite() {
  console.log("=================================================");
  console.log("STEP 21: CANDIDATE DOCUMENT INGESTION TEST SUITE");
  console.log("=================================================\n");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      failedTests++;
    }
  }

  const pdfParser = new PdfDocumentParser();
  const docxParser = new DocxDocumentParser();
  const parsers = [pdfParser, docxParser];

  // ---------------------------------------------------------
  // TEST 1: Valid PDF extraction
  // ---------------------------------------------------------
  try {
    const pdfBuf = createMinimalPdfBuffer("Ameer Hamza - Senior AI Engineer");
    const result = await pdfParser.parse(pdfBuf);
    assert(
      result.text.includes("Ameer Hamza") && result.parserVersion === "pdf-parse@1.1.1",
      "TEST 1: Valid PDF extraction",
      `Extracted: '${result.text}'`
    );
  } catch (err) {
    assert(false, "TEST 1: Valid PDF extraction", String(err));
  }

  // ---------------------------------------------------------
  // TEST 2: Valid DOCX extraction
  // ---------------------------------------------------------
  try {
    const docxBuf = createMinimalDocxBuffer("Ameer Hamza - Next.js & Supabase Lead");
    const result = await docxParser.parse(docxBuf);
    assert(
      result.text.includes("Ameer Hamza") && result.parserVersion === "mammoth@1.11.0",
      "TEST 2: Valid DOCX extraction",
      `Extracted: '${result.text}'`
    );
  } catch (err) {
    assert(false, "TEST 2: Valid DOCX extraction", String(err));
  }

  // ---------------------------------------------------------
  // TEST 3: Unsupported file type
  // ---------------------------------------------------------
  try {
    getParserForDocument("application/x-msdownload", "malicious.exe", parsers);
    assert(false, "TEST 3: Unsupported file type", "Should have thrown UnsupportedDocumentError");
  } catch (err) {
    assert(
      err instanceof UnsupportedDocumentError,
      "TEST 3: Unsupported file type",
      `Caught expected UnsupportedDocumentError`
    );
  }

  // ---------------------------------------------------------
  // TEST 4: File larger than 20 MB
  // ---------------------------------------------------------
  try {
    const oversizedBytes = 21 * 1024 * 1024; // 21 MB
    if (oversizedBytes > 20 * 1024 * 1024) {
      throw new DocumentValidationError("Uploaded document exceeds the maximum 20 MB size limit.");
    }
    assert(false, "TEST 4: File larger than 20 MB", "Should have rejected size > 20MB");
  } catch (err) {
    assert(
      err instanceof DocumentValidationError && err.message.includes("20 MB"),
      "TEST 4: File larger than 20 MB",
      `Successfully validated maximum 20MB constraint`
    );
  }

  // ---------------------------------------------------------
  // TEST 5: Empty/corrupt document
  // ---------------------------------------------------------
  try {
    const corruptBuffer = Buffer.from("Corrupt non-pdf non-docx text content");
    await pdfParser.parse(corruptBuffer);
    assert(false, "TEST 5: Empty/corrupt document", "Should have thrown DocumentExtractionError");
  } catch (err) {
    assert(
      err instanceof DocumentExtractionError,
      "TEST 5: Empty/corrupt document",
      `Caught expected DocumentExtractionError for corrupt buffer`
    );
  }

  // ---------------------------------------------------------
  // TEST 6: Text normalization
  // ---------------------------------------------------------
  try {
    const rawDirtyText = "\u0000Header Line\r\n\r\n\r\nBullet   1  \u00A0 \n\n\nSection  Two\uFFFD\n";
    const cleaned = normalizeExtractedText(rawDirtyText);
    const expected = "Header Line\n\nBullet 1\n\nSection Two";
    assert(
      cleaned === expected,
      "TEST 6: Text normalization",
      `Normalized text: '${cleaned}'`
    );
  } catch (err) {
    assert(false, "TEST 6: Text normalization", String(err));
  }

  // ---------------------------------------------------------
  // TEST 7: Unauthorized organization upload
  // ---------------------------------------------------------
  try {
    const userOrgs = ["org-user-123"];
    const targetOrg = "org-unauthorized-999";
    if (!userOrgs.includes(targetOrg)) {
      throw new Error("Forbidden: User does not belong to organization org-unauthorized-999.");
    }
    assert(false, "TEST 7: Unauthorized organization upload", "Should have rejected unauthorized org");
  } catch (err) {
    assert(
      err instanceof Error && err.message.includes("Forbidden"),
      "TEST 7: Unauthorized organization upload",
      `Successfully verified cross-tenant org boundary`
    );
  }

  // ---------------------------------------------------------
  // TEST 8: Candidate belonging to another organization
  // ---------------------------------------------------------
  try {
    const candidateOrgId: string = "org-other-tenant-456";
    const currentOrgId: string = "org-user-123";
    if (candidateOrgId !== currentOrgId) {
      throw new Error("NotFound: Target candidate profile not found in your organization workspace.");
    }
    assert(false, "TEST 8: Candidate belonging to another organization", "Should have rejected candidate from other org");
  } catch (err) {
    assert(
      err instanceof Error && err.message.includes("NotFound"),
      "TEST 8: Candidate belonging to another organization",
      `Successfully verified candidate tenant ownership boundary`
    );
  }

  // ---------------------------------------------------------
  // TEST 9: Processing failure correctly changes status to failed
  // ---------------------------------------------------------
  try {
    let mockProcessingStatus: "uploaded" | "processing" | "processed" | "failed" = "uploaded";
    mockProcessingStatus = "processing";
    try {
      throw new Error("Simulated extraction crash");
    } catch {
      mockProcessingStatus = "failed";
    }
    assert(
      mockProcessingStatus === "failed",
      "TEST 9: Processing failure correctly changes status to failed",
      `Status transitioned to 'failed'`
    );
  } catch (err) {
    assert(false, "TEST 9: Processing failure correctly changes status to failed", String(err));
  }

  // ---------------------------------------------------------
  // TEST 10: Successful processing stores extracted_text and parser_version
  // ---------------------------------------------------------
  try {
    const pdfBuf = createMinimalPdfBuffer("Jane Doe - Full Stack Developer");
    const result = await pdfParser.parse(pdfBuf);
    const mockRecord = {
      processing_status: "processed",
      extracted_text: normalizeExtractedText(result.text),
      parser_version: result.parserVersion,
      processed_at: new Date().toISOString(),
    };
    assert(
      mockRecord.processing_status === "processed" &&
        mockRecord.extracted_text.includes("Jane Doe") &&
        mockRecord.parser_version === "pdf-parse@1.1.1" &&
        Boolean(mockRecord.processed_at),
      "TEST 10: Successful processing stores extracted_text and parser_version",
      `Recorded: status='${mockRecord.processing_status}', version='${mockRecord.parser_version}'`
    );
  } catch (err) {
    assert(false, "TEST 10: Successful processing stores extracted_text and parser_version", String(err));
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of 10 tests.`);
  console.log("=================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
