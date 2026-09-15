import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors tracking-normal select-none focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-hover text-text-primary border border-border",
        secondary: "bg-background text-text-secondary border border-border",
        ai: "bg-action-blue/10 text-action-blue border border-action-blue/25",
        success: "bg-success/10 text-success border border-success/25",
        warning: "bg-warning/10 text-warning border border-warning/25",
        danger: "bg-danger/10 text-danger border border-danger/25",
        outline: "bg-transparent text-text-secondary border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
