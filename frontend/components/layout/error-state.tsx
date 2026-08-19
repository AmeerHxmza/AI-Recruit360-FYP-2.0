import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "System Error",
  message = "An unexpected error occurred while fetching processing state.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[#FF5C67]/30 bg-[#FF5C67]/5 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5C67]/10 text-[#FF5C67] mb-3 border border-[#FF5C67]/20">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-[#FF5C67] mb-1">{title}</h3>
      <p className="text-xs text-[#A7AFBC] max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-[#FF5C67]/40 text-[#FF5C67] hover:bg-[#FF5C67]/10"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
};
