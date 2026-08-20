"use client";

import * as React from "react";
import { Sparkles, BarChart3, FileText, Check } from "lucide-react";

export function CandidateIntelligenceSection() {
  return (
    <section id="intelligence" className="py-20 md:py-32 bg-[#08090B] relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            Candidate Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            See More Than A Resume.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            AI-Recruit360 analyzes candidate experience, skills, role alignment, and supporting evidence to help recruiters make informed decisions.
          </p>
        </div>

        {/* Feature Container - Detailed Product Showcase */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-[#242932] bg-[#0D0F12] p-4 sm:p-8 shadow-2xl ai-glow-subtle">
          {/* Candidate Profile Header Card */}
          <div className="bg-[#12151A] rounded-xl border border-[#242932] p-5 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#171B21] border border-[#39D9FF]/40 text-[#39D9FF] font-mono font-bold text-xl flex items-center justify-center shrink-0">
                  SC
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-[#F5F7FA]">
                      Sophia Chen
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 uppercase tracking-wider">
                      Shortlisted
                    </span>
                  </div>
                  <p className="text-sm text-[#A7AFBC] mt-0.5">
                    Senior AI/ML Engineer • NeuralScale Labs
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-[#68717E] mt-2">
                    <span>San Francisco, CA</span>
                    <span>•</span>
                    <span>Stanford CS M.S.</span>
                    <span>•</span>
                    <span>6 yrs experience</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#171B21] border border-[#242932] p-4 rounded-xl flex items-center gap-4 self-start md:self-auto">
                <div className="text-right">
                  <span className="text-xs font-mono text-[#68717E] uppercase block">
                    AI Match Index
                  </span>
                  <span className="text-3xl font-bold font-mono text-[#39D9FF]">
                    94%
                  </span>
                </div>
                <div className="h-10 w-[1px] bg-[#242932]" />
                <div>
                  <span className="text-xs font-mono font-bold text-[#35D07F] bg-[#35D07F]/10 px-2.5 py-1 rounded border border-[#35D07F]/20 uppercase">
                    Strong Match
                  </span>
                  <span className="text-[10px] text-[#A7AFBC] block mt-1">
                    Confidence: High (98%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Alignment Matrix / Right Verified Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Alignment Matrix (7 cols) */}
            <div className="lg:col-span-7 bg-[#12151A] rounded-xl border border-[#242932] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <span className="text-xs font-mono uppercase text-[#F5F7FA] font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#39D9FF]" />
                  Multi-Dimensional Alignment Breakdown
                </span>
                <span className="text-[11px] text-[#68717E] font-mono">
                  Role: Senior AI/ML Engineer
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Skills Alignment", value: 96, detail: "FastAPI, RAG, LangGraph, PostgreSQL" },
                  { label: "Experience Alignment", value: 91, detail: "6 years production backend & AI scale" },
                  { label: "Role Alignment", value: 97, detail: "Direct fit for lead AI architecture" },
                  { label: "Education Alignment", value: 88, detail: "Stanford M.S. Computer Science" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F5F7FA] font-medium">{item.label}</span>
                      <span className="text-[#39D9FF] font-mono font-bold">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#171B21] rounded-full overflow-hidden border border-[#242932]">
                      <div
                        className="h-full bg-[#39D9FF] rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#68717E] font-mono block">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Recommendation Banner */}
              <div className="p-4 rounded-lg bg-[#171B21] border border-[#39D9FF]/30 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono font-bold text-[#39D9FF] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Recommendation
                  </span>
                  <span className="text-xs font-bold font-mono text-[#35D07F] bg-[#35D07F]/10 px-2 py-0.5 rounded border border-[#35D07F]/30 uppercase">
                    STRONGLY RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  Candidate demonstrates exceptional alignment with the Senior AI/ML Engineer role, exhibiting verified production experience across RAG pipelines and LangGraph workflows.
                </p>
              </div>
            </div>

            {/* Verified Candidate Evidence (5 cols) */}
            <div className="lg:col-span-5 bg-[#12151A] rounded-xl border border-[#242932] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#242932] pb-3 mb-4">
                  <span className="text-xs font-mono uppercase text-[#F5F7FA] font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#39D9FF]" />
                    Extracted Resume Evidence
                  </span>
                  <span className="text-[10px] font-mono text-[#35D07F] bg-[#35D07F]/10 px-2 py-0.5 rounded">
                    4 Verified Signals
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      claim: "Production Python & FastAPI microservices",
                      context: "Led backend redesign serving 1M daily requests",
                    },
                    {
                      claim: "Retrieval-Augmented Generation (RAG)",
                      context: "Architected vector database search with 99.2% recall",
                    },
                    {
                      claim: "Agentic orchestration with LangGraph",
                      context: "Implemented multi-agent evaluation workflows",
                    },
                    {
                      claim: "PostgreSQL & pgvector indexing",
                      context: "Optimized queries reducing p99 latency by 45%",
                    },
                  ].map((ev, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#171B21] border border-[#242932] space-y-1"
                    >
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-[#F5F7FA]">
                          {ev.claim}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A7AFBC] pl-6 font-mono">
                        &quot;{ev.context}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932] text-center">
                <span className="text-[11px] font-mono text-[#68717E]">
                  Evidence extracted via AI parsing & semantic document layout analysis.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
