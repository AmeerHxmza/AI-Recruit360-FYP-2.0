"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardData } from "@/lib/services/dashboard-service";
import {
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  Layers,
  BarChart2,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
} from "lucide-react";

interface AnalyticsClientViewProps {
  initialData: DashboardData;
  orgName: string;
}

export function AnalyticsClientView({ initialData, orgName }: AnalyticsClientViewProps) {
  const router = useRouter();
  const [data] = React.useState<DashboardData>(initialData);

  const totalApplications = data.metrics.totalApplications ?? 0;

  const funnelStages = React.useMemo(() => {
    if (totalApplications === 0) return [];
    return [
      { step: 1, stage: "Applied & Ingested", count: data.funnel.applied, color: "#A7AFBC", desc: "Total candidate applications submitted" },
      { step: 2, stage: "CV Screened", count: data.funnel.screening, color: "#39D9FF", desc: "Automated CV extraction & skills matching" },
      { step: 3, stage: "Technical Assessment", count: data.funnel.assessment, color: "#F5B942", desc: "Dynamic role-specific MCQ test completed" },
      { step: 4, stage: "Voice AI Interview", count: data.funnel.interview, color: "#63E3FF", desc: "Adaptive voice technical interview conducted" },
      { step: 5, stage: "AI Final Evaluation", count: data.funnel.evaluation, color: "#35D07F", desc: "Comprehensive scorecards generated" },
      { step: 6, stage: "Shortlisted for Hire", count: data.funnel.shortlisted, color: "#00E5A3", desc: "Recruiter approved for final hire" },
    ];
  }, [data, totalApplications]);

  const screeningPassRate = data.aiSummary.totalScreened > 0
    ? Math.round((data.aiSummary.qualifiedCount / data.aiSummary.totalScreened) * 100)
    : 0;

  return (
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "Analytics"]}>
      <PageHeader
        title="Recruitment Analytics & Funnel Intelligence"
        description="Real-time pipeline progression, candidate conversion rates across hiring stages, and AI screening efficiency metrics."
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
          description="Automated CV evaluations"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Avg Match Score"
          value={data.aiSummary.averageMatchScore ? `${data.aiSummary.averageMatchScore}%` : "0%"}
          description="Candidate alignment index"
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
          <div className="pt-2">
            <Button variant="ai" size="sm" onClick={() => router.push("/jobs/new")}>
              Create First Job Position
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recruitment Funnel Visual */}
          <Card className="lg:col-span-8 p-6 bg-[#12151A] border-[#242932] space-y-6">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#39D9FF]" /> Workspace Recruitment Funnel
                </h3>
                <p className="text-xs text-[#A7AFBC]">Cumulative conversion rates and stage milestone completions</p>
              </div>
              <span className="text-xs font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-2.5 py-1 rounded-md border border-[#39D9FF]/20">
                {totalApplications} Total Candidates
              </span>
            </div>

            <div className="space-y-5">
              {funnelStages.map((stageItem) => {
                const percentage = totalApplications > 0 ? Math.round((stageItem.count / totalApplications) * 100) : 0;

                return (
                  <div key={stageItem.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0D0F12] border border-[#242932] text-[10px] font-mono text-[#A7AFBC]">
                          {stageItem.step}
                        </span>
                        <span className="font-semibold text-[#F5F7FA]">{stageItem.stage}</span>
                        <span className="text-[10px] text-[#68717E] hidden sm:inline">— {stageItem.desc}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[#F5F7FA] font-bold">{stageItem.count} Candidates</span>
                        <span className="text-[#39D9FF] font-semibold">({percentage}%)</span>
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

            <div className="pt-2 border-t border-[#242932] flex items-center justify-between">
              <span className="text-xs text-[#A7AFBC]">Looking for candidate-specific hiring scorecards?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/evaluations")}
                className="text-xs text-[#39D9FF] hover:text-[#63E3FF] h-8"
              >
                Go to Evaluations <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card>

          {/* AI Intelligence & Pipeline Distribution */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-[#12151A] border-[#242932] space-y-5">
              <div className="border-b border-[#242932] pb-3 space-y-0.5">
                <h3 className="text-sm font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" /> AI Efficiency Overview
                </h3>
                <p className="text-xs text-[#A7AFBC]">Automated CV screening insights</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#35D07F]/20 space-y-2">
                  <div className="flex justify-between items-center text-[#F5F7FA]">
                    <span className="font-semibold flex items-center gap-1.5 text-[#35D07F]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Qualified Candidates
                    </span>
                    <span className="font-mono text-[#35D07F] font-bold">
                      {data.aiSummary.qualifiedCount} Passed
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
                    {data.aiSummary.qualifiedCount} candidates met the required threshold and proceeded in the pipeline.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#FF5C67]/20 space-y-2">
                  <div className="flex justify-between items-center text-[#F5F7FA]">
                    <span className="font-semibold flex items-center gap-1.5 text-[#FF5C67]">
                      <XCircle className="w-3.5 h-3.5" /> Knocked Out / Rejected
                    </span>
                    <span className="font-mono text-[#FF5C67] font-bold">
                      {data.aiSummary.knockedOutCount || data.funnel.knocked_out} Candidates
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
                    Filtered automatically due to low screening match scores or assessment criteria.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932] space-y-2">
                  <div className="flex justify-between items-center text-[#F5F7FA]">
                    <span className="font-semibold flex items-center gap-1.5 text-[#39D9FF]">
                      <Award className="w-3.5 h-3.5" /> Screening Pass Rate
                    </span>
                    <span className="font-mono text-[#39D9FF] font-bold">
                      {screeningPassRate}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
                    Ratio of applicants qualifying for technical assessment vs total applications.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}

