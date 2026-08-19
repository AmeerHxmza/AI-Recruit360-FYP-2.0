"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Video,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  href?: string;
}

export interface SidebarProps {
  activeId?: string;
  onNavigate?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const defaultNavItems: { section: string; items: NavItem[] }[] = [
  {
    section: "Platform",
    items: [
      { id: "dashboard", label: "Dashboard Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "jobs", label: "Job Postings", icon: <Briefcase className="h-4 w-4" /> },
      { id: "candidates", label: "Candidates & Resumes", icon: <Users className="h-4 w-4" /> },
      { id: "applications", label: "Pipeline Applications", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { id: "interviews", label: "AI Interviews", icon: <Video className="h-4 w-4" /> },
      { id: "evaluations", label: "Scorecards & Evidence", icon: <BarChart3 className="h-4 w-4" /> },
      { id: "ai_runs", label: "AI Agent Runs", icon: <Cpu className="h-4 w-4" />, badge: "Active" },
    ],
  },
  {
    section: "System",
    items: [
      { id: "settings", label: "Platform Settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeId = "dashboard",
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#242932] bg-[#0D0F12] transition-component h-full select-none z-[1100]",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-[#242932]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#39D9FF] to-[#12151A] text-[#08090B] shadow-[0_0_12px_rgba(57,217,255,0.3)]">
            <Sparkles className="h-4 w-4 text-[#08090B]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#F5F7FA]">
                AI-Recruit<span className="text-[#39D9FF]">360</span>
              </span>
              <span className="text-[10px] text-[#68717E] tracking-wider uppercase font-semibold">
                Intelligence Platform
              </span>
            </div>
          )}
        </div>

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
        {defaultNavItems.map((group) => (
          <div key={group.section} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2 text-[10px] font-bold tracking-widest text-[#68717E] uppercase mb-2">
                {group.section}
              </h4>
            )}
            {group.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-micro group focus:outline-none focus:ring-1 focus:ring-[#39D9FF]",
                    isActive
                      ? "bg-[#171B21] text-[#39D9FF] font-semibold border border-[#242932] shadow-xs"
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

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="rounded-full bg-[#39D9FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#39D9FF] border border-[#39D9FF]/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
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

      {/* Status Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#242932] bg-[#08090B]/50">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#242932] bg-[#12151A] p-2.5">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#35D07F] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#35D07F]" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-[#F5F7FA] truncate">
                AI Engine Ready
              </span>
              <span className="text-[10px] text-[#68717E] truncate">
                v0.1.0-alpha
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
