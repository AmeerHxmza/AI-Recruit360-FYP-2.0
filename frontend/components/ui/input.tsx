import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative flex items-center w-full">
          <div className="absolute left-3 text-[#A7AFBC] pointer-events-none">
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-[#242932] bg-[#12151A] pl-9 pr-3 py-1 text-sm text-[#F5F7FA] placeholder-[#68717E] transition-micro focus:border-[#39D9FF] focus:bg-[#171B21] focus:outline-none focus:ring-1 focus:ring-[#39D9FF] disabled:cursor-not-allowed disabled:opacity-50",
              className
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
          "flex h-9 w-full rounded-md border border-[#242932] bg-[#12151A] px-3 py-1 text-sm text-[#F5F7FA] placeholder-[#68717E] transition-micro focus:border-[#39D9FF] focus:bg-[#171B21] focus:outline-none focus:ring-1 focus:ring-[#39D9FF] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
