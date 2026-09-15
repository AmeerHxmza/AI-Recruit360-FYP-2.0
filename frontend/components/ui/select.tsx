import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-border bg-surface px-3 py-1 pr-8 text-sm text-text-primary transition-colors focus:border-action-blue focus:bg-hover focus:outline-none focus:ring-1 focus:ring-action-blue disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-surface text-text-primary"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-text-secondary pointer-events-none" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
