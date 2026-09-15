import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 pb-6 border-b border-border mb-6 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && (
          <div className="text-xs text-text-secondary mb-1">{breadcrumbs}</div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary font-display">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs md:text-sm text-text-secondary max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
};
