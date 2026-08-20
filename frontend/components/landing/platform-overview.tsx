"use client";

import * as React from "react";
import { Briefcase, Users, FileCheck, Video, Award, BarChart3, Activity } from "lucide-react";

export function PlatformOverview() {
  const modules = [
    { id: "01", name: "Jobs", desc: "Create and manage hiring positions.", icon: Briefcase },
    { id: "02", name: "Candidates", desc: "Centralized candidate intelligence.", icon: Users },
    { id: "03", name: "Applications", desc: "Track candidate progression.", icon: FileCheck },
    { id: "04", name: "Interviews", desc: "Manage AI-assisted interviews.", icon: Video },
    { id: "05", name: "Evaluations", desc: "Consolidate hiring assessments.", icon: Award },
    { id: "06", name: "Analytics", desc: "Understand recruitment performance.", icon: BarChart3 },
    { id: "07", name: "AI Activity", desc: "Observe intelligence operations.", icon: Activity },
  ];

  return (
    <section id="platform" className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60 scroll-mt-20">
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            Complete Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            One Platform. <br />
            Every Hiring Decision.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            AI-Recruit360 provides a complete end-to-end recruitment intelligence suite.
          </p>
        </div>

        {/* Technical Grid / List Composition */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            const isLast = idx === modules.length - 1;
            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl border border-[#242932] bg-[#12151A] hover:border-[#39D9FF]/40 transition-all group ${
                  isLast ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#39D9FF] font-bold">
                    {m.id}
                  </span>
                  <div className="p-2 rounded-md bg-[#171B21] text-[#A7AFBC] group-hover:text-[#39D9FF] transition-colors border border-[#242932]">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#F5F7FA] mb-1 font-display">
                  {m.name}
                </h3>
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
