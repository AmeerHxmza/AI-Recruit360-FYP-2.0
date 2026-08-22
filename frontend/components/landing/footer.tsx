"use client";

import * as React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export function PublicFooter() {
  return (
    <footer className="bg-[#08090B] border-t border-[#242932] pt-16 pb-12 text-left selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#242932]/60">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <BrandLogo variant="full" size="md" href="/" />
            <p className="text-xs text-[#A7AFBC] max-w-sm leading-relaxed">
              AI-powered recruitment intelligence platform. Automated CV screening, timed skill assessments, AI interviews, and evidence-based candidate scorecards.
            </p>
          </div>

          {/* Navigation Columns (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <a href="#platform" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    AI Screening
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Timed MCQs
                  </a>
                </li>
                <li>
                  <a href="#intelligence" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    AI Interviews
                  </a>
                </li>
                <li>
                  <a href="#technology" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Intelligence
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/dashboard" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    Security &amp; RLS
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[#A7AFBC] hover:text-[#39D9FF] transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Access */}
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
                    Create Workspace →
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
            <span>Precision Intelligence</span>
            <span>•</span>
            <span>Enterprise Hiring</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

