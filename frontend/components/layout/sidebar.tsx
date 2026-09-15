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
        <div className="my-7">
          <label htmlFor="workspace" className="rail-muted mb-2 block text-xs">
            Workspace
          </label>
          <select
            id="workspace"
            className="w-full rounded-lg border border-current bg-sidebar px-2 py-2 text-sm"
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
      <div className="mt-5 border-t border-current/20 pt-4">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="truncate text-sm font-medium">
              {userMetadata.fullName}
            </p>
            <p className="rail-muted text-xs capitalize">
              {userMetadata.role || "Team member"}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            aria-label="Sign out"
            onClick={() => void signOut()}
            className="rounded p-2 hover:bg-[var(--rail-hover)]"
          >
            <LogOut className="size-4" />
          </button>
          {onToggleCollapse && (
            <button
              aria-label={
                isCollapsed ? "Expand navigation" : "Collapse navigation"
              }
              onClick={onToggleCollapse}
              className="rounded p-2 hover:bg-[var(--rail-hover)]"
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
