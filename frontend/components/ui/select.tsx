import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-[#242932] bg-[#12151A] px-3 py-1 pr-8 text-sm text-[#F5F7FA] transition-micro focus:border-[#39D9FF] focus:bg-[#171B21] focus:outline-none focus:ring-1 focus:ring-[#39D9FF] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#12151A] text-[#F5F7FA]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-[#A7AFBC] pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
