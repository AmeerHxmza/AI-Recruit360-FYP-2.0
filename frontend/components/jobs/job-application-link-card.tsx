"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ExternalLink, Share2 } from "lucide-react";

interface JobApplicationLinkCardProps {
  slugOrId: string;
  jobTitle?: string;
}

export function JobApplicationLinkCard({
  slugOrId,
}: JobApplicationLinkCardProps) {
  const [copied, setCopied] = React.useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-recruit360.vercel.app";
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
    <Card
      elevated
      className="p-5 border-border bg-surface space-y-4 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-action-blue" />
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Candidate Application Link
          </h3>
        </div>
        <span className="flex items-center gap-1 text-xs font-mono text-action-blue bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          <Share2 className="h-3 w-3" /> Public
        </span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">
        Share this direct link with candidates across job boards, LinkedIn, and
        careers pages to receive applications.
      </p>

      {/* URL Display Bar */}
      <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between text-xs font-mono text-action-blue gap-2">
        <span className="truncate select-all text-text-secondary text-xs">
          {fullUrl}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant={copied ? "primary" : "outline"}
          size="sm"
          onClick={handleCopy}
          className={`flex-1 text-xs gap-1.5 h-8.5 font-medium transition-all ${
            copied
              ? "bg-success hover:bg-success text-primary-foreground font-semibold"
              : "border-border text-text-primary hover:bg-hover"
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
          className="text-xs gap-1 h-8.5 px-3 border border-border text-text-secondary hover:text-text-primary"
          title="Open application page in a new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
