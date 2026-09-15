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
    online: "bg-success",
    offline: "bg-text-muted",
    busy: "bg-danger",
    ai: "bg-action-blue shadow-[0_0_8px_rgba(47,123,255,0.6)]",
  };

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-hover text-text-primary font-medium overflow-hidden select-none",
        sizeClasses,
        className,
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
        <span className="uppercase tracking-wider font-semibold text-action-blue">
          {fallback.substring(0, 2)}
        </span>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
            statusColor[status],
          )}
        />
      )}
    </div>
  );
};

export { Avatar };
