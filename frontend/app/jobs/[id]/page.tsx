import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getOrganizationContext } from "@/lib/auth/session";
import { getJobByIdAction } from "@/app/actions/jobs";
import { createClient } from "@/lib/supabase/server";
import { ApplicationStatus } from "@/types/database.types";
import { EmploymentType, WorkplaceType } from "@/types/database.types";
import { JobContentRenderer } from "@/components/jobs/job-content-renderer";
import { JobApplicationLinkCard } from "@/components/jobs/job-application-link-card";
import { ArrowLeft, AlertCircle, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { canManageJobs } from "@/lib/auth/permissions";
import { JobStatusControl } from "@/components/jobs/job-status-control";

export const revalidate = 0; // Dynamic server component

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const jobRes = await getJobByIdAction(jobId);

  if (!jobRes.success || !jobRes.data) {
    return (
      <ApplicationShell
        pageBreadcrumb={[
          ctx.organization?.name || "AI-Recruit360",
          "Jobs",
          "Not Found",
        ]}
      >
        <div className="p-12 text-center rounded-2xl border border-border bg-surface space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-danger mx-auto" />
          <h3 className="text-lg font-bold text-text-primary">
            Position Not Found
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {jobRes.error ||
              "The requested job position record does not exist or you do not have permission to view it."}
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-hover text-xs font-semibold text-text-primary hover:bg-surface transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Jobs
          </Link>
        </div>
      </ApplicationShell>
    );
  }

  const job = jobRes.data;

  const supabase = await createClient();
  const countApplications = async (statuses?: ApplicationStatus[]) => {
    let query = supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id)
      .eq("job_id", job.id);
    if (statuses) query = query.in("status", statuses);
    const { count, error } = await query;
    if (error) throw new Error("Unable to load job application counts.");
    return count ?? 0;
  };
  // Exact database counts are independent of application list pagination.
  const [
    totalApplicants,
    applied,
    screening,
    assessment,
    interview,
    evaluation,
    shortlisted,
    knockedOut,
    qualified,
  ] = await Promise.all([
    countApplications(),
    countApplications(["applied"]),
    countApplications(["screening"]),
    countApplications(["assessment"]),
    countApplications(["interview"]),
    countApplications(["evaluation"]),
    countApplications(["shortlisted", "hired"]),
    countApplications(["knocked_out", "assessment_failed", "rejected"]),
    countApplications([
      "assessment",
      "interview",
      "evaluation",
      "shortlisted",
      "hired",
    ]),
  ]);
  const pipelineStats = {
    totalApplicants,
    applied,
    screening,
    assessment,
    interview,
    evaluation,
    shortlisted,
    knockedOut,
    qualified,
  };

  const formatEmploymentType = (type: EmploymentType | null) => {
    if (!type) return "Full-Time";
    switch (type) {
      case "full_time":
        return "Full-Time";
      case "part_time":
        return "Part-Time";
      case "contract":
        return "Contract";
      case "internship":
        return "Internship";
      default:
        return type;
    }
  };

  const formatWorkplaceType = (type: WorkplaceType | null) => {
    if (!type) return "Hybrid";
    switch (type) {
      case "on_site":
        return "On-Site";
      case "hybrid":
        return "Hybrid";
      case "remote":
        return "Remote";
      default:
        return type;
    }
  };

  return (
    <ApplicationShell
      pageBreadcrumb={[
        ctx.organization?.name || "AI-Recruit360",
        "Jobs",
        job.title,
      ]}
    >
      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.location} · ${formatWorkplaceType(job.workplace_type)} · ${formatEmploymentType(job.employment_type)}`}
        badge={
          <JobStatusControl
            jobId={job.id}
            initialStatus={job.status}
            canManage={canManageJobs(ctx.role)}
          />
        }
        breadcrumbs={
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs text-text-secondary hover:text-action-blue transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs
          </Link>
        }
      />

      <div className="space-y-6 mt-6">
        {/* Candidate Pipeline Horizontal Funnel */}
        <Card className="p-6 border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-primary font-display">
              Current application stages
            </h3>
            <span className="text-xs font-mono text-action-blue bg-action-blue/10 px-2.5 py-1 rounded border border-action-blue/20">
              {pipelineStats.totalApplicants} Total Candidates
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              {
                label: "Received",
                count: pipelineStats.applied,
                color: "#A7AFBC",
              },
              {
                label: "Screening",
                count: pipelineStats.screening,
                color: "var(--action-blue)",
              },
              {
                label: "Assessment",
                count: pipelineStats.assessment,
                color: "#F5B942",
              },
              {
                label: "Interview",
                count: pipelineStats.interview,
                color: "#4B92FF",
              },
              {
                label: "Evaluated",
                count: pipelineStats.evaluation,
                color: "var(--success)",
              },
              {
                label: "Shortlist / hired",
                count: pipelineStats.shortlisted,
                color: "#00E5A3",
              },
              {
                label: "Not advanced",
                count: pipelineStats.knockedOut,
                color: "var(--danger)",
              },
            ].map((stage, idx) => (
              <div
                key={idx}
                className="flex flex-col p-3.5 rounded-xl border border-border bg-surface relative overflow-hidden group hover:border-border transition-colors"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1 opacity-90"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 z-10">
                  {stage.label}
                </span>
                <span className="text-2xl font-bold font-display text-text-primary z-10">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Description & Specifications */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-border bg-surface space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-action-blue" />
                  Job Description &amp; Overview
                </h3>
              </div>

              <JobContentRenderer
                content={job.description || "No description provided."}
              />

              <div className="pt-5 border-t border-border space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Role Requirements &amp; Qualifications
                </h3>

                <JobContentRenderer
                  content={
                    job.requirements || "No specific qualifications listed."
                  }
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Link & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <JobApplicationLinkCard
              slugOrId={job.slug || job.id}
              jobTitle={job.title}
            />

            <Card className="p-5 border-border bg-surface space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                  Position Statistics
                </h3>
                <Link
                  href="/candidates"
                  className="text-xs text-action-blue hover:text-text-secondary flex items-center gap-1"
                >
                  <Users className="h-3.5 w-3.5" /> View Candidates
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface border border-border text-center space-y-1">
                  <div className="text-2xl font-bold font-display text-text-primary">
                    {pipelineStats.totalApplicants}
                  </div>
                  <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                    Total Applicants
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-success/20 text-center space-y-1">
                  <div className="text-2xl font-bold font-display text-success">
                    {pipelineStats.qualified}
                  </div>
                  <div className="text-xs text-success uppercase tracking-wider font-semibold">
                    Qualified
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ApplicationShell>
  );
}
