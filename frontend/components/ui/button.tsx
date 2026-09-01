import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090B] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[#39D9FF] text-[#08090B] hover:bg-[#63E3FF] hover:shadow-[0_0_15px_rgba(57,217,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:bg-[#39D9FF] font-bold shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]",
        secondary:
          "bg-[#171B21] text-[#F5F7FA] border border-[#242932] hover:bg-[#242932] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:bg-[#171B21]",
        outline:
          "bg-transparent text-[#F5F7FA] border border-[#242932] hover:bg-[#12151A] hover:border-[#39D9FF]/40 hover:shadow-[0_0_10px_rgba(57,217,255,0.1)]",
        ghost:
          "bg-transparent text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#171B21]",
        danger:
          "bg-[#FF5C67]/10 text-[#FF5C67] border border-[#FF5C67]/30 hover:bg-[#FF5C67]/20 hover:shadow-[0_0_12px_rgba(255,92,103,0.2)]",
        ai:
          "bg-gradient-to-r from-[#39D9FF] to-[#63E3FF] text-[#08090B] font-bold shadow-[0_0_16px_rgba(57,217,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_0_24px_rgba(99,227,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-100",
        link: "text-[#39D9FF] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-9 px-4 text-sm rounded-md",
        lg: "h-10 px-5 text-base rounded-md",
        icon: "h-9 w-9 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
