"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

export function AnalyticsClientView({ initialData }: AnalyticsClientViewProps) {
  const router = useRouter();
  const data = initialData;

  const totalApplications = data.metrics.totalApplications ?? 0;

  const funnelStages = React.useMemo(() => {
    if (totalApplications === 0) return [];
    return [
      {
        step: 1,
        stage: "Applied",
        count: data.funnel.applied,
        color: "var(--text-muted)",
        desc: "Total candidate applications submitted",
      },
      {
        step: 2,
        stage: "Screened",
        count: data.funnel.screening,
        color: "var(--action-blue)",
        desc: "Automated CV extraction and skills matching",
      },
      {
        step: 3,
        stage: "Technical assessment",
        count: data.funnel.assessment,
        color: "var(--warning)",
        desc: "Timed MCQ test completed",
      },
      {
        step: 4,
        stage: "AI interview",
        count: data.funnel.interview,
        color: "var(--action-blue)",
        desc: "Adaptive technical interview conducted",
      },
      {
        step: 5,
        stage: "Final evaluation",
        count: data.funnel.evaluation,
        color: "var(--success)",
        desc: "Multi-signal scorecard generated",
      },
      {
        step: 6,
        stage: "Shortlisted",
        count: data.funnel.shortlisted,
        color: "var(--success)",
        desc: "Recruiter approved for final hire",
      },
    ];
  }, [data, totalApplications]);

  const screeningPassRate =
    data.aiSummary.totalScreened > 0
      ? Math.round(
          (data.aiSummary.qualifiedCount / data.aiSummary.totalScreened) * 100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Pipeline progression, stage conversion rates, and recruitment velocity metrics."
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active jobs"
          value={data.metrics.activeJobs ?? 0}
          description="Open recruitment positions"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          label="Pipeline volume"
          value={data.metrics.totalApplications ?? 0}
          description="Total candidate applications"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="CV screenings"
          value={data.aiSummary.totalScreened ?? 0}
          description="Automated resume analyses"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Average match score"
          value={
            data.aiSummary.averageMatchScore
              ? `${data.aiSummary.averageMatchScore}%`
              : "0%"
          }
          description="Candidate alignment index"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Analytics Visual Grid or Empty State */}
      {totalApplications === 0 ? (
        <Card className="p-12 text-center bg-surface border-border space-y-4">
          <BarChart2 className="h-10 w-10 text-text-muted mx-auto" />
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-base font-semibold text-text-primary">
              No recruitment data recorded yet
            </h4>
            <p className="text-xs text-text-secondary">
              Analytics and funnel conversion metrics will populate as candidate
              applications progress through stages.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/jobs/new")}
            >
              Create job
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recruitment Funnel Visual */}
          <Card className="lg:col-span-8 p-6 bg-surface border-border space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4 text-action-blue" /> Recruitment
                  pipeline conversion
                </h3>
                <p className="text-xs text-text-secondary">
                  Cumulative conversion rates and stage milestone completions
                </p>
              </div>
              <span className="text-xs text-text-secondary bg-background px-2.5 py-1 rounded-md border border-border">
                {totalApplications} total applicants
              </span>
            </div>

            <div className="space-y-5">
              {funnelStages.map((stageItem) => {
                const percentage =
                  totalApplications > 0
                    ? Math.round((stageItem.count / totalApplications) * 100)
                    : 0;

                return (
                  <div key={stageItem.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border text-xs text-text-secondary">
                          {stageItem.step}
                        </span>
                        <span className="font-medium text-text-primary">
                          {stageItem.stage}
                        </span>
                        <span className="text-xs text-text-muted hidden sm:inline">
                          — {stageItem.desc}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">
                          {stageItem.count} candidates
                        </span>
                        <span className="text-action-blue font-medium">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-background border border-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(percentage, stageItem.count > 0 ? 3 : 0)}%`,
                          backgroundColor: stageItem.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Looking for candidate-specific hiring scorecards?
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/evaluations")}
                className="text-xs text-action-blue hover:text-action-blue h-8"
              >
                Go to evaluations <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card>

          {/* AI Intelligence & Pipeline Distribution */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-surface border-border space-y-5">
              <div className="border-b border-border pb-3 space-y-0.5">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-action-blue" /> Screening
                  efficiency
                </h3>
                <p className="text-xs text-text-secondary">
                  Automated resume screening insights
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-background border border-success/20 space-y-1.5">
                  <div className="flex justify-between items-center text-text-primary">
                    <span className="font-medium flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                      candidates
                    </span>
                    <span className="text-success font-medium font-sans">
                      {data.aiSummary.qualifiedCount} passed
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {data.aiSummary.qualifiedCount} candidates met required
                    criteria and unlocked assessment.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-danger/20 space-y-1.5">
                  <div className="flex justify-between items-center text-text-primary">
                    <span className="font-medium flex items-center gap-1.5 text-danger">
                      <XCircle className="w-3.5 h-3.5" /> Not advanced
                    </span>
                    <span className="text-danger font-medium font-sans">
                      {data.aiSummary.knockedOutCount ||
                        data.funnel.knocked_out}{" "}
                      candidates
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Filtered automatically due to unmet role requirements or
                    knockout rules.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                  <div className="flex justify-between items-center text-text-primary">
                    <span className="font-medium flex items-center gap-1.5 text-action-blue">
                      <Award className="w-3.5 h-3.5" /> Screening pass rate
                    </span>
                    <span className="text-action-blue font-medium font-sans">
                      {screeningPassRate}%
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Ratio of applicants advancing to technical assessment.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
