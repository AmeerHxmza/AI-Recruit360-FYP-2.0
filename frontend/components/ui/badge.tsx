import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-micro tracking-wide focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-[#171B21]/80 backdrop-blur-md text-[#F5F7FA] border border-[#242932] shadow-sm",
        ai: "bg-[#39D9FF]/10 text-[#63E3FF] border border-[#39D9FF]/40 font-bold shadow-[0_0_8px_rgba(57,217,255,0.2)]",
        success: "bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 font-bold",
        warning: "bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 font-bold",
        danger: "bg-[#FF5C67]/10 text-[#FF5C67] border border-[#FF5C67]/30 font-bold",
        outline: "bg-transparent text-[#A7AFBC] border border-[#242932]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
