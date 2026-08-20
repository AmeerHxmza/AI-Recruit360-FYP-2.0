"use client";

import * as React from "react";
import { Briefcase, Users, Cpu, FileCheck2, Video, Award, ChevronRight } from "lucide-react";

export function ProductWorkflow() {
  const steps = [
    {
      id: "01",
      title: "JOB",
      desc: "Role definition & technical criteria",
      icon: Briefcase,
    },
    {
      id: "02",
      title: "CANDIDATES",
      desc: "Centralized applicant & resume ingestion",
      icon: Users,
    },
    {
      id: "03",
      title: "AI SCREENING",
      desc: "Semantic matching & evidence extraction",
      icon: Cpu,
      highlight: true,
    },
    {
      id: "04",
      title: "EVALUATION",
      desc: "Structured scoring & skill matrix",
      icon: FileCheck2,
    },
    {
      id: "05",
      title: "INTERVIEW",
      desc: "AI-assisted technical interview logic",
      icon: Video,
    },
    {
      id: "06",
      title: "DECISION",
      desc: "Data-backed hiring recommendation",
      icon: Award,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#0D0F12] border-y border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            One Intelligence Layer
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            From Resume Screening <br />
            To Hiring Intelligence.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            AI-Recruit360 connects candidate data, AI analysis, evaluation, and recruitment workflows into one system.
          </p>
        </div>

        {/* Workflow Pipeline Display */}
        <div className="relative mt-8">
          {/* Desktop Horizontal Workflow Grid */}
          <div className="hidden lg:grid grid-cols-6 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group">
                  <div
                    className={`h-full p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      step.highlight
                        ? "bg-[#12151A] border-[#39D9FF]/50 ai-glow-subtle"
                        : "bg-[#12151A]/60 border-[#242932] hover:border-[#39D9FF]/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-xs font-mono font-bold ${
                            step.highlight ? "text-[#39D9FF]" : "text-[#68717E]"
                          }`}
                        >
                          {step.id}
                        </span>
                        <div
                          className={`p-2 rounded-lg ${
                            step.highlight
                              ? "bg-[#39D9FF]/10 text-[#39D9FF]"
                              : "bg-[#171B21] text-[#A7AFBC]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>

                      <h3
                        className={`text-xs font-bold font-mono tracking-wider uppercase mb-1.5 ${
                          step.highlight ? "text-[#39D9FF]" : "text-[#F5F7FA]"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-[#A7AFBC] leading-snug">
                        {step.desc}
                      </p>
                    </div>

                    {step.highlight && (
                      <div className="mt-3 pt-2 border-t border-[#39D9FF]/20 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#39D9FF] uppercase tracking-wider">
                          Core Engine
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39D9FF] animate-ping" />
                      </div>
                    )}
                  </div>

                  {/* Horizontal Arrow Indicator */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 hidden lg:block text-[#242932]">
                      <ChevronRight className="h-4 w-4 text-[#39D9FF]/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile & Tablet Vertical Workflow List */}
          <div className="lg:hidden space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border flex items-center gap-4 ${
                    step.highlight
                      ? "bg-[#12151A] border-[#39D9FF]/50"
                      : "bg-[#12151A]/60 border-[#242932]"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg shrink-0 ${
                      step.highlight
                        ? "bg-[#39D9FF]/10 text-[#39D9FF]"
                        : "bg-[#171B21] text-[#A7AFBC]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-[#39D9FF] font-bold">
                        {step.id}
                      </span>
                      <h3 className="text-sm font-bold font-mono tracking-wide text-[#F5F7FA] uppercase">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#A7AFBC]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
