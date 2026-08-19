"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export interface ApplicationShellProps {
  children: React.ReactNode;
  activeNavId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

export const ApplicationShell: React.FC<ApplicationShellProps> = ({
  children,
  activeNavId = "dashboard",
  onNavigate,
  className,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col md:flex-row antialiased">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1250] bg-[#08090B]/80 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[1260] w-64 transform transition-transform duration-200 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          activeId={activeNavId}
          onNavigate={(id) => {
            onNavigate?.(id);
            setIsMobileMenuOpen(false);
          }}
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
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(true)} />

        <main className={cn("flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", className)}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
