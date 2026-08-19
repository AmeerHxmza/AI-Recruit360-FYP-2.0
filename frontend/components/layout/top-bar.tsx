"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, Sparkles, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export interface TopBarProps {
  onMenuToggle?: () => void;
  title?: string;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  title = "AI-Recruit360 Intelligence Portal",
  className,
}) => {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center justify-between border-b border-[#242932] bg-[#0D0F12] px-4 md:px-6 z-[1000] select-none",
        className
      )}
    >
      {/* Left: Mobile Toggle & Page Context */}
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
        <div className="hidden sm:flex flex-col">
          <h1 className="text-xs font-semibold text-[#F5F7FA] tracking-wide">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Input
            type="search"
            placeholder="Search candidates, jobs, evidence, or AI evaluations... (⌘K)"
            icon={<Search className="h-4 w-4 text-[#A7AFBC]" />}
            className="h-8 bg-[#12151A] text-xs border-[#242932] focus:border-[#39D9FF]"
          />
        </div>
      </div>

      {/* Right: Quick Controls & User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#39D9FF]/30 bg-[#39D9FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#39D9FF]">
          <Sparkles className="h-3 w-3 text-[#39D9FF] animate-pulse" />
          <span>Agentic Engine</span>
        </div>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#A7AFBC] hover:text-[#F5F7FA]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#39D9FF]" />
        </Button>

        {/* User Profile Avatar */}
        <div className="pl-2 border-l border-[#242932] flex items-center gap-2">
          <Avatar fallback="AD" status="online" size="sm" />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-[#F5F7FA]">Admin Lead</span>
            <span className="text-[10px] text-[#68717E]">Recruiter</span>
          </div>
        </div>
      </div>
    </header>
  );
};
