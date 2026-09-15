import Link from "next/link";
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
  href = "/",
  className,
}: BrandLogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 whitespace-nowrap font-semibold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-lg border border-current text-xs font-bold"
      >
        360
      </span>
      {variant !== "mark" && (
        <span className="text-base">
          Recruit<span className="font-normal opacity-70">360</span>
        </span>
      )}
    </span>
  );
  return href ? (
    <Link aria-label="Recruit360 home" href={href}>
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
