"use client";

import * as React from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function ScreeningSection() {
  return (
    <section id="screening" className="py-20 md:py-28 bg-[#08090B] border-t border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: AI CV Screening Text & Scores */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 inline-block">
              01 — AUTOMATED CV SCREENING
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display">
              Automatically compare candidate CVs against job requirements.
            </h2>
            <p className="text-[#A7AFBC] text-base leading-relaxed">
              AI-Recruit360 extracts skills, work history, and educational qualifications, scoring each candidate objectively against the exact criteria of your position.
            </p>

            {/* AI Match Score Breakdown Card */}
            <div className="p-5 rounded-2xl bg-[#12151A] border border-[#242932] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    AI Match Evaluation
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30">
                  STRONG MATCH
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#39D9FF] font-display">92%</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Overall Match</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#35D07F] font-display">96%</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Skills</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#F5B942] font-display">88%</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Experience</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#F5F7FA] font-display">91%</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Education</div>
                </div>
              </div>

              {/* Evidence match points */}
              <div className="space-y-1.5 pt-2 border-t border-[#242932]/60 text-xs">
                <span className="text-[10px] font-mono text-[#68717E] uppercase">Verified Requirement Evidence</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded bg-[#0D0F12] border border-[#242932] text-[#F5F7FA] text-[11px] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#35D07F]" /> Next.js — demonstrated
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#0D0F12] border border-[#242932] text-[#F5F7FA] text-[11px] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#35D07F]" /> FastAPI — demonstrated
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#0D0F12] border border-[#242932] text-[#F5F7FA] text-[11px] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#35D07F]" /> RAG — demonstrated
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Image Container */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#08090B]">
              <Image
                src="/images/feature-cv-screening.png"
                alt="AI CV Screening Visual Interface"
                fill
                className="object-cover"
                sizes="(max-width: 1000px) 100vw, 600px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

