"use client";

import * as React from "react";
import Image from "next/image";

export function CandidateIntelligenceSection() {
  return (
    <section id="intelligence" className="py-20 md:py-32 bg-[#08090B] relative overflow-hidden scroll-mt-20 border-t border-[#242932]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Candidate Intelligence Scorecard */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 inline-block">
              04 — EVIDENCE-BASED EVALUATION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display">
              Candidate intelligence. <br />
              Beyond the resume.
            </h2>
            <p className="text-[#A7AFBC] text-base leading-relaxed">
              Consolidate CV screening scores, 10 MCQ assessment performance, and AI video interview evaluations into an actionable, evidence-backed hiring scorecard.
            </p>

            {/* Candidate Scorecard Sample Presentation */}
            <div className="p-6 rounded-2xl bg-[#12151A] border border-[#242932] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#242932] pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#F5F7FA] font-display">Candidate Profile</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B21] text-[#A7AFBC] border border-[#242932]">ILLUSTRATIVE EXAMPLE</span>
                  </div>
                  <p className="text-xs text-[#A7AFBC]">Senior AI Engineer Position</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 inline-block">
                    AI RECOMMENDATION: ADVANCE TO INTERVIEW
                  </span>
                </div>
              </div>

              {/* 4 Multi-Signal Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#39D9FF] font-display">94</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">AI Match</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#35D07F] font-display">88</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Assessment</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932]">
                  <div className="text-2xl font-extrabold text-[#63E3FF] font-display">92</div>
                  <div className="text-[10px] text-[#A7AFBC] font-mono uppercase mt-0.5">Interview</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#39D9FF]/40">
                  <div className="text-2xl font-extrabold text-[#39D9FF] font-display">91</div>
                  <div className="text-[10px] text-[#39D9FF] font-mono uppercase mt-0.5 font-bold">Overall</div>
                </div>
              </div>

              {/* Verified Evidence Notes */}
              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-xs text-[#A7AFBC] space-y-1">
                <span className="text-[10px] font-mono text-[#39D9FF] uppercase font-bold block">AI Evidence Summary</span>
                <p className="leading-relaxed">
                  Demonstrated 6 years of production RAG &amp; LangGraph experience. Passed 10-question timed technical assessment with 90% score and completed 8-question adaptive interview.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Image Container */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#08090B]">
              <Image
                src="/images/feature-ai-evaluation.png"
                alt="AI-Recruit360 Candidate Intelligence Evaluation Visual"
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

