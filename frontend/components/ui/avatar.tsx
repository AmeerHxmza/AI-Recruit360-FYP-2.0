import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "ai" | "busy";
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  fallback,
  size = "md",
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-14 w-14 text-lg",
  }[size];

  const statusColor = {
    online: "bg-[#35D07F]",
    offline: "bg-[#68717E]",
    busy: "bg-[#FF5C67]",
    ai: "bg-[#39D9FF] shadow-[0_0_8px_rgba(57,217,255,0.6)]",
  };

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border border-[#242932] bg-[#171B21] text-[#F5F7FA] font-medium overflow-hidden select-none",
        sizeClasses,
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="uppercase tracking-wider font-semibold text-[#39D9FF]">
          {fallback.substring(0, 2)}
        </span>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#08090B]",
            statusColor[status]
          )}
        />
      )}
    </div>
  );
};

export { Avatar };
