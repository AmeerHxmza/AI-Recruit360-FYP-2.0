"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardDataAction } from "@/app/actions/organization";
import { DashboardData } from "@/lib/services/dashboard-service";
import { TrendingUp, Clock, Sparkles, Target, Layers, Loader2, AlertCircle, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  const { organization } = useAuth();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    getDashboardDataAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(res.error || "Failed to load recruitment analytics.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const totalApplications = data?.metrics.totalApplications ?? 0;
  const funnelStages = React.useMemo(() => {
    if (!data || totalApplications === 0) return [];
    return [
      { stage: "Applied", count: data.funnel.applied, color: "#39D9FF" },
      { stage: "Screening", count: data.funnel.screening, color: "#63E3FF" },
      { stage: "Interview", count: data.funnel.interview, color: "#F5B942" },
      { stage: "Evaluation", count: data.funnel.evaluation, color: "#A7AFBC" },
      { stage: "Shortlisted", count: data.funnel.shortlisted, color: "#35D07F" },
      { stage: "Hired", count: data.funnel.hired, color: "#00E5A3" },
    ];
  }, [data, totalApplications]);

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Analytics"]}>
      <PageHeader
        title="Recruitment Analytics"
        description="Performance metrics, hiring funnel conversion, and AI screening efficiency insights."
      />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center gap-2 text-xs text-[#FF5C67]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Computing workspace analytics...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Active Positions"
              value={data?.metrics.activeJobs ?? 0}
              description="Open recruiting roles"
              icon={<Clock className="h-4 w-4" />}
            />
            <MetricCard
              label="Pipeline Volume"
              value={data?.metrics.totalApplications ?? 0}
              description="Submitted candidate profiles"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricCard
              label="AI Screenings"
              value={data?.metrics.aiAnalysesCount ?? 0}
              description="Processed evaluation reports"
              icon={<Sparkles className="h-4 w-4" />}
              highlight={true}
            />
            <MetricCard
              label="Avg Match Score"
              value={data?.aiSummary.averageScore ? `${data.aiSummary.averageScore}%` : "0%"}
              description="Candidate alignment score"
              icon={<Target className="h-4 w-4" />}
            />
          </div>

          {/* Analytics Visual Grid or Empty State */}
          {totalApplications === 0 ? (
            <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
                <BarChart2 className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold font-display text-[#F5F7FA]">
                  Not enough recruitment data yet
                </h3>
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  Analytics and conversion funnel charts will appear automatically as candidates submit applications and move through your hiring pipeline.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hiring Funnel Breakdown */}
              <div className="lg:col-span-12">
                <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#242932]">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#39D9FF]" />
                      <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                        Hiring Funnel Conversion
                      </h3>
                    </div>
                    <span className="text-xs text-[#A7AFBC]">
                      Total Applications: <span className="font-semibold text-[#F5F7FA] font-mono">{totalApplications}</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {funnelStages.map((stage) => {
                      const pct = Math.round((stage.count / totalApplications) * 100);
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
            </div>
          )}
        </>
      )}
    </ApplicationShell>
  );
}

