"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Video,
  Settings,
  Award,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
export interface SidebarProps {
  activeId?: string;
  onNavigate?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
  className?: string;
}
const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/interviews", label: "Interviews", icon: Video },
  { href: "/evaluations", label: "Evaluations", icon: Award },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onMobileClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const {
    userMetadata,
    signOut,
    organizations,
    organization,
    switchOrganization,
  } = useAuth();
  return (
    <aside
      className={cn(
        "rail sticky top-0 flex h-dvh shrink-0 flex-col p-4",
        isCollapsed ? "w-20" : "w-60",
        className,
      )}
    >
      <div className="flex h-12 items-center justify-between">
        <BrandLogo variant={isCollapsed ? "mark" : "full"} href="/dashboard" />
        {onMobileClose && (
          <button aria-label="Close navigation" onClick={onMobileClose}>
            <X className="size-5" />
          </button>
        )}
      </div>
      {!isCollapsed && (
        <div className="my-5">
          <label htmlFor="workspace" className="mb-1.5 block text-xs font-medium text-text-muted">
            Workspace
          </label>
          <select
            id="workspace"
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary focus:border-border-strong focus:outline-none"
            value={organization?.id || ""}
            onChange={(e) => void switchOrganization(e.target.value)}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <nav
        aria-label="Main navigation"
        className="mt-4 flex-1 space-y-1 overflow-y-auto"
      >
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            className="rail-link"
            key={href}
            href={href}
            onClick={onMobileClose}
            aria-label={isCollapsed ? label : undefined}
            title={isCollapsed ? label : undefined}
            aria-current={
              pathname === href || pathname.startsWith(`${href}/`)
                ? "page"
                : undefined
            }
          >
            <Icon className="size-4 shrink-0" />
            {!isCollapsed && label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-border pt-4 space-y-3">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="space-y-0.5 px-1">
              <p className="truncate text-sm font-semibold tracking-tight text-text-primary">
                {userMetadata.fullName}
              </p>
              <p className="text-xs text-text-secondary capitalize font-medium">
                {userMetadata.role || "Owner"}
              </p>
            </div>

            {/* Prominent LogOut Button below name and role */}
            <button
              type="button"
              aria-label="Log Out"
              onClick={() => void signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              title="Log Out"
              aria-label="Log Out"
              onClick={() => void signOut()}
              className="flex size-9 items-center justify-center rounded-lg border border-red-200 bg-red-50/80 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}

        {onToggleCollapse && (
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              aria-label={
                isCollapsed ? "Expand navigation" : "Collapse navigation"
              }
              title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={onToggleCollapse}
              className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
