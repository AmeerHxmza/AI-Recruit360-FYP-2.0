"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Video,
  BarChart3,
  TrendingUp,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface SidebarProps {
  activeId?: string;
  onNavigate?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
  className?: string;
}

export const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  { id: "jobs", label: "Jobs", href: "/jobs", icon: <Briefcase className="h-4.5 w-4.5" /> },
  { id: "candidates", label: "Candidates", href: "/candidates", icon: <Users className="h-4.5 w-4.5" /> },
  { id: "applications", label: "Applications", href: "/applications", icon: <FileText className="h-4.5 w-4.5" /> },
  { id: "interviews", label: "Interviews", href: "/interviews", icon: <Video className="h-4.5 w-4.5" /> },
  { id: "evaluations", label: "Evaluations", href: "/evaluations", icon: <BarChart3 className="h-4.5 w-4.5" /> },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: <TrendingUp className="h-4.5 w-4.5" /> },
];

export const secondaryNavItems: NavItem[] = [
  { id: "ai-activity", label: "AI Activity", href: "/ai-activity", icon: <Cpu className="h-4.5 w-4.5" />, badge: "Active" },
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings className="h-4.5 w-4.5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onMobileClose,
  className,
}) => {
  const pathname = usePathname();
  const { userMetadata, signOut } = useAuth();

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "AH";
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#242932] bg-[#0D0F12] transition-component h-full select-none z-[1100]",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#242932]">
        <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#12151A] border border-[#39D9FF]/40 text-[#39D9FF] shadow-[0_0_12px_rgba(57,217,255,0.25)]">
            <Sparkles className="h-5 w-5 text-[#39D9FF]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#F5F7FA] font-display">
                AI-Recruit<span className="text-[#39D9FF]">360</span>
              </span>
              <span className="text-[10px] text-[#68717E] tracking-wider uppercase font-semibold">
                Intelligence Platform
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-1.5 text-[#A7AFBC] hover:bg-[#171B21] hover:text-[#F5F7FA] transition-micro focus:outline-none focus:ring-1 focus:ring-[#39D9FF]"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Nav Items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition-micro group focus:outline-none focus:ring-1 focus:ring-[#39D9FF]",
                  isActive
                    ? "bg-[#39D9FF]/10 text-[#39D9FF] font-semibold border-l-2 border-[#39D9FF]"
                    : "text-[#A7AFBC] hover:bg-[#12151A] hover:text-[#F5F7FA]"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 transition-micro",
                    isActive ? "text-[#39D9FF]" : "text-[#68717E] group-hover:text-[#F5F7FA]"
                  )}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-3 h-px bg-[#242932]" />

        {/* Secondary Nav Items */}
        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition-micro group focus:outline-none focus:ring-1 focus:ring-[#39D9FF]",
                  isActive
                    ? "bg-[#39D9FF]/10 text-[#39D9FF] font-semibold border-l-2 border-[#39D9FF]"
                    : "text-[#A7AFBC] hover:bg-[#12151A] hover:text-[#F5F7FA]"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 transition-micro",
                    isActive ? "text-[#39D9FF]" : "text-[#68717E] group-hover:text-[#F5F7FA]"
                  )}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span className="rounded-full bg-[#39D9FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#39D9FF] border border-[#39D9FF]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Collapsed Toggle (if collapsed) */}
      {onToggleCollapse && isCollapsed && (
        <div className="p-3 border-t border-[#242932] flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-2 text-[#A7AFBC] hover:bg-[#171B21] hover:text-[#F5F7FA] transition-micro"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#242932] bg-[#08090B] space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-[#242932] bg-[#12151A] p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar fallback={getInitials(userMetadata.fullName)} status="online" size="sm" />
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-xs font-semibold text-[#F5F7FA] truncate">
                  {userMetadata.fullName}
                </span>
                <span className="text-[10px] text-[#A7AFBC] truncate font-mono">
                  {userMetadata.organization} ({userMetadata.role || "member"})
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-md text-[#A7AFBC] hover:text-[#FF5C67] hover:bg-[#171B21] transition-colors focus:outline-none"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

