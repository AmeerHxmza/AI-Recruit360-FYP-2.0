"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Sparkles, Menu, ChevronRight, X, ArrowRight, User, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

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
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

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
    { title: "Sophia Chen (Senior AI/ML Engineer)", href: "/candidates/cand-001", type: "Candidate", icon: <User className="h-3.5 w-3.5 text-[#39D9FF]" /> },
    { title: "Marcus Vance (Lead Full-Stack Architect)", href: "/candidates/cand-002", type: "Candidate", icon: <User className="h-3.5 w-3.5 text-[#39D9FF]" /> },
    { title: "Senior AI/ML Engineer Position", href: "/jobs/job-001", type: "Job Position", icon: <Briefcase className="h-3.5 w-3.5 text-[#35D07F]" /> },
    { title: "Sophia Chen AI Adaptive Interview", href: "/interviews/int-001", type: "Interview Workspace", icon: <FileText className="h-3.5 w-3.5 text-[#F5B942]" /> },
  ];

  const filteredQuickLinks = quickLinks.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header
        className={cn(
          "flex h-16 w-full items-center justify-between border-b border-[#242932] bg-[#0D0F12] px-4 md:px-6 z-[1000] select-none",
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
              className="md:hidden text-[#A7AFBC] hover:text-[#F5F7FA]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#A7AFBC]">
            {pageBreadcrumb.map((item, index) => (
              <React.Fragment key={item}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#68717E]" />}
                <span
                  className={cn(
                    index === pageBreadcrumb.length - 1
                      ? "font-semibold text-[#F5F7FA]"
                      : "text-[#A7AFBC]"
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
            className="flex h-9 w-full items-center justify-between rounded-md border border-[#242932] bg-[#12151A] px-3 text-xs text-[#68717E] transition-micro hover:border-[#39D9FF]/50 hover:bg-[#171B21] focus:outline-none focus:ring-1 focus:ring-[#39D9FF]"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#A7AFBC]" />
              <span className="truncate">Search candidates, jobs, applications...</span>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 rounded border border-[#242932] bg-[#0D0F12] px-1.5 py-0.5 text-[10px] font-mono text-[#A7AFBC]">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Controls & User Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* AI Activity Indicator */}
          <Link href="/ai-activity">
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#39D9FF]/30 bg-[#39D9FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#39D9FF] hover:bg-[#39D9FF]/20 transition-micro">
              <Sparkles className="h-3 w-3 text-[#39D9FF] animate-pulse" />
              <span>AI Engine Active</span>
            </div>
          </Link>

          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/ai-activity")}
            className="relative text-[#A7AFBC] hover:text-[#F5F7FA]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#39D9FF]" />
          </Button>

          {/* User Profile Avatar */}
          <Link href="/settings" className="pl-2 border-l border-[#242932] flex items-center gap-2 hover:opacity-80 transition-micro">
            <Avatar fallback="AH" status="online" size="sm" />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F5F7FA]">Ameer Hamza</span>
              <span className="text-[10px] text-[#A7AFBC]">AI Engineer</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Command Palette Search Overlay Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[1600] flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-xl rounded-xl border border-[#39D9FF]/30 bg-[#171B21] p-4 shadow-2xl animate-in zoom-in-95 duration-150 text-[#F5F7FA] space-y-3">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 text-[#39D9FF]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search candidates, jobs, or workspace features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#F5F7FA] placeholder-[#68717E] focus:outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              <span className="text-[10px] font-bold text-[#68717E] uppercase tracking-wider block px-2 mb-1">
                Quick Navigation Results
              </span>
              {filteredQuickLinks.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between p-2.5 rounded-lg text-xs transition-micro hover:bg-[#12151A] hover:text-[#39D9FF] text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="font-medium text-[#F5F7FA]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A7AFBC]">
                    <span>{item.type}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
              {filteredQuickLinks.length === 0 && (
                <div className="p-4 text-center text-xs text-[#68717E]">
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
