"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  priority?: boolean;
}

export const BrandMark: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className,
}) => {
  const dimensions = {
    sm: { width: 28, height: 28 },
    md: { width: 34, height: 34 },
    lg: { width: 42, height: 42 },
  }[size];

  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)}>
      <Image
        src="/images/air360-favicon.png"
        alt="AI-Recruit360 Symbol"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </div>
  );
};

export const BrandWordmark: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className,
}) => {
  const dimensions = {
    sm: { width: 110, height: 22 },
    md: { width: 135, height: 26 },
    lg: { width: 160, height: 32 },
  }[size];

  return (
    <div className={cn("relative shrink-0 flex items-center", className)}>
      <Image
        src="/images/air360-wordmark.png"
        alt="AI-Recruit360"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain h-auto"
        priority
      />
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  href = "/",
  className,
}) => {
  const content = (
    <div className={cn("flex items-center group select-none", className)}>
      {variant === "mark" ? <BrandMark size={size} /> : <BrandWordmark size={size} />}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
