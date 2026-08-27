import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrganizationContext } from "@/lib/auth/session";
import { getJobByIdAction } from "@/app/actions/jobs";
import { getApplicationsAction } from "@/app/actions/applications";
import { EmploymentType, WorkplaceType } from "@/types/database.types";
import { analyzeJobDescriptionAction } from "@/app/actions/ai";
import { JobContentRenderer } from "@/components/jobs/job-content-renderer";
import { JobApplicationLinkCard } from "@/components/jobs/job-application-link-card";
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  // Eliminate Request Waterfalls using Promise.all safely
  const [jobRes, appsRes] = await Promise.all([
    getJobByIdAction(jobId),
    getApplicationsAction()
  ]);

  if (!jobRes.success || !jobRes.data) {
    return (
      <ApplicationShell pageBreadcrumb={[ctx.organization?.name || "AI-Recruit360", "Jobs", "Not Found"]}>
        <div className="p-12 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F7FA]">Position Not Found</h3>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {jobRes.error || "The requested job position record does not exist or you do not have permission to view it."}
          </p>
          <Link href="/jobs" className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#242932] text-xs font-semibold text-[#F5F7FA] hover:bg-[#2A303A] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Jobs
          </Link>
        </div>
      </ApplicationShell>
    );
  }

  const job = jobRes.data;

  // Cumulative Pipeline Stats calculation
  let pipelineStats = {
    applied: 0,
    screening: 0,
    assessment: 0,
    interview: 0,
    evaluation: 0,
    shortlisted: 0,
    knockedOut: 0,
    totalApplicants: 0,
    qualified: 0,
  };

  if (appsRes.success && appsRes.data) {
    const jobApps = appsRes.data.filter(a => a.job_id === job.id);
    pipelineStats = {
      applied: jobApps.length,
      screening: jobApps.filter(a => ["screening", "knocked_out", "assessment", "assessment_failed", "interview", "evaluation", "shortlisted", "rejected", "hired"].includes(a.status)).length,
      assessment: jobApps.filter(a => ["assessment", "assessment_failed", "interview", "evaluation", "shortlisted", "hired"].includes(a.status)).length,
      interview: jobApps.filter(a => ["interview", "evaluation", "shortlisted", "hired"].includes(a.status)).length,
      evaluation: jobApps.filter(a => ["evaluation", "shortlisted", "hired"].includes(a.status)).length,
      shortlisted: jobApps.filter(a => ["shortlisted", "hired"].includes(a.status)).length,
      knockedOut: jobApps.filter(a => ["knocked_out", "assessment_failed", "rejected"].includes(a.status)).length,
      totalApplicants: jobApps.length,
      qualified: jobApps.filter(a => ["assessment", "interview", "evaluation", "shortlisted", "hired"].includes(a.status)).length,
    };
  }

  const aiRes = await analyzeJobDescriptionAction({
    title: job.title,
    description: job.description || "Not provided",
    requirements: job.requirements || "Not provided"
  });
  const jobAnalysis = aiRes.success ? aiRes.analysis : null;

  const formatEmploymentType = (type: EmploymentType | null) => {
    if (!type) return "Full-Time";
    switch (type) {
      case "full_time": return "Full-Time";
      case "part_time": return "Part-Time";
      case "contract": return "Contract";
      case "internship": return "Internship";
      default: return type;
    }
  };

  const formatWorkplaceType = (type: WorkplaceType | null) => {
    if (!type) return "Hybrid";
    switch (type) {
      case "on_site": return "On-Site";
      case "hybrid": return "Hybrid";
      case "remote": return "Remote";
      default: return type;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={[ctx.organization?.name || "AI-Recruit360", "Jobs", job.title]}>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.location} · ${formatWorkplaceType(job.workplace_type)} · ${formatEmploymentType(job.employment_type)}`}
        badge={<Badge variant="outline" className="text-xs font-mono">{job.status}</Badge>}
        breadcrumbs={
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs
          </Link>
        }
      />

      <div className="space-y-6 mt-6">
        
        {/* Candidate Pipeline Horizontal Funnel */}
        <Card className="p-6 border-[#242932] bg-[#12151A] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#F5F7FA] font-display">Candidate Pipeline Funnel</h3>
            <span className="text-xs font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-2.5 py-1 rounded border border-[#39D9FF]/20">
              {pipelineStats.totalApplicants} Total Candidates
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Applied", count: pipelineStats.applied, color: "#39D9FF" },
              { label: "Screening", count: pipelineStats.screening, color: "#63E3FF" },
              { label: "Assessment", count: pipelineStats.assessment, color: "#F5B942" },
              { label: "Interview", count: pipelineStats.interview, color: "#35D07F" },
              { label: "Evaluated", count: pipelineStats.evaluation, color: "#8957FF" },
              { label: "Shortlisted", count: pipelineStats.shortlisted, color: "#00E5A3" },
              { label: "Knocked Out", count: pipelineStats.knockedOut, color: "#FF5C67" },
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col p-3.5 rounded-xl border border-[#1C2027] bg-[#0D0F12] relative overflow-hidden group hover:border-[#242932] transition-colors">
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-90" 
                  style={{ backgroundColor: stage.color }} 
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7AFBC] mb-1.5 z-10">{stage.label}</span>
                <span className="text-2xl font-bold font-display text-[#F5F7FA] z-10">{stage.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Job Description & Specifications */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-6">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39D9FF]" />
                  Job Description &amp; Overview
                </h3>
              </div>
              
              <JobContentRenderer content={job.description || "No description provided."} />

              <div className="pt-5 border-t border-[#242932] space-y-4">
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F]" />
                  Role Requirements &amp; Qualifications
                </h3>
                
                <JobContentRenderer content={job.requirements || "No specific qualifications listed."} />
              </div>
            </Card>
            
            {/* AI Job Analysis */}
            {jobAnalysis && (
              <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
                <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                    <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                      AI Job Analysis &amp; Screening Criteria
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#F5F7FA] font-display">Required Skills Extract</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#FF5C67] uppercase mb-1.5 block">Critical</span>
                        <div className="flex flex-wrap gap-1.5">
                          {jobAnalysis.skills.filter(s => s.importance === "critical").map((s, i) => (
                            <Badge key={i} variant="outline" className="border-[#FF5C67]/30 text-[#FF5C67] bg-[#FF5C67]/5">{s.name}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#F5B942] uppercase mb-1.5 block">Important</span>
                        <div className="flex flex-wrap gap-1.5">
                          {jobAnalysis.skills.filter(s => s.importance === "important").map((s, i) => (
                            <Badge key={i} variant="outline" className="border-[#F5B942]/30 text-[#F5B942] bg-[#F5B942]/5">{s.name}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#F5F7FA] font-display">Experience &amp; Education</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2.5 rounded-lg bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Minimum Experience:</span>
                        <span className="font-mono text-[#F5F7FA] font-bold">{jobAnalysis.experience.minimum_years ?? 0} years</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Preferred Experience:</span>
                        <span className="font-mono text-[#F5F7FA] font-bold">{jobAnalysis.experience.preferred_years ?? jobAnalysis.experience.minimum_years ?? 0} years</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Degree Required:</span>
                        <span className="font-mono text-[#F5F7FA] font-bold">{jobAnalysis.education.required ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Link & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <JobApplicationLinkCard slugOrId={job.slug || job.id} jobTitle={job.title} />

            <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Position Statistics
                </h3>
                <Link href="/candidates" className="text-xs text-[#39D9FF] hover:text-[#63E3FF] flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> View Candidates
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#1C2027] text-center space-y-1">
                  <div className="text-2xl font-bold font-display text-[#F5F7FA]">{pipelineStats.totalApplicants}</div>
                  <div className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-semibold">Total Applicants</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#35D07F]/20 text-center space-y-1">
                  <div className="text-2xl font-bold font-display text-[#35D07F]">
                    {pipelineStats.qualified}
                  </div>
                  <div className="text-[10px] text-[#35D07F] uppercase tracking-wider font-semibold">Qualified</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ApplicationShell>
  );
}
