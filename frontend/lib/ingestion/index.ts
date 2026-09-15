// Server-Only Execution Boundary Guard
if (typeof window !== "undefined") {
  throw new Error(
    "Candidate document ingestion modules can only be executed on the server.",
  );
}

export * from "./types";
export * from "./errors";
export * from "./text-normalizer";
export * from "./document-parser";
export * from "./pdf-parser";
export * from "./docx-parser";
export * from "./document-ingestion-service";
