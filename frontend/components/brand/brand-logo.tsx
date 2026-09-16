import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "full",
  size = "md",
  href = "/",
  className,
  priority = true,
}: BrandLogoProps) {
  // Height classes calibrated to match surrounding typography and layouts
  const fullHeights = {
    sm: "h-7",
    md: "h-8.5",
    lg: "h-11",
  }[size];

  const markDimensions = {
    sm: "size-7",
    md: "size-8.5",
    lg: "size-10",
  }[size];

  const content = (
    <span
      className={cn(
        "inline-flex items-center select-none transition-transform duration-200 hover:scale-[1.02]",
        className,
      )}
    >
      {variant === "mark" ? (
        <Image
          src="/brand/logo-icon.png"
          alt="AI-Recruit360 Mark"
          width={260}
          height={260}
          priority={priority}
          className={cn("shrink-0 object-contain", markDimensions)}
        />
      ) : (
        <Image
          src="/brand/logo.png"
          alt="AI-Recruit360"
          width={955}
          height={212}
          priority={priority}
          className={cn("w-auto shrink-0 object-contain", fullHeights)}
        />
      )}
    </span>
  );

  return href ? (
    <Link
      aria-label="AI-Recruit360 home"
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-90"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export const BrandMark = (props: BrandLogoProps) => (
  <BrandLogo {...props} variant="mark" href="" />
);

export const BrandWordmark = (props: BrandLogoProps) => (
  <BrandLogo {...props} variant="wordmark" href="" />
);
