"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HiringPipeline } from "@/components/dashboard/hiring-pipeline";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardDataAction } from "@/app/actions/organization";
import { DashboardData } from "@/lib/services/dashboard-service";
import {
  Users,
  Briefcase,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronRight,
  UserCheck,
  FileText,
  Plus,
} from "lucide-react";

import { useWorkspaceCache } from "@/providers/data-cache-provider";

export default function DashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const { userMetadata, organization } = useAuth();
  const { cache } = useWorkspaceCache();

  const [data, setData] = React.useState<DashboardData | null>(
    (cache?.dashboard as DashboardData | null) || null
  );
  const [loading, setLoading] = React.useState<boolean>(!cache?.dashboard);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cache?.dashboard) return;

    let isMounted = true;
    getDashboardDataAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(res.error || "Unable to fetch dashboard metrics.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [cache?.dashboard, organization?.id]);

  // Format Funnel Stages
  const funnelStages = React.useMemo(() => {
    if (!data) return [];
    const total = data.funnel.total || 1;
    const calcPct = (cnt: number) => (data.funnel.total > 0 ? Math.round((cnt / total) * 100) : 0);

    return [
      { stage: "Applied", count: data.funnel.applied, percentage: calcPct(data.funnel.applied), color: "#39D9FF" },
      { stage: "Screening", count: data.funnel.screening, percentage: calcPct(data.funnel.screening), color: "#63E3FF" },
      { stage: "Interview", count: data.funnel.interview, percentage: calcPct(data.funnel.interview), color: "#F5B942" },
      { stage: "Evaluation", count: data.funnel.evaluation, percentage: calcPct(data.funnel.evaluation), color: "#A7AFBC" },
      { stage: "Shortlisted", count: data.funnel.shortlisted, percentage: calcPct(data.funnel.shortlisted), color: "#35D07F" },
      { stage: "Hired", count: data.funnel.hired, percentage: calcPct(data.funnel.hired), color: "#00E5A3" },
    ];
  }, [data]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <Badge variant="success" className="text-[11px] px-2 py-0.5">Shortlisted</Badge>;
      case "interview":
        return <Badge variant="ai" className="text-[11px] px-2 py-0.5">Interview</Badge>;
      case "screening":
        return <Badge variant="warning" className="text-[11px] px-2 py-0.5">Screening</Badge>;
      default:
        return <Badge variant="default" className="text-[11px] px-2 py-0.5 capitalize">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ApplicationShell
      activeNavId={activeNav}
      onNavigate={setActiveNav}
      pageBreadcrumb={[
        organization?.name || "AI-Recruit360",
        "Command Center",
        "Overview",
      ]}
    >
      {/* Dashboard Header */}
      <DashboardHeader
        userName={userMetadata.fullName}
        onCreateJob={() => router.push("/jobs/new")}
      />

      {/* Error State Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.refresh()} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        /* Loading Skeleton State */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-[#12151A] border border-[#242932] animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
              <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Metrics Editorial Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Active Positions"
              value={data?.metrics.activeJobs ?? 0}
              description="Open recruiting roles"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <MetricCard
              label="Total Candidates"
              value={data?.metrics.totalCandidates ?? 0}
              description="Registered applicant records"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              label="Applications"
              value={data?.metrics.totalApplications ?? 0}
              description="Pipeline submissions"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <MetricCard
              label="AI Analyses"
              value={data?.metrics.aiAnalysesCount ?? 0}
              description="Processed evaluation reports"
              icon={<Sparkles className="h-4 w-4" />}
              highlight={true}
            />
          </div>

          {/* Main Command Center Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Intelligence & Recent Applications */}
            <div className="lg:col-span-8 space-y-6">
              {/* AI Intelligence Panel */}
              <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
                <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                    <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                      AI Screening Intelligence
                    </h3>
                  </div>
                  <Badge variant="ai" className="text-[10px]">
                    {data?.aiSummary.totalAnalyses ? `${data.aiSummary.totalAnalyses} Processed` : "Active"}
                  </Badge>
                </div>

                {data?.aiSummary && data.aiSummary.totalAnalyses > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932]">
                        <span className="text-2xl font-bold text-[#39D9FF] font-display block">
                          {data.aiSummary.averageScore}%
                        </span>
                        <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Avg Match</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932]">
                        <span className="text-2xl font-bold text-[#35D07F] font-display block">
                          {data.aiSummary.strongMatches}
                        </span>
                        <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Strong Matches</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932]">
                        <span className="text-2xl font-bold text-[#F5B942] font-display block">
                          {data.aiSummary.potentialMatches}
                        </span>
                        <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Potential</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932]">
                        <span className="text-2xl font-bold text-[#A7AFBC] font-display block">
                          {data.aiSummary.needsReview}
                        </span>
                        <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Under Review</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State for AI Screening */
                  <div className="p-6 text-center space-y-3 bg-[#0D0F12]/60 rounded-xl border border-[#242932]/60">
                    <p className="text-xs text-[#A7AFBC] leading-relaxed">
                      AI candidate screening metrics will appear here once candidate resumes are processed and evaluated.
                    </p>
                    <Button
                      variant="ai"
                      size="sm"
                      onClick={() => router.push("/jobs/new")}
                      className="mx-auto"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Job &amp; Begin Pipeline
                    </Button>
                  </div>
                )}
              </Card>

              {/* Recent Candidate Applications Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#39D9FF]" />
                    <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                      Recent Workspace Submissions
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/candidates")}
                    className="text-xs text-[#39D9FF] hover:text-[#63E3FF]"
                  >
                    View All Candidates <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>

                {data?.recentApplications && data.recentApplications.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                          <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                          <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
                          <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Submitted Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentApplications.map((app) => (
                          <TableRow
                            key={app.id}
                            onClick={() => router.push("/applications")}
                            className="cursor-pointer border-b border-[#1C2027] hover:bg-[#171B21]/80"
                          >
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar fallback={app.candidateName.slice(0, 2).toUpperCase()} size="sm" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#F5F7FA] text-xs">{app.candidateName}</span>
                                  <span className="text-[10px] text-[#A7AFBC]">{app.candidateEmail}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.jobTitle}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-xs text-[#68717E] font-mono">{formatDate(app.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  /* Empty State for Recent Submissions */
                  <div className="p-8 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-3">
                    <FileText className="h-8 w-8 text-[#68717E] mx-auto" />
                    <h4 className="text-xs font-bold text-[#F5F7FA]">No Submissions Yet</h4>
                    <p className="text-xs text-[#A7AFBC]">
                      No candidate applications have been submitted to {organization?.name || "this workspace"}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Hiring Pipeline & AI Insights */}
            <div className="lg:col-span-4 space-y-6">
              <HiringPipeline stages={funnelStages} />
              <InsightsPanel />
            </div>
          </div>
        </>
      )}
    </ApplicationShell>
  );
}
