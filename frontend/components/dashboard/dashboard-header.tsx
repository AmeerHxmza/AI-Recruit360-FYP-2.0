import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles } from "lucide-react";

export interface DashboardHeaderProps {
  userName?: string;
  onCreateJob?: () => void;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = "Ameer",
  onCreateJob,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 border-b border-[#242932] mb-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F7FA] font-display">
            Recruiter Dashboard
          </h1>

        </div>
        <p className="text-xs md:text-sm text-[#A7AFBC]">
          Monitor your recruitment pipeline and candidate evaluations.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ai"
          size="md"
          onClick={onCreateJob}
          className="shadow-[0_0_16px_rgba(57,217,255,0.2)] hover:shadow-[0_0_20px_rgba(99,227,255,0.35)]"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Create Job
        </Button>
      </div>
    </div>
  );
};
