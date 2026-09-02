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
        "relative flex flex-col justify-between rounded-xl p-5 transition-all duration-200 ease-out border glass-panel hover:-translate-y-0.5 cursor-default",
        highlight
          ? "border-[#2563EB]/50 bg-[#131B2A]/90 shadow-[0_4px_24px_-2px_rgba(37,99,235,0.15)]"
          : "border-[#1E293B] bg-[#131B2A]/70 hover:border-[#2563EB]/40 hover:shadow-lg hover:shadow-black/40",
        className
      )}
    >
      {/* Subtle Top Accent Bar for Highlight Metric */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] rounded-t-xl" />
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            {label}
          </span>
          {icon && (
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors",
                highlight
                  ? "border-[#2563EB]/40 bg-[#2563EB]/10 text-[#38BDF8]"
                  : "border-[#1E293B] bg-[#0F1523] text-[#94A3B8]"
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span
            className={cn(
              "text-2xl font-bold tracking-tight tabular-nums",
              highlight ? "text-[#F8FAFC]" : "text-[#F8FAFC]"
            )}
          >
            {value}
          </span>

          {change && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend === "up" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                  <TrendingUp className="mr-0.5 h-3 w-3" />
                  {change}
                </span>
              )}
              {trend === "down" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                  <TrendingDown className="mr-0.5 h-3 w-3" />
                  {change}
                </span>
              )}
              {trend === "neutral" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1E293B] text-[#94A3B8] border border-[#1E293B]">
                  <Minus className="mr-0.5 h-3 w-3" />
                  {change}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-2.5 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#64748B]">
          <span>{description}</span>
        </div>
      )}
    </div>
  );
};
