import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative flex items-center w-full">
          <div className="absolute left-3 text-text-muted pointer-events-none">
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              "flex h-9.5 w-full rounded-lg border border-border bg-surface pl-9.5 pr-3 py-1.5 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-action-blue focus:bg-hover focus:outline-none focus:ring-1 focus:ring-action-blue disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9.5 w-full rounded-lg border border-border bg-surface px-3.5 py-1.5 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-action-blue focus:bg-hover focus:outline-none focus:ring-1 focus:ring-action-blue disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
