"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#08090B] border-t border-[#242932] pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#242932]/60">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-[#12151A] border border-[#242932] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#F5F7FA] font-display">
                AI-Recruit<span className="text-[#39D9FF]">360</span>
              </span>
            </Link>
            <p className="text-xs text-[#A7AFBC] max-w-sm leading-relaxed">
              Intelligence for modern hiring. AI-powered candidate screening, evaluation, and decision support platform.
            </p>
          </div>

          {/* Navigation Links (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            {/* Column 1: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <a href="#platform" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#intelligence" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Candidate AI
                  </a>
                </li>
                <li>
                  <a href="#technology" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Technology
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Application */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Application
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/dashboard" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/candidates" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Candidates
                  </Link>
                </li>
                <li>
                  <Link href="/interviews" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Interviews
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Workspace
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/login" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-[#39D9FF] hover:underline font-semibold">
                    Get Started →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#68717E]">
          <div>© 2026 AI-Recruit360. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Precision Technology</span>
            <span>•</span>
            <span>Enterprise Hiring</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
