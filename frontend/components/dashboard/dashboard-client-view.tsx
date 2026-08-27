"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
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
import { DashboardData } from "@/lib/services/dashboard-service";
import {
  Users,
  Briefcase,
  Sparkles,
  UserCheck,
  ChevronRight,
  Plus,
  FileText,
  CheckCircle2,
  Video,
  ExternalLink,
  Target,
} from "lucide-react";

interface DashboardClientViewProps {
  initialData: DashboardData;
  userName: string;
}

export function DashboardClientView({ initialData, userName }: DashboardClientViewProps) {
  const router = useRouter();
  const [data] = React.useState<DashboardData>(initialData);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <Badge variant="success" className="text-[10px] px-2 py-0.5 uppercase font-mono">Shortlisted</Badge>;
      case "interview":
        return <Badge variant="ai" className="text-[10px] px-2 py-0.5 uppercase font-mono">Interview</Badge>;
      case "screening":
        return <Badge variant="warning" className="text-[10px] px-2 py-0.5 uppercase font-mono">Screening</Badge>;
      case "assessment":
        return <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase font-mono border-[#F5B942]/40 text-[#F5B942]">Assessment</Badge>;
      case "evaluation":
        return <Badge variant="ai" className="text-[10px] px-2 py-0.5 uppercase font-mono">Evaluation</Badge>;
      case "knocked_out":
      case "rejected":
        return <Badge variant="danger" className="text-[10px] px-2 py-0.5 uppercase font-mono">{status.replace("_", " ")}</Badge>;
      default:
        return <Badge variant="default" className="text-[10px] px-2 py-0.5 uppercase font-mono">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: number | null, suffix = "%") => {
    if (score === null || score === undefined) return <span className="text-[#68717E] text-xs font-mono">—</span>;
    if (score >= 80) {
      return <span className="font-mono text-xs font-bold text-[#35D07F]">{score}{suffix}</span>;
    }
    if (score >= 60) {
      return <span className="font-mono text-xs font-bold text-[#39D9FF]">{score}{suffix}</span>;
    }
    return <span className="font-mono text-xs font-bold text-[#FF5C67]">{score}{suffix}</span>;
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        userName={userName}
        onCreateJob={() => router.push("/jobs/new")}
      />

      {/* Primary Metrics Editorial Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Jobs"
          value={data.metrics.activeJobs}
          description="Open recruitment positions"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Applications"
          value={data.metrics.totalApplications}
          description="Candidates received"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Qualified Pipeline"
          value={data.metrics.qualifiedCandidates}
          description="Passed initial screening"
          icon={<UserCheck className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="AI Voice Interviews"
          value={data.metrics.aiInterviews}
          description="Active / completed sessions"
          icon={<Video className="h-4 w-4" />}
        />
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Intelligence & Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          {/* Candidate Screening Funnel Card */}
          <Card elevated className="p-6 border-[#242932] bg-[#12151A] space-y-5">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Recruitment Intelligence Pipeline Flow
                </h3>
              </div>
              <span className="text-xs font-mono text-[#A7AFBC]">
                {data.metrics.totalApplications} Total Candidates Ingested
              </span>
            </div>

            {data.metrics.totalApplications > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0D0F12] border border-[#242932] p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs font-mono text-[#A7AFBC] uppercase block">1. Ingested</span>
                    <span className="text-2xl font-bold text-[#F5F7FA] font-display block">
                      {data.metrics.totalApplications}
                    </span>
                    <span className="text-[10px] text-[#68717E]">Applications</span>
                  </div>

                  <div className="bg-[#0D0F12] border border-[#242932] p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs font-mono text-[#39D9FF] uppercase block">2. CV Screened</span>
                    <span className="text-2xl font-bold text-[#39D9FF] font-display block">
                      {data.aiSummary.totalScreened}
                    </span>
                    <span className="text-[10px] text-[#A7AFBC]">Avg {data.aiSummary.averageMatchScore}% Match</span>
                  </div>

                  <div className="bg-[#0D0F12] border border-[#35D07F]/30 bg-[#35D07F]/5 p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs font-mono text-[#35D07F] uppercase block">3. Qualified</span>
                    <span className="text-2xl font-bold text-[#35D07F] font-display block">
                      {data.aiSummary.qualifiedCount || data.metrics.qualifiedCandidates}
                    </span>
                    <span className="text-[10px] text-[#35D07F]/80">Passed Baseline</span>
                  </div>

                  <div className="bg-[#0D0F12] border border-[#FF5C67]/30 bg-[#FF5C67]/5 p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs font-mono text-[#FF5C67] uppercase block">4. Knocked Out</span>
                    <span className="text-2xl font-bold text-[#FF5C67] font-display block">
                      {data.aiSummary.knockedOutCount}
                    </span>
                    <span className="text-[10px] text-[#FF5C67]/80">Filter Criteria</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#242932] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                    <span className="text-[#A7AFBC]">Quick Actions:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/applications")} className="text-xs h-7">
                      View Pipeline →
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/interviews")} className="text-xs h-7 text-[#39D9FF]">
                      Live Interview Rooms →
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State for AI Screening */
              <div className="p-8 text-center space-y-3 bg-[#0D0F12] rounded-xl border border-[#242932]">
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  No candidate applications recorded yet.
                </p>
                <p className="text-[11px] text-[#68717E]">
                  Create your first job position and share the application link with candidates to begin automated evaluation.
                </p>
                <div className="pt-2">
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => router.push("/jobs/new")}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Job Position
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Candidate Applications Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Recent Candidate Submissions
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/candidates")}
                className="text-xs text-[#39D9FF] hover:text-[#63E3FF]"
              >
                View Full Directory <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            {data.recentApplications && data.recentApplications.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">CV Match</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Assessment</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Stage</TableHead>
                      <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentApplications.map((app) => (
                      <TableRow
                        key={app.id}
                        onClick={() => router.push(`/candidates/${app.candidateId}`)}
                        className="cursor-pointer border-b border-[#1C2027] hover:bg-[#171B21]/80 transition-colors"
                      >
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar fallback={app.candidateName.slice(0, 2).toUpperCase()} size="sm" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#F5F7FA] text-xs hover:text-[#39D9FF]">
                                {app.candidateName}
                              </span>
                              <span className="text-[10px] text-[#A7AFBC]">{app.candidateEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.jobTitle}</TableCell>
                        <TableCell>{getScoreBadge(app.cvMatch)}</TableCell>
                        <TableCell>{getScoreBadge(app.assessmentScore)}</TableCell>
                        <TableCell>{getScoreBadge(app.interviewScore)}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#A7AFBC] hover:text-[#39D9FF]"
                            title="Open Candidate Scorecard"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
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
                  No candidate applications have been submitted to your organization.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights & Activity */}
        <div className="lg:col-span-4 space-y-6">
          <InsightsPanel recentApplications={data.recentApplications} />
        </div>
      </div>
    </div>
  );
}

