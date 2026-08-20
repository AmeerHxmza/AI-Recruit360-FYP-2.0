"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-[#08090B]">
      {/* Background Visual Texture: Subtle Cyan Illumination + Technical Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle radial illumination */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#39D9FF]/[0.06] blur-[120px] rounded-full" />
        
        {/* Fine Technical Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(#242932 1px, transparent 1px), linear-gradient(90deg, #242932 1px, transparent 1px)`,
            backgroundSize: `40px 40px`
          }}
        />
        
        {/* Top Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B] via-transparent to-[#08090B]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151A] border border-[#242932] text-[#39D9FF] text-xs font-mono tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#39D9FF]" />
            <span>AI-Powered Recruitment Intelligence</span>
          </div>

          {/* Main Dominant Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F7FA] uppercase font-display leading-[1.08] mb-6">
            Recruitment <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F7FA] via-[#F5F7FA] to-[#39D9FF]">
              Intelligence,
            </span>{" "}
            <br />
            Reengineered.
          </h1>

          {/* Supporting Copy */}
          <p className="text-[#A7AFBC] text-base sm:text-lg md:text-xl max-w-2xl font-sans leading-relaxed mb-10">
            AI-Recruit360 transforms hiring from manual screening into intelligent
            candidate discovery, evaluation, and decision support.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-[#08090B] bg-[#39D9FF] hover:bg-[#63E3FF] rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#39D9FF]/20 active:scale-95"
            >
              Start Recruiting
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#platform"
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-medium text-[#F5F7FA] bg-[#12151A] hover:bg-[#171B21] border border-[#242932] hover:border-[#39D9FF]/40 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Explore Platform
            </a>
          </div>
        </div>

        {/* Hero Visual — Realistic Enterprise Product Representation */}
        <div className="mt-4 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-[#242932] bg-[#0D0F12] p-2 sm:p-3 shadow-2xl shadow-black/80 ai-glow-subtle overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#242932]/80 bg-[#12151A]/90 rounded-t-lg mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5C67]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F5B942]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#35D07F]/80" />
                </div>
                <div className="h-4 w-[1px] bg-[#242932] mx-1" />
                <span className="text-[11px] font-mono text-[#68717E] flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#39D9FF] animate-pulse" />
                  ai-recruit360.internal / candidate-intelligence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#68717E] uppercase bg-[#171B21] px-2 py-0.5 rounded border border-[#242932]">
                  Demo Candidate Profile
                </span>
                <span className="text-[11px] font-mono bg-[#171B21] text-[#39D9FF] px-2 py-0.5 rounded border border-[#39D9FF]/20">
                  Target Role: Senior AI/ML Engineer
                </span>
              </div>
            </div>

            {/* Inner Dashboard Layered Mock Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-2 sm:p-4 text-left">
              {/* Left Column: Candidate Summary Card */}
              <div className="lg:col-span-5 bg-[#12151A] rounded-lg border border-[#242932] p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-[#171B21] border border-[#39D9FF]/30 text-[#39D9FF] font-bold font-mono text-base flex items-center justify-center">
                        SC
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#F5F7FA]">
                          Sophia Chen
                        </h3>
                        <p className="text-xs text-[#A7AFBC]">
                          Senior AI/ML Engineer • 6 yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#39D9FF] font-mono">
                        94%
                      </div>
                      <span className="text-[10px] font-semibold text-[#35D07F] bg-[#35D07F]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        Strong Match
                      </span>
                    </div>
                  </div>

                  {/* AI Recommendation Banner */}
                  <div className="mt-4 p-3 rounded-md bg-[#171B21] border border-[#39D9FF]/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#39D9FF] tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Verdict
                      </span>
                      <span className="text-[11px] font-bold text-[#35D07F] font-mono">
                        STRONGLY RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-[#A7AFBC] leading-snug">
                      Verified production experience across RAG pipelines and LangGraph multi-agent workflows.
                    </p>
                  </div>
                </div>

                {/* Evidence Signals List */}
                <div className="space-y-2 pt-2 border-t border-[#242932]">
                  <span className="text-[11px] font-mono text-[#68717E] uppercase tracking-wider">
                    Verified Skill Evidence
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "FastAPI", "RAG", "LangGraph", "PostgreSQL", "Next.js"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-[#171B21] border border-[#242932] text-[11px] text-[#A7AFBC] font-mono flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3 text-[#39D9FF]" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Alignment Matrix & Detailed Metrics */}
              <div className="lg:col-span-7 bg-[#12151A] rounded-lg border border-[#242932] p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#242932]">
                    <span className="text-xs font-mono text-[#F5F7FA] font-medium flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-[#39D9FF]" />
                      Candidate Intelligence Breakdown
                    </span>
                    <span className="text-[11px] font-mono text-[#68717E]">
                      Confidence: High (98%)
                    </span>
                  </div>

                  {/* Alignment Progress Bars */}
                  <div className="space-y-3.5">
                    {[
                      { label: "Skills Alignment", value: 96 },
                      { label: "Experience Alignment", value: 91 },
                      { label: "Role Alignment", value: 97 },
                      { label: "Education Alignment", value: 88 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#A7AFBC]">{item.label}</span>
                          <span className="text-[#F5F7FA] font-mono font-bold">
                            {item.value}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#171B21] rounded-full overflow-hidden border border-[#242932]">
                          <div
                            className="h-full bg-[#39D9FF] rounded-full transition-all duration-500"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Quote Box */}
                <div className="p-3 rounded bg-[#0D0F12] border border-[#242932] flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#39D9FF] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#A7AFBC] leading-relaxed">
                    <strong className="text-[#F5F7FA] font-mono text-[11px]">Requirement Match:</strong> Led backend redesign serving 1M daily requests using vector search with 99.2% recall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
