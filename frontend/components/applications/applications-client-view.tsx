"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { canManageApplications } from "@/lib/auth/permissions";
import {
  getApplicationsAction,
  createApplicationAction,
  updateApplicationStatusAction,
} from "@/app/actions/applications";
import { getCandidatesAction } from "@/app/actions/candidates";
import { getJobsAction } from "@/app/actions/jobs";
import { ApplicationItemWithDetails } from "@/lib/services/application-service";
import { exportJobCandidatesToCsv } from "@/lib/utils/export-csv";
import { Candidate } from "@/lib/services/candidate-service";
import { Job } from "@/lib/services/job-service";
import { ApplicationStatus, OrganizationRole } from "@/types/database.types";
import {
  Search,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  Briefcase,
  UserCheck,
  X,
  Sparkles,
  Download,
} from "lucide-react";

interface ApplicationsClientViewProps {
  initialApplications: ApplicationItemWithDetails[];
  role: OrganizationRole;
  orgName: string;
}

export function ApplicationsClientView({
  initialApplications,
  role,
  orgName,
}: ApplicationsClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageApplications(role);

  const [applications, setApplications] = React.useState<ApplicationItemWithDetails[]>(initialApplications);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [stageFilter, setStageFilter] = React.useState<string>("All");
  const [jobFilter, setJobFilter] = React.useState<string>("All");

  // Derive unique job titles for single-job dropdown filtering & CSV export
  const uniqueJobs = React.useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.jobTitle) set.add(app.jobTitle);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered applications list
  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      if (jobFilter !== "All" && app.jobTitle !== jobFilter) return false;
      return true;
    });
  }, [applications, jobFilter]);

  const handleExportFilteredJobCsv = () => {
    if (jobFilter === "All") return;
    const targetJobApps = applications.filter((app) => app.jobTitle === jobFilter);
    exportJobCandidatesToCsv(jobFilter, targetJobApps);
  };

  // Modal State for New Application
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [candidateList, setCandidateList] = React.useState<Candidate[]>([]);
  const [jobList, setJobList] = React.useState<Job[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = React.useState("");
  const [selectedJobId, setSelectedJobId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalErrorMsg, setModalErrorMsg] = React.useState<string | null>(null);

  // Updating Status State
  const [updatingAppId, setUpdatingAppId] = React.useState<string | null>(null);

  const loadApplications = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getApplicationsAction({ stage: stageFilter, search: searchQuery });

    if (res.success && res.data) {
      setApplications(res.data);
    } else {
      setErrorMsg(res.error || "Failed to load pipeline applications.");
    }
    setLoading(false);
  }, [stageFilter, searchQuery]);

  // Refetch ONLY when user explicitly changes search query or stage filter
  const prevSearchRef = React.useRef(searchQuery);
  const prevStageRef = React.useRef(stageFilter);

  React.useEffect(() => {
    const searchChanged = prevSearchRef.current !== searchQuery;
    const stageChanged = prevStageRef.current !== stageFilter;

    prevSearchRef.current = searchQuery;
    prevStageRef.current = stageFilter;

    if (searchChanged || stageChanged) {
      loadApplications();
    }
  }, [searchQuery, stageFilter, loadApplications]);

  const openAddModal = async () => {
    setModalErrorMsg(null);
    setIsAddModalOpen(true);

    const [candRes, jobRes] = await Promise.all([
      getCandidatesAction(),
      getJobsAction(),
    ]);

    if (candRes.success && candRes.data) {
      setCandidateList(candRes.data.data);
      if (candRes.data.data.length > 0) setSelectedCandidateId(candRes.data.data[0].id);
    }

    if (jobRes.success && jobRes.data) {
      setJobList(jobRes.data);
      if (jobRes.data.length > 0) setSelectedJobId(jobRes.data[0].id);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg(null);

    if (!selectedCandidateId || !selectedJobId) {
      setModalErrorMsg("Please select both a candidate and a target job position.");
      return;
    }

    setIsSubmitting(true);

    const res = await createApplicationAction({
      candidate_id: selectedCandidateId,
      job_id: selectedJobId,
    });

    if (res.success && res.data) {
      setIsAddModalOpen(false);
      loadApplications();
    } else {
      setModalErrorMsg(res.error || "Failed to submit job application.");
    }
    setIsSubmitting(false);
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingAppId(appId);
    const res = await updateApplicationStatusAction(appId, newStatus);
    if (res.success) {
      loadApplications();
    } else {
      setErrorMsg(res.error || "Failed to update pipeline stage.");
    }
    setUpdatingAppId(null);
  };

  const getStageBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "shortlisted":
        return <Badge variant="success" className="text-[11px] font-medium uppercase">Shortlisted</Badge>;
      case "interview":
        return <Badge variant="ai" className="text-[11px] font-medium uppercase">Interview</Badge>;
      case "screening":
        return <Badge variant="warning" className="text-[11px] font-medium uppercase">Screening</Badge>;
      case "evaluation":
        return <Badge variant="ai" className="text-[11px] font-medium uppercase">Evaluation</Badge>;
      case "rejected":
        return <Badge variant="danger" className="text-[11px] font-medium uppercase">Rejected</Badge>;
      case "hired":
        return <Badge variant="success" className="text-[11px] font-medium uppercase">Hired</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] uppercase">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "Applications"]}>
      <PageHeader
        title="Pipeline Applications"
        description="Track and manage candidates through each stage of the AI recruitment lifecycle."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Multi-Tenant Pipeline
          </Badge>
        }
        actions={
          isAuthorizedToManage ? (
            <Button variant="ai" size="md" onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-1.5" /> Submit Application
            </Button>
          ) : undefined
        }
      />

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadApplications} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search applications by candidate name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                options={[
                  { value: "All", label: "Job: All Positions" },
                  ...uniqueJobs.map((j) => ({ value: j, label: j })),
                ]}
              />
            </div>
            <div className="w-44">
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                options={[
                  { value: "All", label: "Stage: All Stages" },
                  { value: "Applied", label: "Applied" },
                  { value: "Screening", label: "Screening" },
                  { value: "Interview", label: "Interview" },
                  { value: "Evaluation", label: "Evaluation" },
                  { value: "Shortlisted", label: "Shortlisted" },
                  { value: "Rejected", label: "Rejected" },
                  { value: "Hired", label: "Hired" },
                ]}
              />
            </div>
            {jobFilter !== "All" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFilteredJobCsv}
                className="border-[#39D9FF]/40 text-[#39D9FF] hover:bg-[#39D9FF]/10 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export {jobFilter} CSV
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Pipeline Applications Table */}
      <Section title="Active Applications Lifecycle">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Filtering applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
              <Briefcase className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">
                {searchQuery || jobFilter !== "All" ? "No matching applications" : "No pipeline applications yet"}
              </h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                {searchQuery || jobFilter !== "All"
                  ? "Try clearing filters to view all workspace candidate applications."
                  : "Submit your first candidate application to begin tracking pipeline stages."}
              </p>
            </div>
            {isAuthorizedToManage && (
              <Button variant="ai" size="md" onClick={openAddModal} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Submit First Application
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Job Position</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Pipeline Stage</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Evaluation</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Applied Date</TableHead>
                  <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    onClick={() => router.push(`/candidates/${app.candidate_id}`)}
                    className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={getInitials(app.candidateName)} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#F5F7FA] text-xs">
                            {app.candidateName}
                          </span>
                          <span className="text-[11px] text-[#A7AFBC]">
                            {app.candidateEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#F5F7FA] font-medium">
                      {app.jobTitle}
                      <span className="block text-[10px] text-[#68717E]">{app.jobDepartment}</span>
                    </TableCell>
                    <TableCell>{getStageBadge(app.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] text-[#A7AFBC] border-[#242932]">
                        Pending Analysis
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#A7AFBC] font-mono">{formatDate(app.applied_at)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {isAuthorizedToManage && (
                          <div className="w-32">
                            <Select
                              value={app.status}
                              disabled={updatingAppId === app.id}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                              options={[
                                { value: "applied", label: "Applied" },
                                { value: "screening", label: "Screening" },
                                { value: "interview", label: "Interview" },
                                { value: "evaluation", label: "Evaluation" },
                                { value: "shortlisted", label: "Shortlisted" },
                                { value: "rejected", label: "Rejected" },
                                { value: "hired", label: "Hired" },
                              ]}
                            />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/candidates/${app.candidate_id}`)}
                          className="h-7 w-7 text-[#A7AFBC] hover:text-[#39D9FF]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      {/* Add Application Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-lg rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA]">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#39D9FF]" />
                <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Submit New Application</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalErrorMsg && (
              <div className="p-3 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 text-xs text-[#FF5C67] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Select Candidate *</label>
                {candidateList.length === 0 ? (
                  <p className="text-xs text-[#FF5C67]">
                    No candidate records found. Please add a candidate first.
                  </p>
                ) : (
                  <Select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    options={candidateList.map((c) => ({
                      value: c.id,
                      label: `${c.full_name} (${c.email})`,
                    }))}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Target Job Position *</label>
                {jobList.length === 0 ? (
                  <p className="text-xs text-[#FF5C67]">
                    No active job positions found. Please create a job position first.
                  </p>
                ) : (
                  <Select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    options={jobList.map((j) => ({
                      value: j.id,
                      label: `${j.title} (${j.department})`,
                    }))}
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="ai"
                  size="sm"
                  disabled={isSubmitting || candidateList.length === 0 || jobList.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}
