"use client";

import * as React from "react";
import { FileText, Search, Cpu, BarChart2, CheckCheck, ArrowDown } from "lucide-react";

export function ScreeningSection() {
  const steps = [
    {
      count: "124",
      label: "RESUMES INGESTED",
      detail: "PDFs, Word docs & portfolio links uploaded",
      icon: FileText,
      badge: "Raw Applicants",
    },
    {
      count: "02",
      label: "DOCUMENT ANALYSIS",
      detail: "Structural layout parsing & text extraction",
      icon: Search,
      badge: "Parsing Layer",
    },
    {
      count: "03",
      label: "EVIDENCE EXTRACTION",
      detail: "Skill claims matched against experience context",
      icon: Cpu,
      badge: "Evidence Engine",
    },
    {
      count: "04",
      label: "SEMANTIC MATCHING",
      detail: "Vector search alignment against target job requirements",
      icon: BarChart2,
      badge: "Vector Analysis",
    },
    {
      count: "27",
      label: "STRONG MATCHES",
      detail: "High-confidence candidates ready for recruiter review",
      icon: CheckCheck,
      badge: "Shortlist Output",
      highlight: true,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            Intelligent Screening
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Turn Hundreds Of Resumes <br />
            Into Clear Signals.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            Eliminate manual resume parsing. AI-Recruit360 extracts evidence, evaluates role alignment, and surfaces top talent instantly.
          </p>
        </div>

        {/* Transformation Pipeline Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center">
                  <div
                    className={`w-full p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 h-full ${
                      step.highlight
                        ? "bg-[#12151A] border-[#39D9FF]/60 ai-glow-subtle"
                        : "bg-[#12151A]/80 border-[#242932] hover:border-[#39D9FF]/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-[#68717E] uppercase bg-[#171B21] px-2 py-0.5 rounded border border-[#242932]">
                          {step.badge}
                        </span>
                        <Icon
                          className={`h-4 w-4 ${
                            step.highlight ? "text-[#39D9FF]" : "text-[#A7AFBC]"
                          }`}
                        />
                      </div>

                      <div
                        className={`text-2xl sm:text-3xl font-bold font-mono my-2 ${
                          step.highlight ? "text-[#39D9FF]" : "text-[#F5F7FA]"
                        }`}
                      >
                        {step.count}
                      </div>

                      <h3
                        className={`text-xs font-bold font-mono tracking-wider uppercase mb-1.5 ${
                          step.highlight ? "text-[#39D9FF]" : "text-[#F5F7FA]"
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-[11px] text-[#A7AFBC] leading-snug">
                        {step.detail}
                      </p>
                    </div>

                    {step.highlight && (
                      <div className="mt-4 pt-2 border-t border-[#39D9FF]/20 text-center">
                        <span className="text-[10px] font-mono text-[#35D07F] font-bold uppercase tracking-wider">
                          Ready For Review
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Down Arrow for Mobile */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden py-2 text-[#39D9FF]/40">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-mono text-[#68717E] mt-8">
            * Demonstration metrics based on illustrative sample candidate dataset.
          </p>
        </div>
      </div>
    </section>
  );
}
