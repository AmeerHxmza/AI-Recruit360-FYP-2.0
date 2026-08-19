import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="h-8 w-8 text-[#68717E]" />,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[#242932] bg-[#12151A]/50 px-6 py-12 text-center transition-component",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#171B21] border border-[#242932] mb-4 text-[#39D9FF]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#F5F7FA] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#A7AFBC] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
