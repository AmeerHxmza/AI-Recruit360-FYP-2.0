"use client";
import { Menu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";
import { Button } from "@/components/ui/button";
export interface TopBarProps {
  onMenuToggle?: () => void;
  pageBreadcrumb?: string[];
  className?: string;
}
export function TopBar({
  onMenuToggle,
  pageBreadcrumb,
}: TopBarProps) {
  const { userMetadata } = useAuth();
  const { breadcrumbs: contextBreadcrumbs } = useBreadcrumbs();
  const activeBreadcrumb = pageBreadcrumb || contextBreadcrumbs;

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={onMenuToggle}
        >
          <Menu />
        </Button>
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm text-text-secondary"
        >
          {activeBreadcrumb.map((part, i) => (
            <span
              key={`${part}-${i}`}
              className="flex min-w-0 items-center gap-2"
            >
              {i > 0 && <ChevronRight className="size-3 shrink-0" />}
              <span className="truncate">{part}</span>
            </span>
          ))}
        </nav>
      </div>
      <Link
        href="/settings"
        aria-label="Your profile"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hover text-xs font-semibold"
      >
        {userMetadata.fullName.slice(0, 2).toUpperCase()}
      </Link>
    </header>
  );
}
