"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  durationMs?: number;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  delayMs = 0,
  direction = "up",
  distance = 28,
  durationMs = 750,
  className,
  as: Component = "div",
  style,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0) scale(0.985)`;
      case "down":
        return `translate3d(0, -${distance}px, 0) scale(0.985)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      default:
        return "scale(0.985)";
    }
  };

  return (
    <Component
      ref={ref}
      className={cn(className)}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
