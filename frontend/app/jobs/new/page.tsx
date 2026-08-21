"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { canManageJobs } from "@/lib/auth/permissions";
import { createJobAction } from "@/app/actions/jobs";
import { EmploymentType, JobStatus, WorkplaceType } from "@/types/database.types";
import { Sparkles, ArrowLeft, Save, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorized = canManageJobs(role);

  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>("full_time");
  const [workplaceType, setWorkplaceType] = React.useState<WorkplaceType>("hybrid");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [status, setStatus] = React.useState<JobStatus>("draft");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent, targetStatus?: JobStatus) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthorized) {
      setErrorMsg("You do not have authorization to create job postings.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Job title is required.");
      return;
    }
    if (!department.trim()) {
      setErrorMsg("Department is required.");
      return;
    }
    if (!location.trim()) {
      setErrorMsg("Job location is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createJobAction({
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        employment_type: employmentType,
        workplace_type: workplaceType,
        description: description.trim() || undefined,
        requirements: requirements.trim() || undefined,
        status: targetStatus || status,
      });

      if (res.success && res.data) {
        router.push(`/jobs/${res.data.id}`);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to create job position.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error("Job creation error:", err);
      setErrorMsg("An unexpected error occurred while saving the job position.");
      setIsSubmitting(false);
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", "Create Job"]}>
      <form onSubmit={(e) => handleSubmit(e, status)}>
        <PageHeader
          title="Create New Job Position"
          description="Configure job parameters, specifications, and recruitment requirements for workspace candidate pipelines."
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
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isSubmitting || !isAuthorized}
                onClick={(e) => handleSubmit(e, "draft")}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save Draft
              </Button>

              <Button
                type="button"
                variant="ai"
                size="md"
                disabled={isSubmitting || !isAuthorized}
                onClick={(e) => handleSubmit(e, "active")}
                className="shadow-[0_0_16px_rgba(57,217,255,0.25)]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1.5" />
                )}
                Publish Active Job
              </Button>
            </div>
          }
        />

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center gap-3 text-xs text-[#FF5C67]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isAuthorized && (
          <div className="mb-6 p-4 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-xs text-[#F5B942]">
            You have read-only access in this workspace. Creation of job positions requires Recruiter, Admin, or Owner permissions.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Basic Info */}
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                1. Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Job Title *
                  </label>
                  <Input
                    placeholder="e.g. Senior AI/ML Engineer"
                    required
                    disabled={isSubmitting || !isAuthorized}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Department *
                    </label>
                    <Input
                      placeholder="e.g. Engineering"
                      required
                      disabled={isSubmitting || !isAuthorized}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Location *
                    </label>
                    <Input
                      placeholder="e.g. San Francisco, CA / Remote"
                      required
                      disabled={isSubmitting || !isAuthorized}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Employment Type *
                    </label>
                    <Select
                      value={employmentType}
                      disabled={isSubmitting || !isAuthorized}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      options={[
                        { value: "full_time", label: "Full-Time" },
                        { value: "part_time", label: "Part-Time" },
                        { value: "contract", label: "Contract" },
                        { value: "internship", label: "Internship" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Workplace Mode *
                    </label>
                    <Select
                      value={workplaceType}
                      disabled={isSubmitting || !isAuthorized}
                      onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                      options={[
                        { value: "hybrid", label: "Hybrid" },
                        { value: "remote", label: "Remote" },
                        { value: "on_site", label: "On-Site" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Initial Status *
                    </label>
                    <Select
                      value={status}
                      disabled={isSubmitting || !isAuthorized}
                      onChange={(e) => setStatus(e.target.value as JobStatus)}
                      options={[
                        { value: "draft", label: "Draft (Saved internally)" },
                        { value: "active", label: "Active (Published immediately)" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Job Description & Requirements */}
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                2. Job Description &amp; Hiring Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Job Overview &amp; Responsibilities
                  </label>
                  <Textarea
                    rows={6}
                    disabled={isSubmitting || !isAuthorized}
                    placeholder="Enter comprehensive overview, team context, core expectations, and daily responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Target Skills &amp; Hiring Qualifications
                  </label>
                  <Textarea
                    rows={5}
                    disabled={isSubmitting || !isAuthorized}
                    placeholder="List required technical skills, experience benchmarks, education, or preferred certifications..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: AI Readiness Context Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Job Intelligence Preparation
                  </h3>
                </div>
                <Badge variant="ai" className="text-[10px]">
                  Production Database
                </Badge>
              </div>

              <div className="space-y-3 text-xs text-[#A7AFBC]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tenant Context Bound:</strong> Job records will be bound to {organization?.name || "your organization"}.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Candidate Alignment Ready:</strong> Descriptions and qualifications will serve as primary benchmarks for future candidate matching.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Row Level Security Guard:</strong> Access policies ensure only authenticated members of this organization can view or process applications for this role.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </ApplicationShell>
  );
}
