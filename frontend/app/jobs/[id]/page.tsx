"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HiringPipeline } from "@/components/dashboard/hiring-pipeline";
import { RecentCandidates } from "@/components/dashboard/recent-candidates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockJobs } from "@/lib/mock/jobs";
import { mockRecentCandidates } from "@/lib/mock/candidates";
import { mockHiringPipeline } from "@/lib/mock/dashboard";
import { ArrowLeft, Edit, Sparkles, Users, UserCheck, Video, CheckCircle2 } from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "job-001";

  const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Jobs", job.title]}>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.location} · ${job.employmentType}`}
        badge={<Badge variant="success">{job.status}</Badge>}
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs Directory
          </button>
        }
        actions={
          <Button variant="secondary" size="sm">
            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Job
          </Button>
        }
      />

      {/* Overview Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Applicants"
          value={job.applicantsCount}
          description="Received applications"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="In Screening"
          value={job.screeningCount}
          description="AI evidence verification"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Interviews"
          value={job.interviewsCount}
          description="Adaptive AI sessions"
          icon={<Video className="h-4 w-4" />}
        />
        <MetricCard
          label="Shortlisted"
          value={job.shortlistedCount}
          description="Passed threshold"
          icon={<CheckCircle2 className="h-4 w-4" />}
          highlight={true}
        />
      </div>

      {/* Grid Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Description & Candidate Pipeline Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Job Requirements & Overview Card */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Job Description &amp; Specifications
            </h3>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              {job.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#1C2027]">
              <span className="text-xs font-semibold text-[#F5F7FA] block">
                Required Qualifications &amp; Benchmark Criteria:
              </span>
              <ul className="space-y-1.5 text-xs text-[#A7AFBC] list-disc list-inside">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#1C2027]">
              <span className="text-xs font-semibold text-[#A7AFBC] block mb-2">
                Target Skill Tags:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="ai" className="text-[11px] px-2 py-0.5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Candidate Applications Table */}
          <RecentCandidates
            candidates={mockRecentCandidates}
            onViewAll={() => router.push("/candidates")}
            onSelectCandidate={(cand) => router.push(`/candidates/${cand.id}`)}
          />
        </div>

        {/* Right Column: AI Screening Summary & Hiring Pipeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Screening Summary Card */}
          <Card elevated className="p-5 border-[#39D9FF]/30 bg-[#171B21] space-y-3">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  AI Screening Summary
                </h3>
              </div>
              <Badge variant="ai" className="text-[10px]">
                Threshold {job.aiThreshold}%
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 border-b border-[#242932]">
              <div>
                <span className="text-lg font-bold text-[#F5F7FA] font-display block">124</span>
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Analyzed</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[#35D07F] font-display block">27</span>
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Strong</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[#39D9FF] font-display block">91%</span>
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Avg Conf</span>
              </div>
            </div>

            <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
              Automated RAG screening pipeline currently enforcing a {job.aiThreshold}% minimum match score threshold.
            </p>
          </Card>

          {/* Hiring Pipeline Breakdown */}
          <HiringPipeline stages={mockHiringPipeline} />
        </div>
      </div>
    </ApplicationShell>
  );
}
