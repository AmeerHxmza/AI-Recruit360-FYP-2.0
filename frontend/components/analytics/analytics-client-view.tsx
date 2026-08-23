"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { DashboardData } from "@/lib/services/dashboard-service";
import { TrendingUp, Clock, Sparkles, Target, Layers, BarChart2 } from "lucide-react";

interface AnalyticsClientViewProps {
  initialData: DashboardData;
  orgName: string;
}

export function AnalyticsClientView({ initialData, orgName }: AnalyticsClientViewProps) {
  const [data] = React.useState<DashboardData>(initialData);

  const totalApplications = data.metrics.totalApplications ?? 0;
  const funnelStages = React.useMemo(() => {
    if (totalApplications === 0) return [];
    return [
      { stage: "Applied", count: data.funnel.applied, color: "#39D9FF" },
      { stage: "Screening", count: data.funnel.screening, color: "#63E3FF" },
      { stage: "Assessment", count: data.funnel.assessment, color: "#F5B942" },
      { stage: "Interview", count: data.funnel.interview, color: "#35D07F" },
      { stage: "Evaluation", count: data.funnel.evaluation, color: "#A7AFBC" },
      { stage: "Shortlisted", count: data.funnel.shortlisted, color: "#00E5A3" },
    ];
  }, [data, totalApplications]);

  return (
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "Analytics"]}>
      <PageHeader
        title="Recruitment Analytics"
        description="Performance metrics, hiring funnel conversion, and AI screening efficiency insights."
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Positions"
          value={data.metrics.activeJobs ?? 0}
          description="Open recruiting roles"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          label="Pipeline Volume"
          value={data.metrics.totalApplications ?? 0}
          description="Submitted candidate profiles"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="AI Screenings"
          value={data.aiSummary.totalScreened ?? 0}
          description="Processed evaluation reports"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Avg Match Score"
          value={data.aiSummary.averageMatchScore ? `${data.aiSummary.averageMatchScore}%` : "0%"}
          description="Candidate alignment score"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Analytics Visual Grid or Empty State */}
      {totalApplications === 0 ? (
        <Card className="p-12 text-center bg-[#12151A] border-[#242932] space-y-4">
          <BarChart2 className="h-10 w-10 text-[#39D9FF] mx-auto opacity-80" />
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-base font-bold text-[#F5F7FA]">No recruitment data recorded</h4>
            <p className="text-xs text-[#A7AFBC]">
              Analytics and funnel conversion metrics will populate as candidate applications progress through stages.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recruitment Funnel Visual */}
          <Card className="lg:col-span-2 p-6 bg-[#12151A] border-[#242932] space-y-6">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#39D9FF]" /> Workspace Recruitment Funnel
                </h3>
                <p className="text-xs text-[#A7AFBC]">Conversion rates across hiring pipeline stages</p>
              </div>
              <span className="text-xs font-mono text-[#39D9FF]">
                {totalApplications} Total Candidates
              </span>
            </div>

            <div className="space-y-4">
              {funnelStages.map((stageItem) => {
                const percentage = totalApplications > 0 ? Math.round((stageItem.count / totalApplications) * 100) : 0;

                return (
                  <div key={stageItem.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F5F7FA]">{stageItem.stage}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[#F5F7FA] font-bold">{stageItem.count}</span>
                        <span className="text-[#A7AFBC]">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-[#0D0F12] border border-[#242932] overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, stageItem.count > 0 ? 4 : 0)}%`,
                          backgroundColor: stageItem.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Intelligence Efficiency Summary */}
          <Card className="p-6 bg-[#12151A] border-[#242932] space-y-6">
            <div className="border-b border-[#242932] pb-4 space-y-0.5">
              <h3 className="text-sm font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" /> AI Efficiency Overview
              </h3>
              <p className="text-xs text-[#A7AFBC]">Automated CV screening insights</p>
            </div>

            <div className="space-y-5 text-xs text-[#A7AFBC]">
              <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932] space-y-2">
                <div className="flex justify-between items-center text-[#F5F7FA]">
                  <span className="font-semibold">Qualified Candidates</span>
                  <span className="font-mono text-[#39D9FF]">
                    {data.aiSummary.qualifiedCount} Passed
                  </span>
                </div>
                <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
                  {data.aiSummary.qualifiedCount} candidates met the required threshold and proceeded in the pipeline.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932] space-y-2">
                <div className="flex justify-between items-center text-[#F5F7FA]">
                  <span className="font-semibold">Knocked Out</span>
                  <span className="font-mono text-[#FF5C67]">
                    {data.aiSummary.knockedOutCount} Rejected
                  </span>
                </div>
                <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
                  Candidates rejected automatically due to low screening match scores.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </ApplicationShell>
  );
}
