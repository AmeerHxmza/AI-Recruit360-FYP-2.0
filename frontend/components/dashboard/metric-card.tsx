import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend = "up",
  description,
  icon,
  highlight = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-lg p-5 transition-component border bg-[#12151A]",
        highlight
          ? "border-[#39D9FF]/40 bg-[#171B21] shadow-[0_0_20px_rgba(57,217,255,0.06)]"
          : "border-[#242932] hover:border-[#242932]/80",
        className
      )}
    >
      {/* Subtle Top Accent Bar for Highlight Metric */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#39D9FF] rounded-t-lg" />
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">
            {label}
          </span>
          {icon && (
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border text-xs",
                highlight
                  ? "border-[#39D9FF]/30 bg-[#39D9FF]/10 text-[#39D9FF]"
                  : "border-[#242932] bg-[#0D0F12] text-[#A7AFBC]"
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span
            className={cn(
              "text-2xl font-bold tracking-tight font-display",
              highlight ? "text-[#39D9FF]" : "text-[#F5F7FA]"
            )}
          >
            {value}
          </span>

          {change && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend === "up" && (
                <span className="inline-flex items-center text-[#35D07F]">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
                  {change}
                </span>
              )}
              {trend === "down" && (
                <span className="inline-flex items-center text-[#FF5C67]">
                  <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
                  {change}
                </span>
              )}
              {trend === "neutral" && (
                <span className="inline-flex items-center text-[#A7AFBC]">
                  <Minus className="mr-0.5 h-3.5 w-3.5" />
                  {change}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-2.5 border-t border-[#1C2027] flex items-center justify-between text-[11px] text-[#68717E]">
          <span>{description}</span>
        </div>
      )}
    </div>
  );
};
