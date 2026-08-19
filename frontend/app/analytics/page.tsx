"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import {
  mockAnalyticsSummary,
  mockFunnelData,
  mockCandidateSources,
} from "@/lib/mock/analytics";
import { TrendingUp, Clock, Sparkles, Target, Layers } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Analytics"]}>
      <PageHeader
        title="Recruitment Analytics"
        description="Performance metrics, hiring funnel conversion, and AI screening efficiency insights."
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Time to Hire"
          value={`${mockAnalyticsSummary.timeToHireDays} days`}
          change="-5 days"
          trend="up"
          description="vs organizational average"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          label="Screening Efficiency"
          value={`+${mockAnalyticsSummary.screeningEfficiencyPct}%`}
          change="Faster triage"
          trend="up"
          description="Automated evidence evaluation"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="AI Match Accuracy"
          value={`${mockAnalyticsSummary.aiMatchAccuracyPct}%`}
          change="+2.5%"
          trend="up"
          description="Explainable match score precision"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label="Conversion Rate"
          value={`${mockAnalyticsSummary.candidateConversionPct}%`}
          change="+0.8%"
          trend="up"
          description="Applied to offer ratio"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hiring Funnel Breakdown */}
        <div className="lg:col-span-7">
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242932]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Hiring Funnel Conversion
                </h3>
              </div>
              <span className="text-xs text-[#A7AFBC]">
                Total volume: <span className="font-semibold text-[#F5F7FA]">124</span>
              </span>
            </div>

            <div className="space-y-4">
              {mockFunnelData.map((stage) => {
                const pct = Math.round((stage.count / 124) * 100);
                return (
                  <div key={stage.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#F5F7FA]">{stage.stage}</span>
                      <span className="font-mono text-[#F5F7FA] font-bold">
                        {stage.count} <span className="text-[10px] text-[#A7AFBC] font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#0D0F12] border border-[#1C2027]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Candidate Sources Breakdown */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242932]">
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Candidate Source Attribution
              </h3>
              <span className="text-xs text-[#A7AFBC]">By Application Volume</span>
            </div>

            <div className="space-y-3">
              {mockCandidateSources.map((src) => (
                <div key={src.source} className="p-3 rounded-lg bg-[#0D0F12] border border-[#1C2027] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F5F7FA]">{src.source}</span>
                    <span className="font-mono text-[#39D9FF] font-bold">{src.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#12151A]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${src.percentage}%`,
                        backgroundColor: src.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
