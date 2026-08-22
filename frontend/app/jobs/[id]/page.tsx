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
import { Job } from "@/lib/services/job-service";
import { EmploymentType, JobStatus, WorkplaceType } from "@/types/database.types";
import {
  ArrowLeft,
  Edit3,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  PlayCircle,
  PauseCircle,
  XCircle,
  X,
  Save,
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
    getJobByIdAction(jobId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setErrorMsg(res.error || "Job position not found or access denied.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

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

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="text-xs font-mono">Active</Badge>;
      case "draft":
        return <Badge variant="default" className="text-xs font-mono">Draft</Badge>;
      case "paused":
        return <Badge variant="warning" className="text-xs font-mono">Paused</Badge>;
      case "closed":
        return <Badge variant="danger" className="text-xs font-mono">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs font-mono">{status}</Badge>;
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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Jobs", "Loading..."]}>
        <div className="p-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading job details from database...</p>
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
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Jobs Directory
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
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs Directory
          </button>
        }
        actions={
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={openEditModal}>
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Details
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
                  Activate Job
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
                    Pause Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange("closed")}
                    className="border-[#FF5C67]/40 text-[#FF5C67] hover:bg-[#FF5C67]/10"
                  >
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <XCircle className="h-3.5 w-3.5 mr-1.5" />}
                    Close Role
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
                    Close Role
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
                  Re-Open Role
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Description & Specifications */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Role Description Overview
              </h3>
              <span className="text-[11px] font-mono text-[#68717E]">
                ID: {job.id}
              </span>
            </div>

            <div className="prose prose-invert text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line">
              {job.description || "No overview description provided for this job position."}
            </div>

            <div className="pt-4 border-t border-[#1C2027] space-y-2">
              <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Hiring Requirements &amp; Qualifications
              </h4>
              <div className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line bg-[#0D0F12] p-4 rounded-xl border border-[#242932]/80 font-sans">
                {job.requirements || "No specific qualifications listed."}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Metadata & System Information */}
        <div className="lg:col-span-4 space-y-6">
          {/* Public Application Link Core Feature Box */}
          <Card elevated className="p-5 border-[#39D9FF]/40 bg-[#171B21] space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Public Application Link
                </h3>
              </div>
              <Badge variant="ai" className="text-[10px]">
                Candidate Portal
              </Badge>
            </div>

            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Share this public link with candidates to allow them to submit CV applications, complete the timed MCQ assessment, and take the AI interview.
            </p>

            <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#242932] flex items-center justify-between text-xs font-mono text-[#39D9FF] truncate">
              <span className="truncate">/apply/{job.id}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ai"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/apply/${job.id}`);
                  alert("Public application link copied to clipboard!");
                }}
              >
                Copy Public Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => router.push(`/apply/${job.id}`)}
              >
                Open Application
              </Button>
            </div>
          </Card>

          <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Position Metadata
            </h3>

            <div className="space-y-3 text-xs text-[#A7AFBC]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#39D9FF]" />
                  <span>Employment</span>
                </span>
                <span className="font-semibold text-[#F5F7FA] font-mono">{formatEmploymentType(job.employment_type)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#35D07F]" />
                  <span>Workplace</span>
                </span>
                <span className="font-semibold text-[#F5F7FA] font-mono">{formatWorkplaceType(job.workplace_type)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#F5B942]" />
                  <span>Location</span>
                </span>
                <span className="font-semibold text-[#F5F7FA]">{job.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#68717E]" />
                  <span>Created Date</span>
                </span>
                <span className="font-mono text-[#68717E]">{formatDate(job.created_at)}</span>
              </div>

              {job.closed_at && (
                <div className="flex items-center justify-between text-[#FF5C67]">
                  <span className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Closed Date</span>
                  </span>
                  <span className="font-mono">{formatDate(job.closed_at)}</span>
                </div>
              )}
            </div>
          </Card>
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
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Edit Job Position</h3>
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
                <label className="text-xs font-semibold text-[#A7AFBC]">Job Description</label>
                <Textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Job overview..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Requirements &amp; Qualifications</label>
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
