"use client";

import * as React from "react";
import { Activity, Cpu, FileSearch, Award, Video } from "lucide-react";

export function AIActivitySection() {
  const events = [
    {
      title: "Resume Analysis",
      detail: "Sophia Chen • Senior AI/ML Engineer",
      timestamp: "2 mins ago",
      icon: FileSearch,
      status: "Completed",
    },
    {
      title: "Evidence Retrieval",
      detail: "12 relevant evidence signals extracted & verified",
      timestamp: "4 mins ago",
      icon: Cpu,
      status: "Verified",
    },
    {
      title: "Candidate Matching",
      detail: "94% role alignment score calculated",
      timestamp: "5 mins ago",
      icon: Activity,
      status: "Computed",
    },
    {
      title: "Recommendation Generated",
      detail: "STRONGLY RECOMMENDED verdict assigned",
      timestamp: "6 mins ago",
      icon: Award,
      status: "Generated",
    },
    {
      title: "Interview Evaluation",
      detail: "Adaptive AI interview assessment completed",
      timestamp: "12 mins ago",
      icon: Video,
      status: "Evaluated",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#08090B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            AI Activity Stream
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            See The Intelligence At Work.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            Real-time observational audit log of AI background screening, vector matching, and decision engine events.
          </p>
        </div>

        {/* Timeline Stream */}
        <div className="max-w-3xl mx-auto bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#242932] pb-4 mb-6">
            <span className="text-xs font-mono text-[#F5F7FA] font-bold uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#39D9FF]" />
              Live System Activity Stream
            </span>
            <span className="text-[11px] font-mono text-[#35D07F] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35D07F] animate-pulse" />
              Engine Online
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#242932]">
            {events.map((ev, i) => {
              const Icon = ev.icon;
              return (
                <div key={i} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-[#12151A] border border-[#39D9FF] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#39D9FF]" />
                  </div>

                  <div className="flex-1 bg-[#12151A] rounded-lg border border-[#242932] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-[#39D9FF]" />
                        <h4 className="text-xs font-bold font-mono text-[#F5F7FA]">
                          {ev.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#A7AFBC] mt-0.5">
                        {ev.detail}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <span className="text-[10px] font-mono text-[#35D07F] bg-[#35D07F]/10 px-2 py-0.5 rounded border border-[#35D07F]/20 uppercase">
                        {ev.status}
                      </span>
                      <span className="text-[11px] font-mono text-[#68717E]">
                        {ev.timestamp}
                      </span>
                    </div>
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
