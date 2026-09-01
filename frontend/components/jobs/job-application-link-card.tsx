"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ExternalLink, Share2 } from "lucide-react";

interface JobApplicationLinkCardProps {
  slugOrId: string;
  jobTitle?: string;
}

export function JobApplicationLinkCard({ slugOrId }: JobApplicationLinkCardProps) {
  const [copied, setCopied] = React.useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai-recruit360.vercel.app";
  const fullUrl = `${baseUrl}/apply/${slugOrId}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Card elevated className="p-5 border-[#39D9FF]/40 bg-[#12151A] space-y-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#242932] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Candidate Application Link
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-2 py-0.5 rounded border border-[#39D9FF]/20">
          <Share2 className="h-3 w-3" /> Public
        </span>
      </div>

      <p className="text-xs text-[#A7AFBC] leading-relaxed">
        Share this direct link with candidates across job boards, LinkedIn, and careers pages to receive applications.
      </p>

      {/* URL Display Bar */}
      <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#242932] flex items-center justify-between text-xs font-mono text-[#39D9FF] gap-2">
        <span className="truncate select-all text-[#CBD5E1] text-[11px]">{fullUrl}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant={copied ? "primary" : "outline"}
          size="sm"
          onClick={handleCopy}
          className={`flex-1 text-xs gap-1.5 h-8.5 font-medium transition-all ${
            copied ? "bg-[#35D07F] hover:bg-[#35D07F] text-black font-bold" : "border-[#39D9FF]/40 text-[#39D9FF] hover:bg-[#39D9FF]/10"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Application Link</span>
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(fullUrl, "_blank")}
          className="text-xs gap-1 h-8.5 px-3 border border-[#242932] text-[#A7AFBC] hover:text-[#F5F7FA]"
          title="Open application page in a new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
