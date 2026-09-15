import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "ai" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  variant = "ai",
  size = "md",
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const fillVariants = {
    default: "bg-text-primary",
    ai: "bg-gradient-to-r from-action-blue to-action-blue shadow-[0_0_10px_rgba(47,123,255,0.4)]",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full border border-border bg-background",
        heightClasses[size],
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full",
          fillVariants[variant],
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Progress };
