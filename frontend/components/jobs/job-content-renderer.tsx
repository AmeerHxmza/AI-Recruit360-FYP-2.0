"use client";

import * as React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface JobContentRendererProps {
  content: string;
  className?: string;
}

export function JobContentRenderer({
  content,
  className = "",
}: JobContentRendererProps) {
  if (!content || !content.trim()) {
    return (
      <p className="text-xs text-text-secondary italic">No details provided.</p>
    );
  }

  // Pre-process content: insert line breaks before common headings if they are squished together
  let normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Common section headings to split on if pasted without newlines
  const knownHeaders = [
    "Key Responsibilities",
    "Responsibilities",
    "What You'll Do",
    "Requirements",
    "Qualifications",
    "Education & Experience",
    "Academic background",
    "Technical Skills",
    "Programming proficiency",
    "AI & LLM frameworks",
    "Machine learning basics",
    "Database management",
    "Core engineering tools",
    "Soft Skills",
    "Problem-solving",
    "Communication",
    "Growth mindset",
    "Nice to Have",
    "Benefits",
    "What We Offer",
    "About the Role",
  ];

  for (const h of knownHeaders) {
    // Add double newline before known heading if preceded by text and not already a newline
    const regex = new RegExp(`([^\n])(${h}:?)`, "gi");
    normalized = normalized.replace(regex, "$1\n\n$2");
  }

  // Split into paragraphs / blocks
  const blocks = normalized
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div
      className={`space-y-4 text-xs text-text-secondary font-sans ${className}`}
    >
      {blocks.map((block, bIdx) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length === 0) return null;

        // Check if the first line is a section header (e.g., "Key Responsibilities:", "Technical Skills:", "### Header")
        const firstLine = lines[0];
        const isHeader =
          firstLine.startsWith("#") ||
          /^[A-Z][A-Za-z\s&/]{2,30}:?$/.test(firstLine) ||
          knownHeaders.some((kh) =>
            firstLine.toLowerCase().startsWith(kh.toLowerCase()),
          );

        if (isHeader && lines.length > 1) {
          const headerText = firstLine.replace(/^[#\s]+/, "").replace(/:$/, "");
          const itemLines = lines.slice(1);

          return (
            <div key={bIdx} className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase tracking-wider font-display border-b border-border/60 pb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-action-blue" />
                <span>{headerText}</span>
              </div>
              <ul className="space-y-2 pl-1">
                {itemLines.map((line, lIdx) => {
                  const cleanedLine = line.replace(/^[-*•\d.)\s]+/, "").trim();
                  if (!cleanedLine) return null;

                  // Check for title: description pattern (e.g. "Programming proficiency: Strong foundational...")
                  const colonIdx = cleanedLine.indexOf(":");
                  if (colonIdx > 0 && colonIdx < 35) {
                    const title = cleanedLine.slice(0, colonIdx);
                    const rest = cleanedLine.slice(colonIdx + 1);
                    return (
                      <li
                        key={lIdx}
                        className="flex items-start gap-2.5 leading-relaxed text-text-secondary"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-action-blue shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-text-primary font-semibold">
                            {title}:
                          </strong>
                          <span className="text-text-secondary">{rest}</span>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={lIdx}
                      className="flex items-start gap-2.5 leading-relaxed text-text-secondary"
                    >
                      <span className="w-1 h-1 rounded-full bg-action-blue shrink-0 mt-2" />
                      <span>{cleanedLine}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        // Check if block consists of bullet points
        const isBulletList = lines.every((l) => /^[-*•\d.)]/.test(l));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => {
                const cleanedLine = line.replace(/^[-*•\d.)\s]+/, "").trim();
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5 leading-relaxed text-text-secondary"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{cleanedLine}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p
            key={bIdx}
            className="leading-relaxed text-text-secondary whitespace-normal"
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}
