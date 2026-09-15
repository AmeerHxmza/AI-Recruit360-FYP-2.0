import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps {
  label?: string;
  variant?: "spinner" | "skeleton" | "ai";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = "Processing Intelligence Data...",
  variant = "spinner",
  className,
}) => {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4 w-full p-4", className)}>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center space-y-3",
        className,
      )}
    >
      {variant === "ai" ? (
        <div className="relative flex items-center justify-center">
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-action-blue/20" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hover border border-action-blue/40 text-action-blue">
            <Sparkles className="h-5 w-5 animate-spin duration-1000" />
          </div>
        </div>
      ) : (
        <Loader2 className="h-6 w-6 animate-spin text-action-blue" />
      )}
      <span className="text-xs font-medium text-text-secondary tracking-wide">
        {label}
      </span>
    </div>
  );
};
