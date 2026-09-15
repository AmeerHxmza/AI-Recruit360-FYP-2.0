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
        text: "text-success",
        bg: "bg-success/10",
        border: "border-success/30",
        bar: "bg-success",
      };
    }
    if (val >= 80) {
      return {
        text: "text-action-blue",
        bg: "bg-action-blue/10",
        border: "border-action-blue/30",
        bar: "bg-action-blue",
      };
    }
    if (val >= 70) {
      return {
        text: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning/30",
        bar: "bg-warning",
      };
    }
    return {
      text: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/30",
      bar: "bg-danger",
    };
  };

  const theme = getScoreTheme(score);

  const derivedLabel =
    label ||
    (score >= 90
      ? "STRONG MATCH"
      : score >= 80
        ? "GOOD MATCH"
        : score >= 70
          ? "POTENTIAL"
          : "LOW MATCH");

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
                : "px-2.5 py-0.5 text-sm",
          )}
        >
          {score}%
        </div>

        {/* Label & Confidence Stack */}
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-text-primary uppercase leading-none">
            {derivedLabel}
          </span>
          <span className="text-xs text-text-secondary leading-tight mt-0.5">
            {confidenceLevel} confidence
          </span>
        </div>
      </div>

      {/* Subtle Micro Progress Bar */}
      {showBar && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              theme.bar,
            )}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
