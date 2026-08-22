"use client";

import * as React from "react";
import { TrendingUp, Clock, Zap, Target, Filter } from "lucide-react";

export function AnalyticsSection() {
  const metrics = [
    {
      label: "TIME TO HIRE",
      value: "27 days",
      sub: "-14 days vs industry avg",
      icon: Clock,
    },
    {
      label: "SCREENING EFFICIENCY",
      value: "42%",
      sub: "+28% faster candidate review",
      icon: Zap,
    },
    {
      label: "AI MATCH ACCURACY",
      value: "92%",
      sub: "Verified against final hires",
      icon: Target,
    },
  ];

  const funnelStages = [
    { stage: "Applied", count: 124, percentage: "100%" },
    { stage: "Screening", count: 48, percentage: "38.7%" },
    { stage: "Interview", count: 21, percentage: "16.9%" },
    { stage: "Shortlisted", count: 7, percentage: "5.6%" },
  ];

  return (
    <section className="py-20 md:py-32 bg-[#08090B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            05 — RECRUITER ANALYTICS & DASHBOARD
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Turn Recruitment Data <br />
            Into Decisions.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            Gain immediate visual insight into pipeline conversion rates, time-to-hire metrics, and AI screening effectiveness.
          </p>
        </div>

        {/* Top 3 Analytical Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="bg-[#0D0F12] rounded-xl border border-[#242932] p-6 hover:border-[#39D9FF]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#68717E] uppercase tracking-wider">
                    {m.label}
                  </span>
                  <div className="p-2 rounded-lg bg-[#12151A] text-[#39D9FF] border border-[#242932]">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#F5F7FA] mb-1">
                  {m.value}
                </div>
                <span className="text-xs text-[#35D07F] font-mono flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {m.sub}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hiring Funnel Analytics Component */}
        <div className="max-w-5xl mx-auto bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#242932] pb-4 mb-6">
            <span className="text-xs font-mono text-[#F5F7FA] font-bold uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#39D9FF]" />
              Conversion Funnel Breakdown
            </span>
            <span className="text-[11px] font-mono text-[#68717E]">
              Sample Cohort Data
            </span>
          </div>

          <div className="space-y-4">
            {funnelStages.map((st) => (
              <div key={st.stage} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#F5F7FA] font-mono font-medium">
                    {st.stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A7AFBC] font-mono">{st.percentage}</span>
                    <span className="text-[#39D9FF] font-mono font-bold w-12 text-right">
                      {st.count}
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-[#12151A] rounded-md overflow-hidden border border-[#242932]">
                  <div
                    className="h-full bg-[#39D9FF]/80 rounded-md"
                    style={{ width: `${(st.count / 124) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
