"use client";

import * as React from "react";
import { Cpu, Database, Search, GitBranch, Layers, ShieldCheck, Zap } from "lucide-react";

export function TechnologySection() {
  const techStack = [
    {
      title: "LLM REASONING",
      desc: "Deep text comprehension & candidate summary generation.",
      icon: Cpu,
    },
    {
      title: "EVIDENCE RETRIEVAL",
      desc: "Evidence extraction grounded directly in resume artifacts.",
      icon: Database,
    },
    {
      title: "SEMANTIC SEARCH",
      desc: "Vector similarity matching beyond exact keyword strings.",
      icon: Search,
    },
    {
      title: "SKILL MATCHING",
      desc: "Advanced matching algorithms for candidate skill lookup.",
      icon: Layers,
    },
    {
      title: "AI WORKFLOWS",
      desc: "Automated screening and candidate evaluation processes.",
      icon: GitBranch,
    },
    {
      title: "STRUCTURED EVALUATION",
      desc: "Standardized scoring rubrics ensuring recruiter consistency.",
      icon: ShieldCheck,
    },
    {
      title: "AUTOMATED PIPELINES",
      desc: "Instant resume processing and notification triggers.",
      icon: Zap,
    },
  ];

  return (
    <section id="technology" className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            Technology Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Built For Intelligent <br />
            Recruitment.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            Modern AI architecture engineered specifically for recruitment accuracy, evidence verification, and enterprise throughput.
          </p>
        </div>

        {/* Precision Technical Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.title}
                className="p-5 rounded-xl border border-[#242932] bg-[#12151A] hover:border-[#39D9FF]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3 text-[#39D9FF]">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase">
                      {tech.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed font-sans">
                    {tech.desc}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#242932]/60 text-[10px] font-mono text-[#68717E] uppercase">
                  Architecture Component
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
