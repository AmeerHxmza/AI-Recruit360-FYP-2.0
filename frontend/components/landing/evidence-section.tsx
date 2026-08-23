"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export function EvidenceSection() {
  return (
    <section className="py-20 md:py-32 bg-[#08090B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            02 — TIMED TECHNICAL ASSESSMENT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Don&apos;t Just Score Candidates. <br />
            Understand Why.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            AI recommendations in AI-Recruit360 are designed around verifiable evidence extracted from candidate data and mapped directly against role requirements.
          </p>
        </div>

        {/* Evidence Mapping Visual Card */}
        <div className="max-w-4xl mx-auto bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Box 1: Requirement */}
            <div className="bg-[#12151A] rounded-xl border border-[#242932] p-5 h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#39D9FF] uppercase tracking-wider block mb-2 font-bold">
                  01. Role Requirement
                </span>
                <h4 className="text-sm font-semibold text-[#F5F7FA] mb-1">
                  &quot;Production AI experience&quot;
                </h4>
                <p className="text-xs text-[#A7AFBC]">
                  Senior AI Engineer position specification requirement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242932] text-[11px] font-mono text-[#68717E]">
                Status: Required skill
              </div>
            </div>

            {/* Box 2: Extracted Evidence */}
            <div className="bg-[#12151A] rounded-xl border border-[#39D9FF]/40 p-5 h-full flex flex-col justify-between ai-glow-subtle">
              <div>
                <span className="text-[10px] font-mono text-[#35D07F] uppercase tracking-wider block mb-2 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> 02. Extracted Evidence
                </span>
                <p className="text-xs font-mono text-[#F5F7FA] italic bg-[#171B21] p-3 rounded border border-[#242932] leading-relaxed">
                  &quot;Designed and deployed automated pipelines using AI and semantics serving 1M requests.&quot;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242932] text-[11px] font-mono text-[#35D07F]">
                Source: NeuralScale Labs Work History
              </div>
            </div>

            {/* Box 3: AI Interpretation */}
            <div className="bg-[#12151A] rounded-xl border border-[#242932] p-5 h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#39D9FF] uppercase tracking-wider block mb-2 font-bold">
                  03. AI Verdict
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] text-xs font-mono font-bold uppercase mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Strong Alignment
                </div>
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  Verified 3+ years of production AI architecture with database indexing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242932] text-[11px] font-mono text-[#39D9FF]">
                Match Confidence: 97%
              </div>
            </div>
          </div>

          {/* Assessment Feature Asset Showcase */}
          <div className="mt-10 relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-[#08090B]">
            <Image
              src="/images/feature-assessment.png"
              alt="AI-Recruit360 Timed Technical Assessment Feature Visual"
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1000px"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-[#242932] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7AFBC]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#39D9FF]" />
              <span>Designed to support evidence-based candidate analysis without black-box scores.</span>
            </div>
            <span className="font-mono text-[11px] text-[#68717E]">
              AI-Recruit360 Intelligence Engine
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
