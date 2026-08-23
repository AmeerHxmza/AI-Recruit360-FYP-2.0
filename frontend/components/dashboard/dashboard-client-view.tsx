"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
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
} from "lucide-react";

interface DashboardClientViewProps {
  initialData: DashboardData;
  userName: string;
  orgName: string;
}

export function DashboardClientView({ initialData, userName, orgName }: DashboardClientViewProps) {
  const router = useRouter();
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [data] = React.useState<DashboardData>(initialData);

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

  // Removed formatDate

  return (
    <ApplicationShell
      activeNavId={activeNav}
      onNavigate={setActiveNav}
      pageBreadcrumb={[
        orgName || "AI-Recruit360",
        "Command Center",
        "Overview",
      ]}
    >
      {/* Dashboard Header */}
      <DashboardHeader
        userName={userName}
        onCreateJob={() => router.push("/jobs/new")}
      />

      {/* Primary Metrics Editorial Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Jobs"
          value={data.metrics.activeJobs}
          description="Open positions"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          label="Applications"
          value={data.metrics.totalApplications}
          description="Total submissions"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Qualified"
          value={data.metrics.qualifiedCandidates}
          description="Passed CV screening"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="AI Interviews"
          value={data.metrics.aiInterviews}
          description="Completed / active"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={false}
        />
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Intelligence & Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          {/* Candidate Screening Funnel */}
          <Card elevated className="p-6 border-[#242932] bg-[#12151A] space-y-6">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Candidate Screening
                </h3>
              </div>
            </div>

            {data.metrics.totalApplications > 0 ? (
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-[#242932] -translate-y-1/2 z-0 hidden sm:block" />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  <div className="bg-[#0D0F12] border border-[#242932] p-4 rounded-xl text-center shadow-md">
                    <span className="text-2xl font-bold text-[#F5F7FA] font-display block">
                      {data.metrics.totalApplications}
                    </span>
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Applications</span>
                  </div>
                  <div className="bg-[#0D0F12] border border-[#242932] p-4 rounded-xl text-center shadow-md">
                    <span className="text-2xl font-bold text-[#39D9FF] font-display block">
                      {data.aiSummary.totalScreened}
                    </span>
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">CV Screened</span>
                  </div>
                  <div className="bg-[#0D0F12] border border-[#35D07F]/30 p-4 rounded-xl text-center shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#35D07F]/5 pointer-events-none" />
                    <span className="text-2xl font-bold text-[#35D07F] font-display block relative z-10">
                      {data.aiSummary.qualifiedCount}
                    </span>
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold relative z-10">Qualified</span>
                  </div>
                  <div className="bg-[#0D0F12] border border-[#FF5A5A]/30 p-4 rounded-xl text-center shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF5A5A]/5 pointer-events-none" />
                    <span className="text-2xl font-bold text-[#FF5A5A] font-display block relative z-10">
                      {data.aiSummary.knockedOutCount}
                    </span>
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold relative z-10">Knocked Out</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State for AI Screening */
              <div className="p-6 text-center space-y-3 bg-[#0D0F12] rounded-xl border border-[#242932]">
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  No candidate applications yet.
                </p>
                <p className="text-[11px] text-[#68717E]">
                  Create a job and share its application link to start receiving candidates.
                </p>
                <div className="pt-2">
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => router.push("/jobs/new")}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Job
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
                  Recent Candidates
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

            {data.recentApplications && data.recentApplications.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Job</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">CV Match</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Assessment</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
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
                        <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.cvMatch !== null ? `${app.cvMatch}%` : '—'}</TableCell>
                        <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.assessmentScore !== null ? `${app.assessmentScore}/10` : '—'}</TableCell>
                        <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.interviewScore !== null ? `${app.interviewScore}%` : '—'}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
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
                  No candidate applications have been submitted to {orgName}.
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
    </ApplicationShell>
  );
}
