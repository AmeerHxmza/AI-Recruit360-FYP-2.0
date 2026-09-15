import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-action-blue text-primary-foreground hover:bg-action-blue active:bg-action-blue font-medium shadow-xs",
        secondary:
          "bg-hover text-text-primary border border-border hover:bg-hover hover:border-border active:bg-hover",
        outline:
          "bg-transparent text-text-primary border border-border hover:bg-surface hover:border-border",
        ghost:
          "bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover",
        danger:
          "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 active:bg-danger/25",
        ai: "bg-action-blue/10 text-action-blue border border-action-blue/25 hover:bg-action-blue/15 active:bg-action-blue/20 font-medium",
        link: "text-action-blue underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-9 px-4 text-sm rounded-lg",
        lg: "h-10 px-5 text-sm rounded-lg font-medium",
        icon: "h-9 w-9 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
