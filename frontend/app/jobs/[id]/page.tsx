"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/providers/auth-provider";
import { canManageJobs } from "@/lib/auth/permissions";
import { getJobByIdAction, updateJobAction, updateJobStatusAction } from "@/app/actions/jobs";
import { getApplicationsAction } from "@/app/actions/applications";
import { Job } from "@/lib/services/job-service";
import { EmploymentType, JobStatus, WorkplaceType } from "@/types/database.types";
import { analyzeJobDescriptionAction } from "@/app/actions/ai";
import { JobAnalysis } from "@/lib/ai/schemas/job-analysis-schema";
import {
  ArrowLeft,
  Edit3,
  Sparkles,
  Loader2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  X,
  Save,
  Copy,
  ExternalLink
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "";

  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageJobs(role);

  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = React.useState<boolean>(false);
  
  // Pipeline Stats
  const [pipelineStats, setPipelineStats] = React.useState({
    applied: 0,
    screening: 0,
    assessment: 0,
    interview: 0,
    evaluation: 0,
    shortlisted: 0,
    knockedOut: 0,
  });

  // AI Analysis Data
  const [jobAnalysis, setJobAnalysis] = React.useState<JobAnalysis | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDepartment, setEditDepartment] = React.useState("");
  const [editLocation, setEditLocation] = React.useState("");
  const [editEmploymentType, setEditEmploymentType] = React.useState<EmploymentType>("full_time");
  const [editWorkplaceType, setEditWorkplaceType] = React.useState<WorkplaceType>("hybrid");
  const [editDescription, setEditDescription] = React.useState("");
  const [editRequirements, setEditRequirements] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [editErrorMsg, setEditErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    
    Promise.all([
      getJobByIdAction(jobId),
      getApplicationsAction()
    ]).then(([jobRes, appsRes]) => {
      if (!isMounted) return;
      
      if (jobRes.success && jobRes.data) {
        setJob(jobRes.data);
        
        // Calculate pipeline from raw apps
        if (appsRes.success && appsRes.data) {
          const jobApps = appsRes.data.filter(a => a.job_id === jobRes.data!.id);
          const stats = {
            applied: jobApps.filter(a => a.status === "applied").length,
            screening: jobApps.filter(a => a.status === "screening").length,
            assessment: jobApps.filter(a => a.status === "assessment").length,
            interview: jobApps.filter(a => a.status === "interview").length,
            evaluation: jobApps.filter(a => a.status === "evaluation").length,
            shortlisted: jobApps.filter(a => a.status === "shortlisted").length,
            knockedOut: jobApps.filter(a => a.status === "knocked_out").length,
          };
          setPipelineStats(stats);
        }
      } else {
        setErrorMsg(jobRes.error || "Job position not found or access denied.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [jobId]);
  
  // Try to load AI analysis once job is loaded
  React.useEffect(() => {
    if (!job || jobAnalysis || analyzing) return;
    
    const fetchAnalysis = async () => {
      setAnalyzing(true);
      const res = await analyzeJobDescriptionAction({
        title: job.title,
        description: job.description || "Not provided",
        requirements: job.requirements || "Not provided"
      });
      if (res.success && res.analysis) {
        setJobAnalysis(res.analysis);
      }
      setAnalyzing(false);
    };
    
    fetchAnalysis();
  }, [job, jobAnalysis, analyzing]);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job || !isAuthorizedToManage) return;
    setStatusUpdating(true);
    setErrorMsg(null);

    const res = await updateJobStatusAction(job.id, newStatus);
    if (res.success && res.data) {
      setJob(res.data);
    } else {
      setErrorMsg(res.error || "Failed to update job status.");
    }
    setStatusUpdating(false);
  };

  const openEditModal = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditDepartment(job.department || "");
    setEditLocation(job.location || "");
    setEditEmploymentType(job.employment_type || "full_time");
    setEditWorkplaceType(job.workplace_type || "hybrid");
    setEditDescription(job.description || "");
    setEditRequirements(job.requirements || "");
    setEditErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !isAuthorizedToManage) return;
    setEditErrorMsg(null);

    if (!editTitle.trim() || !editDepartment.trim() || !editLocation.trim()) {
      setEditErrorMsg("Title, Department, and Location are required fields.");
      return;
    }

    setEditSubmitting(true);

    const res = await updateJobAction(job.id, {
      title: editTitle.trim(),
      department: editDepartment.trim(),
      location: editLocation.trim(),
      employment_type: editEmploymentType,
      workplace_type: editWorkplaceType,
      description: editDescription.trim() || undefined,
      requirements: editRequirements.trim() || undefined,
    });

    if (res.success && res.data) {
      setJob(res.data);
      setIsEditModalOpen(false);
    } else {
      setEditErrorMsg(res.error || "Failed to save changes.");
    }
    setEditSubmitting(false);
  };

  const handleCopyLink = () => {
    if (!job) return;
    const url = `${window.location.origin}/apply/${job.slug || job.id}`;
    navigator.clipboard.writeText(url);
    alert("Application link copied to clipboard!");
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "active": return <Badge variant="success" className="text-xs font-mono">Active</Badge>;
      case "draft": return <Badge variant="default" className="text-xs font-mono">Draft</Badge>;
      case "paused": return <Badge variant="warning" className="text-xs font-mono">Paused</Badge>;
      case "closed": return <Badge variant="danger" className="text-xs font-mono">Closed</Badge>;
      default: return <Badge variant="outline" className="text-xs font-mono">{status}</Badge>;
    }
  };

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

  if (loading) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", "Loading..."]}>
        <div className="p-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading job details...</p>
        </div>
      </ApplicationShell>
    );
  }

  if (errorMsg || !job) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", "Not Found"]}>
        <div className="p-12 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F7FA]">Position Not Found</h3>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {errorMsg || "The requested job position record does not exist or you do not have permission to view it."}
          </p>
          <Button variant="secondary" size="md" onClick={() => router.push("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Jobs
          </Button>
        </div>
      </ApplicationShell>
    );
  }

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", job.title]}>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.location} · ${formatWorkplaceType(job.workplace_type)} · ${formatEmploymentType(job.employment_type)}`}
        badge={getStatusBadge(job.status)}
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs
          </button>
        }
        actions={
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="border-[#39D9FF]/30 text-[#39D9FF] hover:bg-[#39D9FF]/10 text-xs"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Application Link
              </Button>

              <Button variant="secondary" size="sm" onClick={openEditModal}>
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>

              {/* Status Action Transitions */}
              {job.status === "draft" && (
                <Button
                  variant="ai"
                  size="sm"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange("active")}
                >
                  {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <PlayCircle className="h-3.5 w-3.5 mr-1.5" />}
                  Publish
                </Button>
              )}

              {job.status === "active" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange("paused")}
                    className="border-[#F5B942]/40 text-[#F5B942] hover:bg-[#F5B942]/10"
                  >
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <PauseCircle className="h-3.5 w-3.5 mr-1.5" />}
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange("closed")}
                    className="border-[#FF5C67]/40 text-[#FF5C67] hover:bg-[#FF5C67]/10"
                  >
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <XCircle className="h-3.5 w-3.5 mr-1.5" />}
                    Close
                  </Button>
                </>
              )}

              {job.status === "paused" && (
                <>
                  <Button
                    variant="ai"
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange("active")}
                  >
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <PlayCircle className="h-3.5 w-3.5 mr-1.5" />}
                    Re-Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange("closed")}
                    className="border-[#FF5C67]/40 text-[#FF5C67] hover:bg-[#FF5C67]/10"
                  >
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <XCircle className="h-3.5 w-3.5 mr-1.5" />}
                    Close
                  </Button>
                </>
              )}

              {job.status === "closed" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange("active")}
                  className="border-[#39D9FF]/40 text-[#39D9FF] hover:bg-[#39D9FF]/10"
                >
                  {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <PlayCircle className="h-3.5 w-3.5 mr-1.5" />}
                  Re-Open
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="space-y-6">
        
        {/* Candidate Pipeline Horizontal Funnel */}
        <Card className="p-6 border-[#242932] bg-[#12151A] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#F5F7FA] font-display">Candidate Pipeline</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            {[
              { label: "Applied", count: pipelineStats.applied, color: "#39D9FF" },
              { label: "Screening", count: pipelineStats.screening, color: "#63E3FF" },
              { label: "Assessment", count: pipelineStats.assessment, color: "#F5B942" },
              { label: "Interview", count: pipelineStats.interview, color: "#35D07F" },
              { label: "Evaluated", count: pipelineStats.evaluation, color: "#A7AFBC" },
              { label: "Shortlisted", count: pipelineStats.shortlisted, color: "#00E5A3" },
              { label: "Knocked Out", count: pipelineStats.knockedOut, color: "#FF5C67" },
            ].map((stage, idx) => (
              <div key={idx} className="flex-1 flex flex-col p-4 rounded-xl border border-[#1C2027] bg-[#0D0F12] relative overflow-hidden group hover:border-[#242932] transition-colors">
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-80" 
                  style={{ backgroundColor: stage.color }} 
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7AFBC] mb-2 z-10">{stage.label}</span>
                <span className="text-2xl font-bold font-display text-[#F5F7FA] z-10">{stage.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Job Description & Specifications */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Description
                </h3>
              </div>
              <div className="prose prose-invert text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line">
                {job.description || "No description provided."}
              </div>

              <div className="pt-4 border-t border-[#1C2027] space-y-2">
                <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Requirements
                </h4>
                <div className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line font-sans">
                  {job.requirements || "No specific qualifications listed."}
                </div>
              </div>
            </Card>
            
            {/* AI Job Analysis */}
            {jobAnalysis && (
              <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
                <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                    <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                      AI Job Analysis
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
                    <h4 className="text-sm font-bold text-[#F5F7FA] font-display">Experience & Education</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Minimum Experience:</span>
                        <span className="font-mono text-[#F5F7FA]">{jobAnalysis.experience.minimum_years ?? 0} years</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Preferred Experience:</span>
                        <span className="font-mono text-[#F5F7FA]">{jobAnalysis.experience.preferred_years ?? jobAnalysis.experience.minimum_years ?? 0} years</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-[#0D0F12] border border-[#1C2027]">
                        <span className="text-[#A7AFBC]">Degree Required:</span>
                        <span className="font-mono text-[#F5F7FA]">{jobAnalysis.education.required ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Link & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card elevated className="p-5 border-[#39D9FF]/40 bg-[#171B21] space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Application Link
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                Share this link with candidates to allow them to apply.
              </p>

              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#242932] flex items-center justify-between text-xs font-mono text-[#39D9FF] truncate">
                <span className="truncate">/apply/{job.slug || job.id}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button variant="ai" size="sm" className="w-full text-xs" onClick={handleCopyLink}>
                  Copy Link
                </Button>
                <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => window.open(`/apply/${job.slug || job.id}`, "_blank")}>
                  Open <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </Card>

            <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                Application Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#1C2027] text-center">
                  <div className="text-xl font-bold text-[#F5F7FA]">{pipelineStats.applied}</div>
                  <div className="text-[10px] text-[#A7AFBC] uppercase tracking-wider">Total Applicants</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#1C2027] text-center">
                  <div className="text-xl font-bold text-[#35D07F]">
                    {pipelineStats.assessment + pipelineStats.interview + pipelineStats.evaluation + pipelineStats.shortlisted}
                  </div>
                  <div className="text-[10px] text-[#A7AFBC] uppercase tracking-wider">Qualified</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Job Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-2xl rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Edit Job</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 text-xs text-[#FF5C67] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Job Title *</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Senior AI Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Department *</label>
                  <Input
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Engineering"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Location *</label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Employment Type *</label>
                  <Select
                    value={editEmploymentType}
                    onChange={(e) => setEditEmploymentType(e.target.value as EmploymentType)}
                    options={[
                      { value: "full_time", label: "Full-Time" },
                      { value: "part_time", label: "Part-Time" },
                      { value: "contract", label: "Contract" },
                      { value: "internship", label: "Internship" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Workplace Mode *</label>
                  <Select
                    value={editWorkplaceType}
                    onChange={(e) => setEditWorkplaceType(e.target.value as WorkplaceType)}
                    options={[
                      { value: "hybrid", label: "Hybrid" },
                      { value: "remote", label: "Remote" },
                      { value: "on_site", label: "On-Site" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Description</label>
                <Textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Job overview..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Requirements</label>
                <Textarea
                  rows={4}
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  placeholder="Qualifications list..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" disabled={editSubmitting}>
                  {editSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}
