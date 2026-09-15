import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        "flex flex-col gap-4 pb-6 border-b border-border mb-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-text-primary">
          Good morning, {userName}
        </h1>
        <p className="text-xs md:text-sm text-text-secondary">
          Monitor your candidate screening pipeline and AI evaluations.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button variant="primary" size="md" onClick={onCreateJob}>
          <Plus className="h-4 w-4 mr-1.5" /> Create job
        </Button>
      </div>
    </div>
  );
};
