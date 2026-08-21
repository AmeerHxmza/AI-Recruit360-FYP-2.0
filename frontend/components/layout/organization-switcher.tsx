"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Building2, ChevronDown, Check, Plus, Loader2 } from "lucide-react";

export interface OrganizationSwitcherProps {
  isCollapsed?: boolean;
  className?: string;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  isCollapsed = false,
  className,
}) => {
  const router = useRouter();
  const { organization, organizations, role, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOrg = async (orgId: string) => {
    if (orgId === organization?.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await switchOrganization(orgId);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to switch organization:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const formatRole = (r?: string | null) => {
    if (!r) return "Member";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  if (!organization && organizations.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative select-none", className)}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isSwitching}
        className={cn(
          "flex items-center justify-between rounded-lg border border-[#242932] bg-[#12151A] px-2.5 py-1.5 text-xs text-[#F5F7FA] transition-all hover:border-[#39D9FF]/40 hover:bg-[#171B21] focus:outline-none focus:ring-1 focus:ring-[#39D9FF]",
          isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full min-w-[180px] max-w-[240px]"
        )}
        title={organization?.name}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0D0F12] border border-[#242932] text-[#39D9FF]">
            {isSwitching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Building2 className="h-3.5 w-3.5" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <span className="font-semibold text-[#F5F7FA] truncate text-xs leading-none mb-0.5">
                {organization?.name || "Select Workspace"}
              </span>
              <span className="text-[10px] text-[#A7AFBC] font-mono truncate leading-none">
                {formatRole(role)} • {organization?.slug}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && <ChevronDown className="h-3.5 w-3.5 text-[#A7AFBC] shrink-0 ml-1.5" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[1500] w-64 rounded-xl border border-[#39D9FF]/30 bg-[#12151A] p-1.5 shadow-2xl animate-in zoom-in-95 duration-150 text-[#F5F7FA] space-y-1">
          <div className="px-2.5 py-1.5 border-b border-[#242932]">
            <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block font-mono">
              Authorized Workspaces ({organizations.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {organizations.map((org) => {
              const isCurrent = org.id === organization?.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectOrg(org.id)}
                  className={cn(
                    "flex w-full items-center justify-between p-2 rounded-lg text-xs transition-micro text-left group",
                    isCurrent
                      ? "bg-[#39D9FF]/10 text-[#39D9FF] font-semibold"
                      : "hover:bg-[#171B21] text-[#F5F7FA]"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs",
                        isCurrent
                          ? "border-[#39D9FF]/40 bg-[#39D9FF]/10 text-[#39D9FF]"
                          : "border-[#242932] bg-[#0D0F12] text-[#A7AFBC]"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium">{org.name}</span>
                      <span className="text-[10px] text-[#A7AFBC] font-mono truncate">
                        {org.slug}
                      </span>
                    </div>
                  </div>

                  {isCurrent && <Check className="h-4 w-4 text-[#39D9FF] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Add New Organization Action */}
          <div className="pt-1 border-t border-[#242932]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/onboarding/organization");
              }}
              className="flex w-full items-center gap-2 p-2 rounded-lg text-xs text-[#39D9FF] hover:bg-[#39D9FF]/10 transition-micro font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
