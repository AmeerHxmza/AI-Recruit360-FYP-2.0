"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

export interface OrganizationSwitcherProps {
  isCollapsed?: boolean;
  className?: string;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  isCollapsed = false,
  className,
}) => {
  const { organization, organizations, role, switchOrganization } = useAuth();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const formatRole = (r?: string | null) => {
    if (!r) return "Member";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  if (!organization) {
    return null;
  }

  const hasMultiple = organizations.length > 1;

  return (
    <div ref={dropdownRef} className={cn("relative select-none", className)}>
      <button
        type="button"
        disabled={!hasMultiple && isCollapsed}
        onClick={() => hasMultiple && setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary shadow-xs transition-colors hover:bg-hover",
          isCollapsed ? "h-10 w-10 justify-center p-0" : "min-w-[180px]",
          hasMultiple ? "cursor-pointer" : "cursor-default",
        )}
        title={organization.name}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-hover text-action-blue">
            <Building2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left">
              <span className="mb-0.5 truncate text-xs font-semibold leading-none text-text-primary">
                {organization.name}
              </span>
              <span className="truncate font-mono text-[11px] leading-none text-text-secondary">
                {formatRole(role)} • {organization.slug}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && hasMultiple && (
          <ChevronsUpDown className="size-3.5 shrink-0 text-text-muted opacity-70" />
        )}
      </button>

      {open && hasMultiple && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px] rounded-lg border border-border bg-surface p-1.5 shadow-lg animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-text-muted">
            Workspaces
          </div>
          <div className="space-y-0.5">
            {organizations.map((org) => {
              const active = org.id === organization.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    if (!active) {
                      await switchOrganization(org.id);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-action-blue/10 font-medium text-action-blue"
                      : "text-text-primary hover:bg-hover",
                  )}
                >
                  <span className="truncate">{org.name}</span>
                  {active && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="mt-1 border-t border-border pt-1">
            <Link
              href="/onboarding/organization"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
            >
              <Plus className="size-3.5 shrink-0" />
              <span>New workspace...</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
