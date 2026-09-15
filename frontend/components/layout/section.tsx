import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  actions,
  children,
  className,
  ...props
}) => {
  return (
    <section className={cn("space-y-4 my-6", className)} {...props}>
      {(title || actions) && (
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            {title && (
              <h2 className="text-sm font-bold tracking-tight text-text-primary uppercase text-xs">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-text-secondary mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
