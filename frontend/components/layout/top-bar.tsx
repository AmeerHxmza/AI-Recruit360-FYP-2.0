"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Menu, ChevronRight, X, ArrowRight, User, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

import { useAuth } from "@/providers/auth-provider";
import { OrganizationSwitcher } from "./organization-switcher";

export interface TopBarProps {
  onMenuToggle?: () => void;
  pageBreadcrumb?: string[];
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  pageBreadcrumb = ["AI-Recruit360", "Dashboard"],
  className,
}) => {
  const router = useRouter();
  const { userMetadata } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "AH";
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const quickLinks = [
    { title: "Candidate Directory & Pipeline", href: "/candidates", type: "Directory", icon: <User className="h-3.5 w-3.5 text-[#38BDF8]" /> },
    { title: "Active Job Positions & Roles", href: "/jobs", type: "Jobs", icon: <Briefcase className="h-3.5 w-3.5 text-[#10B981]" /> },
    { title: "Applications & AI Screening", href: "/applications", type: "Applications", icon: <FileText className="h-3.5 w-3.5 text-[#60A5FA]" /> },
    { title: "AI Adaptive Interview Sessions", href: "/interviews", type: "Interviews", icon: <FileText className="h-3.5 w-3.5 text-[#F59E0B]" /> },
    { title: "Candidate Final Evaluations", href: "/evaluations", type: "Evaluations", icon: <FileText className="h-3.5 w-3.5 text-[#A855F7]" /> },
  ];

  const filteredQuickLinks = quickLinks.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header
        className={cn(
          "flex h-16 w-full items-center justify-between border-b border-[#1E293B] bg-[#0F1523] px-4 md:px-6 z-[1000] select-none",
          className
        )}
      >
        {/* Left: Mobile Drawer Trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="md:hidden text-[#94A3B8] hover:text-[#F8FAFC]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <OrganizationSwitcher className="hidden sm:block md:hidden" />
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8]">
            {pageBreadcrumb.map((item, index) => (
              <React.Fragment key={item}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#64748B]" />}
                <span
                  className={cn(
                    index === pageBreadcrumb.length - 1
                      ? "font-semibold text-[#F8FAFC]"
                      : "text-[#94A3B8]"
                  )}
                >
                  {item}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Search Trigger (Command Palette Trigger) */}
        <div className="flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex h-9 w-full items-center justify-between rounded-lg border border-[#1E293B] bg-[#131B2A] px-3 text-xs text-[#64748B] transition-micro hover:border-[#2563EB]/50 hover:bg-[#182236] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#94A3B8]" />
              <span className="truncate">Search candidates, jobs, applications...</span>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 rounded border border-[#1E293B] bg-[#0F1523] px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Controls & User Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/ai-activity")}
            className="relative text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182236]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
          </Button>

          {/* User Profile Avatar */}
          <Link href="/settings" className="pl-2 border-l border-[#1E293B] flex items-center gap-2 hover:opacity-80 transition-micro">
            <Avatar fallback={getInitials(userMetadata.fullName)} status="online" size="sm" />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F8FAFC]">{userMetadata.fullName}</span>
              <span className="text-[10px] text-[#94A3B8] truncate max-w-[140px] font-mono">{userMetadata.organization}</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Command Palette Search Overlay Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[1600] flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-xl rounded-xl border border-[#2563EB]/40 bg-[#131B2A] p-4 shadow-2xl animate-in zoom-in-95 duration-150 text-[#F8FAFC] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 text-[#38BDF8]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search candidates, jobs, or workspace features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block px-2 mb-1">
                Quick Navigation Results
              </span>
              {filteredQuickLinks.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between p-2.5 rounded-lg text-xs transition-micro hover:bg-[#182236] hover:text-[#38BDF8] text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="font-medium text-[#F8FAFC]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                    <span>{item.type}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
              {filteredQuickLinks.length === 0 && (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  No matching candidates or positions found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
