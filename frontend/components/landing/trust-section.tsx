"use client";

import * as React from "react";
import { ShieldCheck, UserCheck, Eye, Scale } from "lucide-react";

export function TrustSection() {
  const principles = [
    {
      title: "Evidence-Based Analysis",
      desc: "AI recommendations are grounded in extractable candidate evidence, not unexplainable black-box scores.",
      icon: ShieldCheck,
    },
    {
      title: "Human Review First",
      desc: "Recruiters retain full final authority over shortlisting, interviewing, and hiring decisions.",
      icon: UserCheck,
    },
    {
      title: "Transparent Recommendations",
      desc: "Every score is accompanied by detailed skill and experience alignment breakdowns.",
      icon: Eye,
    },
    {
      title: "Structured Evaluation",
      desc: "Standardized technical criteria help mitigate subjective recruiter bias during candidate scoring.",
      icon: Scale,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#08090B] border-t border-[#242932]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            Responsible AI
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Intelligence With <br />
            Human Oversight.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            AI-Recruit360 is built as an augmentation layer for modern talent teams — empowering human recruiters with high-precision candidate intelligence.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-[#0D0F12] rounded-xl border border-[#242932] p-6 hover:border-[#39D9FF]/30 transition-colors flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-[#12151A] text-[#39D9FF] border border-[#242932] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F7FA] font-display mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
