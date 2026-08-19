import * as React from "react";
import { cn } from "@/lib/utils";

export interface MatchScoreProps {
  score: number;
  label?: string;
  confidenceLevel?: "High" | "Medium" | "Low";
  showBar?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  label,
  confidenceLevel = "High",
  showBar = true,
  size = "md",
  className,
}) => {
  // Color tokens based on score
  const getScoreTheme = (val: number) => {
    if (val >= 90) {
      return {
        text: "text-[#39D9FF]",
        bg: "bg-[#39D9FF]/10",
        border: "border-[#39D9FF]/30",
        bar: "bg-[#39D9FF]",
      };
    }
    if (val >= 80) {
      return {
        text: "text-[#35D07F]",
        bg: "bg-[#35D07F]/10",
        border: "border-[#35D07F]/30",
        bar: "bg-[#35D07F]",
      };
    }
    if (val >= 70) {
      return {
        text: "text-[#F5B942]",
        bg: "bg-[#F5B942]/10",
        border: "border-[#F5B942]/30",
        bar: "bg-[#F5B942]",
      };
    }
    return {
      text: "text-[#FF5C67]",
      bg: "bg-[#FF5C67]/10",
      border: "border-[#FF5C67]/30",
      bar: "bg-[#FF5C67]",
    };
  };

  const theme = getScoreTheme(score);

  const derivedLabel =
    label ||
    (score >= 90 ? "STRONG MATCH" : score >= 80 ? "GOOD MATCH" : score >= 70 ? "POTENTIAL" : "LOW MATCH");

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2.5">
        {/* Compact Percentage Pill */}
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-md border font-bold font-mono tracking-tight shrink-0",
            theme.bg,
            theme.border,
            theme.text,
            size === "sm"
              ? "px-2 py-0.5 text-xs"
              : size === "lg"
              ? "px-3 py-1 text-base"
              : "px-2.5 py-0.5 text-sm"
          )}
        >
          {score}%
        </div>

        {/* Label & Confidence Stack */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold tracking-wider text-[#F5F7FA] uppercase leading-none">
            {derivedLabel}
          </span>
          <span className="text-[10px] text-[#A7AFBC] leading-tight mt-0.5">
            {confidenceLevel} confidence
          </span>
        </div>
      </div>

      {/* Subtle Micro Progress Bar */}
      {showBar && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#1C2027]">
          <div
            className={cn("h-full rounded-full transition-all duration-300", theme.bar)}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
