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
        "flex flex-col justify-between rounded-xl p-5 border transition-colors duration-150 cursor-default",
        highlight
          ? "bg-hover border-border"
          : "bg-surface border-border hover:border-border",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            {label}
          </span>
          {icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted bg-background border border-border">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary tabular-nums font-sans">
            {value}
          </span>

          {change && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend === "up" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {change}
                </span>
              )}
              {trend === "down" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-danger/10 text-danger border border-danger/20">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {change}
                </span>
              )}
              {trend === "neutral" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-hover text-text-secondary border border-border">
                  <Minus className="mr-1 h-3 w-3" />
                  {change}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>{description}</span>
        </div>
      )}
    </div>
  );
};
