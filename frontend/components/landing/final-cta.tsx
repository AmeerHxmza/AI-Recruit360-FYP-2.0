"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-32 bg-[#0D0F12] relative overflow-hidden border-t border-[#242932]/60">
      {/* Background Illumination */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#39D9FF]/[0.07] blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#12151A] border border-[#242932] p-8 sm:p-14 text-center ai-glow-subtle relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171B21] border border-[#242932] text-[#39D9FF] text-xs font-mono tracking-widest uppercase mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Recruitment Intelligence Reengineered
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase leading-tight mb-6">
            Stop Screening. <br />
            <span className="text-[#39D9FF]">Start Discovering.</span>
          </h2>

          <p className="text-[#A7AFBC] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Build a faster, more intelligent hiring workflow with AI-Recruit360 candidate screening, evaluation, and evidence extraction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#08090B] bg-[#39D9FF] hover:bg-[#63E3FF] rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#39D9FF]/20 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium text-[#F5F7FA] bg-[#171B21] hover:bg-[#1C212A] border border-[#242932] hover:border-[#39D9FF]/40 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
