"use client";

import * as React from "react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

export interface OrganizationSwitcherProps {
  isCollapsed?: boolean;
  className?: string;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  isCollapsed = false,
  className,
}) => {
  const { organization, role } = useAuth();

  const formatRole = (r?: string | null) => {
    if (!r) return "Member";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  if (!organization) {
    return null;
  }

  return (
    <div className={cn("select-none", className)}>
      {/* Static Non-Interactive Organization Header Badge (No Dropdown Arrow or Popup) */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-[#242932] bg-[#12151A] px-3 py-2 text-xs text-[#F5F7FA] shadow-xs",
          isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full min-w-[180px]"
        )}
        title={organization.name}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0D0F12] border border-[#242932] text-[#39D9FF]">
          <Building2 className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-left overflow-hidden">
            <span className="font-bold font-display text-[#F5F7FA] truncate text-xs leading-none mb-1">
              {organization.name}
            </span>
            <span className="text-[10px] text-[#A7AFBC] font-mono truncate leading-none">
              {formatRole(role)} • {organization.slug}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
