"use client";

import * as React from "react";
import Image from "next/image";

export function PlatformOverview() {
  return (
    <section id="platform" className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            PRODUCT SHOWCASE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display">
            Your entire recruitment pipeline. <br />
            <span className="text-[#39D9FF]">In one command center.</span>
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed mt-4">
            Unified candidate screening, automated MCQ testing, AI video interviews, and evidence scores — accessible within a single dashboard.
          </p>
        </div>

        {/* Product Showcase Browser Frame */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-[#0D0F12] border border-[#242932]/40">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#08090B] border-b border-[#242932]/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5C67]/80" />
                <div className="h-3 w-3 rounded-full bg-[#F5B942]/80" />
                <div className="h-3 w-3 rounded-full bg-[#35D07F]/80" />
              </div>
              <div className="px-3 py-1 rounded-md bg-[#12151A] text-[11px] font-mono text-[#A7AFBC]">
                https://app.ai-recruit360.com/dashboard
              </div>
              <div className="text-[10px] font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-2 py-0.5 rounded border border-[#39D9FF]/30">
                RECRUITER WORKSPACE
              </div>
            </div>

            {/* Showcase Image */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
              <Image
                src="/images/dashboard-intelligence.png"
                alt="AI-Recruit360 Recruiter Command Center & Pipeline Showcase"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

