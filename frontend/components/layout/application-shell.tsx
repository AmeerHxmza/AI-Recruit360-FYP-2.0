"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export interface ApplicationShellProps {
  children: React.ReactNode;
  activeNavId?: string;
  onNavigate?: (id: string) => void;
  pageBreadcrumb?: string[];
  className?: string;
}

export const ApplicationShell: React.FC<ApplicationShellProps> = ({
  children,
  activeNavId = "dashboard",
  onNavigate,
  pageBreadcrumb,
  className,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col md:flex-row antialiased">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1250] bg-[#08090B]/80 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[1260] w-64 transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          activeId={activeNavId}
          onNavigate={(id) => {
            onNavigate?.(id);
            setIsMobileMenuOpen(false);
          }}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeId={activeNavId}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Right Column: TopBar + Page Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          onMenuToggle={() => setIsMobileMenuOpen(true)}
          pageBreadcrumb={pageBreadcrumb}
        />

        <main className={cn("flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8", className)}>
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
