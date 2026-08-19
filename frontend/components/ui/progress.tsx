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
    default: "bg-[#F5F7FA]",
    ai: "bg-gradient-to-r from-[#39D9FF] to-[#63E3FF] shadow-[0_0_10px_rgba(57,217,255,0.4)]",
    success: "bg-[#35D07F]",
    warning: "bg-[#F5B942]",
    danger: "bg-[#FF5C67]",
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full border border-[#242932] bg-[#0D0F12]",
        heightClasses[size],
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 ease-out rounded-full", fillVariants[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Progress };
