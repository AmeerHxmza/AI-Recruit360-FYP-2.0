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
import { useAuth } from "@/providers/auth-provider";
import { canManageJobs } from "@/lib/auth/permissions";
import { createJobAction } from "@/app/actions/jobs";
import { analyzeJobDescriptionAction } from "@/app/actions/ai";
import { JobAnalysis } from "@/lib/ai/schemas/job-analysis-schema";
import { EmploymentType, WorkplaceType } from "@/types/database.types";
import { Sparkles, ArrowLeft, ArrowRight, AlertCircle, Loader2, CheckCircle2, Copy, ExternalLink, Building2, MapPin } from "lucide-react";
import { JobApplicationLinkCard } from "@/components/jobs/job-application-link-card";

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateJobPage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorized = canManageJobs(role);

  const [step, setStep] = React.useState<Step>(1);

  // Form State
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>("full_time");
  const [workplaceType, setWorkplaceType] = React.useState<WorkplaceType>("hybrid");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = React.useState<JobAnalysis | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = React.useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = React.useState<string | null>(null);
  const [createdJobSlug, setCreatedJobSlug] = React.useState<string | null>(null);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setJobAnalysis(null);

    const res = await analyzeJobDescriptionAction({
      title,
      description: description || "Not provided",
      requirements: requirements || "Not provided",
    });

    if (res.success && res.analysis) {
      setJobAnalysis(res.analysis);
      handleNext();
    } else {
      setAnalysisError(res.error || "Failed to analyze job requirements.");
    }
    setIsAnalyzing(false);
  };

  const handlePublish = async () => {
    setSubmitErrorMsg(null);
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
        status: "active",
      });

      if (res.success && res.data) {
        setCreatedJobId(res.data.id);
        setCreatedJobSlug(res.data.slug);
      } else {
        setSubmitErrorMsg(res.error || "Failed to publish job position.");
      }
    } catch {
      setSubmitErrorMsg("An unexpected error occurred while publishing the job.");
    }
    setIsSubmitting(false);
  };

  const handleCopyLink = () => {
    if (!createdJobSlug) return;
    const url = `${window.location.origin}/apply/${createdJobSlug}`;
    navigator.clipboard.writeText(url);
    alert("Application link copied to clipboard!");
  };

  // --- Step Components ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Job Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Employment Type</label>
            <Select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              options={[
                { value: "full_time", label: "Full-Time" },
                { value: "part_time", label: "Part-Time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Workplace Type</label>
            <Select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
              options={[
                { value: "remote", label: "Remote" },
                { value: "hybrid", label: "Hybrid" },
                { value: "on_site", label: "On-Site" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-[#242932]">
        <Button onClick={handleNext} disabled={!title || !department || !location}>
          Continue to Description <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Job Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Describe the role, the team, and the company..." 
          className="min-h-[250px]"
        />
      </div>
      <div className="flex justify-between pt-4 border-t border-[#242932]">
        <Button variant="secondary" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!description}>
          Continue to Requirements <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-[#A7AFBC] uppercase tracking-wider mb-2">Requirements</label>
        <Textarea 
          value={requirements} 
          onChange={(e) => setRequirements(e.target.value)} 
          placeholder="List required skills, experience, and education..." 
          className="min-h-[250px]"
        />
      </div>
      <div className="flex justify-between pt-4 border-t border-[#242932]">
        <Button variant="secondary" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <Button onClick={handleAnalyze} disabled={!requirements || isAnalyzing} variant="ai" className="shadow-[0_0_16px_rgba(57,217,255,0.25)]">
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
          Analyze Job Requirements
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {analysisError ? (
        <div className="p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#FF5C67]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm">AI Analysis Failed</span>
          </div>
          <p className="text-xs text-[#FF5C67]/80 leading-relaxed">{analysisError}</p>
          <p className="text-xs text-[#A7AFBC]">You can proceed to publish without AI-assisted extraction, or try again.</p>
        </div>
      ) : jobAnalysis ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932]">
            <h4 className="text-sm font-bold text-[#F5F7FA] font-display mb-4">Required Skills Extract</h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#FF5C67] uppercase mb-2 block">Critical</span>
                <div className="flex flex-wrap gap-2">
                  {jobAnalysis.skills.filter(s => s.importance === "critical").map((s, i) => (
                    <Badge key={i} variant="outline" className="border-[#FF5C67]/30 text-[#FF5C67] bg-[#FF5C67]/5">{s.name}</Badge>
                  ))}
                  {jobAnalysis.skills.filter(s => s.importance === "critical").length === 0 && <span className="text-xs text-[#A7AFBC]">None identified</span>}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-[#F5B942] uppercase mb-2 block">Important</span>
                <div className="flex flex-wrap gap-2">
                  {jobAnalysis.skills.filter(s => s.importance === "important").map((s, i) => (
                    <Badge key={i} variant="outline" className="border-[#F5B942]/30 text-[#F5B942] bg-[#F5B942]/5">{s.name}</Badge>
                  ))}
                  {jobAnalysis.skills.filter(s => s.importance === "important").length === 0 && <span className="text-xs text-[#A7AFBC]">None identified</span>}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-[#39D9FF] uppercase mb-2 block">Nice to Have</span>
                <div className="flex flex-wrap gap-2">
                  {jobAnalysis.skills.filter(s => s.importance === "nice_to_have").map((s, i) => (
                    <Badge key={i} variant="outline" className="border-[#39D9FF]/30 text-[#39D9FF] bg-[#39D9FF]/5">{s.name}</Badge>
                  ))}
                  {jobAnalysis.skills.filter(s => s.importance === "nice_to_have").length === 0 && <span className="text-xs text-[#A7AFBC]">None identified</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932]">
              <h4 className="text-sm font-bold text-[#F5F7FA] font-display mb-3">Experience</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A7AFBC]">Minimum:</span>
                  <span className="font-mono text-[#F5F7FA]">{jobAnalysis.experience.minimum_years ?? 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7AFBC]">Preferred:</span>
                  <span className="font-mono text-[#F5F7FA]">{jobAnalysis.experience.preferred_years ?? jobAnalysis.experience.minimum_years ?? 0} years</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932]">
              <h4 className="text-sm font-bold text-[#F5F7FA] font-display mb-3">Education</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A7AFBC]">Required:</span>
                  <span className="font-mono text-[#F5F7FA]">{jobAnalysis.education.required ? "Yes" : "No"}</span>
                </div>
                {jobAnalysis.education.degrees.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#A7AFBC]">Degrees:</span>
                    <span className="font-mono text-[#F5F7FA]">{jobAnalysis.education.degrees.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="flex justify-between pt-4 border-t border-[#242932]">
        <Button variant="secondary" onClick={() => setStep(3)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <Button onClick={handleNext}>
          Continue to Preview <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );

  const renderStep5 = () => {
    if (createdJobId && createdJobSlug) {
      return (
        <div className="py-8 text-center space-y-6 max-w-lg mx-auto">
          <div className="h-16 w-16 bg-[#35D07F]/10 border border-[#35D07F]/30 rounded-full flex items-center justify-center mx-auto mb-2 text-[#35D07F] shadow-[0_0_24px_rgba(53,208,127,0.2)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-display text-[#F5F7FA]">Position Successfully Published</h3>
            <p className="text-xs text-[#A7AFBC]">Your candidate application link is live and ready to receive applicants.</p>
          </div>
          
          <JobApplicationLinkCard slugOrId={createdJobSlug} jobTitle={title} />
          
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => router.push(`/jobs/${createdJobId}`)}>
              View Job Dashboard
            </Button>
            <Button variant="ai" size="sm" onClick={() => router.push("/jobs")}>
              Go to Jobs Directory
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#0D0F12] border border-[#242932] rounded-xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold font-display text-[#F5F7FA] mb-1">{title}</h3>
              <p className="text-sm text-[#A7AFBC]">{organization?.name || "AI-Recruit360"}</p>
            </div>
            <Badge variant="success" className="font-mono">Active Preview</Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-[#A7AFBC] pb-4 border-b border-[#1C2027]">
            <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#68717E]" />{location}</div>
            <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-[#68717E]" />{workplaceType} • {employmentType}</div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#A7AFBC] uppercase tracking-wider">Public URL</h4>
            <div className="p-3 bg-[#12151A] border border-[#242932] rounded-lg text-sm font-mono text-[#39D9FF]">
              /apply/[auto-generated-slug]
            </div>
          </div>
        </div>
        
        {submitErrorMsg && (
          <div className="p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center gap-3 text-xs text-[#FF5C67]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitErrorMsg}</span>
          </div>
        )}
        
        <div className="flex justify-between pt-4 border-t border-[#242932]">
          <Button variant="secondary" onClick={() => setStep(4)} disabled={isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <Button onClick={handlePublish} disabled={isSubmitting} variant="ai" className="shadow-[0_0_16px_rgba(57,217,255,0.25)]">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
            Publish Job
          </Button>
        </div>
      </div>
    );
  };

  if (!isAuthorized) {
    return (
      <ApplicationShell pageBreadcrumb={["Jobs", "Create Job"]}>
        <div className="p-8 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-3 mt-8 max-w-lg mx-auto">
          <AlertCircle className="h-8 w-8 text-[#FF5C67] mx-auto" />
          <h4 className="text-sm font-bold text-[#F5F7FA]">Access Denied</h4>
          <p className="text-xs text-[#A7AFBC]">
            You have read-only access in this workspace. Creation of job positions requires Recruiter, Admin, or Owner permissions.
          </p>
          <Button variant="secondary" onClick={() => router.push("/jobs")} className="mt-4">
            Return to Jobs
          </Button>
        </div>
      </ApplicationShell>
    );
  }

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", "Create Job"]}>
      <PageHeader
        title="Create Job"
        description="Configure the job listing and generate a public application link."
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs
          </button>
        }
      />
      
      <div className="max-w-3xl">
        {/* Step Indicator */}
        {!createdJobId && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  step === s 
                    ? "bg-[#39D9FF]/10 border-[#39D9FF] text-[#39D9FF]" 
                    : step > s 
                      ? "bg-[#35D07F]/10 border-[#35D07F] text-[#35D07F]" 
                      : "bg-[#12151A] border-[#242932] text-[#68717E]"
                }`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? "text-[#F5F7FA]" : "text-[#68717E]"}`}>
                  {s === 1 ? "Details" : s === 2 ? "Description" : s === 3 ? "Requirements" : s === 4 ? "Analysis" : "Publish"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="p-6 rounded-xl border border-[#242932] bg-[#12151A]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      </div>
    </ApplicationShell>
  );
}
