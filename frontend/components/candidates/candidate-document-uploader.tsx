"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  X,
  Sparkles,
  FileCode,
} from "lucide-react";
import { uploadAndIngestCandidateDocumentAction } from "@/lib/ingestion/actions";

interface CandidateDocumentUploaderProps {
  organizationId: string;
  candidateId: string;
  onSuccess?: () => void;
}

export function CandidateDocumentUploader({
  organizationId,
  candidateId,
  onSuccess,
}: CandidateDocumentUploaderProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [statusStep, setStatusStep] = React.useState<"idle" | "uploading" | "extracting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = React.useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMessage(null);
      setStatusStep("idle");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
      setStatusStep("idle");
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatusStep("uploading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("candidateId", candidateId);
      formData.append("documentType", "resume");
      formData.append("file", file);

      setTimeout(() => setStatusStep("extracting"), 1200);

      const res = await uploadAndIngestCandidateDocumentAction(formData);

      if (res.success) {
        setStatusStep("success");
        setExtractedPreview(res.extractedText || null);
        if (onSuccess) onSuccess();
      } else {
        setStatusStep("error");
        setErrorMessage(res.error || "Document processing failed.");
      }
    } catch (err) {
      setStatusStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Unexpected upload error.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
      <div className="flex items-center justify-between border-b border-[#242932] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Secure Candidate Document Ingestion
          </h3>
        </div>
        <Badge variant="ai" className="text-[10px]">
          <Sparkles className="h-3 w-3 mr-1" /> PDF & DOCX Parser
        </Badge>
      </div>

      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          file
            ? "border-[#39D9FF]/50 bg-[#171B21]"
            : "border-[#242932] hover:border-[#39D9FF]/40 bg-[#0D0F12]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-[#171B21] border border-[#242932] text-[#39D9FF]">
            <UploadCloud className="h-6 w-6" />
          </div>
          {file ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F5F7FA] block">{file.name}</span>
              <span className="text-[11px] text-[#A7AFBC] block">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || "Document"}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F5F7FA] block">
                Click to browse or drag & drop candidate document
              </span>
              <span className="text-[11px] text-[#68717E] block">
                Supports PDF, DOC, DOCX up to 20 MB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons & Status Lifecycle Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {statusStep === "uploading" && (
            <Badge variant="warning" className="text-[11px] py-1 px-2.5">
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Uploading to Private Storage...
            </Badge>
          )}
          {statusStep === "extracting" && (
            <Badge variant="ai" className="text-[11px] py-1 px-2.5">
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Extracting & Normalizing Text...
            </Badge>
          )}
          {statusStep === "success" && (
            <Badge variant="success" className="text-[11px] py-1 px-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Text Extracted & Persisted
            </Badge>
          )}
          {statusStep === "error" && (
            <Badge variant="danger" className="text-[11px] py-1 px-2.5">
              <AlertCircle className="h-3.5 w-3.5 mr-1" /> Ingestion Failed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {extractedPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              className="text-xs text-[#39D9FF] border-[#39D9FF]/30 hover:bg-[#39D9FF]/10"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Inspect Extracted Text
            </Button>
          )}
          <Button
            variant="ai"
            size="sm"
            disabled={!file || isUploading}
            onClick={handleUploadAndProcess}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Processing...
              </>
            ) : (
              "Ingest Document"
            )}
          </Button>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-[#2D1619] border border-[#F87171]/30 flex items-start gap-2.5 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Extracted Text Inspector Modal */}
      {showPreviewModal && extractedPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[#242932] bg-[#12151A] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#242932] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#39D9FF]" />
                <h4 className="text-sm font-bold text-[#F5F7FA]">
                  Normalized Resume Text ({extractedPreview.length} chars)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-[#0D0F12]">
              <pre className="text-xs font-mono text-[#A7AFBC] whitespace-pre-wrap leading-relaxed">
                {extractedPreview}
              </pre>
            </div>
            <div className="p-4 border-t border-[#242932] flex items-center justify-between text-xs text-[#68717E]">
              <span>Status: Processed & Persisted</span>
              <Button variant="secondary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
