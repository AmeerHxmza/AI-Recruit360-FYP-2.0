"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  updateApplicationStatusAction,
} from "@/app/actions/applications";
import { getJobsAction } from "@/app/actions/jobs";
import { ApplicationItemWithDetails } from "@/lib/services/application-service";
import { exportJobCandidatesToCsv } from "@/lib/utils/export-csv";
import { Job } from "@/lib/services/job-service";
import { ApplicationStatus, OrganizationRole } from "@/types/database.types";
import {
  Search,
  Share2,
  Copy,
  Check,
  AlertCircle,
  X,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

interface ApplicationsClientViewProps {
  initialApplications: ApplicationItemWithDetails[];
  role: OrganizationRole;
}

export function ApplicationsClientView({
  initialApplications,
  role,
}: ApplicationsClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageApplications(role);

  const [applications, setApplications] =
    React.useState<ApplicationItemWithDetails[]>(initialApplications);
  const [page, setPage] = React.useState(1);
  const requestNumber = React.useRef(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [stageFilter, setStageFilter] = React.useState<string>("All");
  const [jobFilter, setJobFilter] = React.useState<string>("All");

  // Share Job Links Modal State
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [activeJobs, setActiveJobs] = React.useState<Job[]>([]);
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  // Updating Status State for executive actions
  const [updatingAppId, setUpdatingAppId] = React.useState<string | null>(null);

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
    const targetJobApps = applications.filter(
      (app) => app.jobTitle === jobFilter,
    );
    exportJobCandidatesToCsv(jobFilter, targetJobApps);
  };

  const requestVersion = React.useRef(0);
  const loadApplications = React.useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setErrorMsg(null);

    const request = ++requestNumber.current;
    try {
      const res = await getApplicationsAction({
        stage: stageFilter,
        search: searchQuery,
        page,
        pageSize: 50,
      });
      if (request !== requestNumber.current) return;

      if (version !== requestVersion.current) return;
      if (res.success && res.data) {
        setApplications(res.data);
      } else {
        setErrorMsg(res.error || "Failed to load pipeline applications.");
      }
    } catch {
      if (version === requestVersion.current)
        setErrorMsg("Could not load applications. Please retry.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [stageFilter, searchQuery, page]);

  const previousFilters = React.useRef(
    JSON.stringify([stageFilter, searchQuery, page]),
  );
  React.useEffect(() => {
    const versionRef = requestVersion;
    const filters = JSON.stringify([stageFilter, searchQuery, page]);
    if (previousFilters.current === filters) return;
    previousFilters.current = filters;
    const timer = setTimeout(() => void loadApplications(), 300);
    return () => {
      clearTimeout(timer);
      ++versionRef.current;
    };
  }, [stageFilter, searchQuery, page, loadApplications]);

  const openShareModal = async () => {
    setIsShareModalOpen(true);
    const res = await getJobsAction();
    if (res.success && res.data) {
      setActiveJobs(
        res.data.filter((j) => j.status === "active" || j.status === "draft"),
      );
    }
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/apply/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleExecutiveDecision = async (
    appId: string,
    decision: "shortlisted" | "rejected",
  ) => {
    setUpdatingAppId(appId);
    const res = await updateApplicationStatusAction(appId, decision);
    if (res.success) {
      setSuccessMsg(`Candidate successfully marked as ${decision}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadApplications();
    } else {
      setErrorMsg(res.error || "Failed to record hiring decision.");
    }
    setUpdatingAppId(null);
  };

  // Automated pipeline stage metadata & 4-step progress computation
  const getStageInfo = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return {
          label: "Applied",
          variant: "outline" as const,
          step: 1,
          badgeClass: "bg-hover text-text-secondary border-border",
          description: "Awaiting AI screening",
        };
      case "screening":
        return {
          label: "CV Screening",
          variant: "ai" as const,
          step: 1,
          badgeClass:
            "bg-blue-500/10 text-action-blue border-blue-500/20 animate-pulse",
          description: "Resume screening in progress",
        };
      case "knocked_out":
        return {
          label: "Not advanced",
          variant: "danger" as const,
          step: 1,
          badgeClass: "bg-rose-500/10 text-danger border-rose-500/20",
          description: "Criteria not met",
        };
      case "assessment":
        return {
          label: "MCQ Assessment",
          variant: "ai" as const,
          step: 2,
          badgeClass: "bg-indigo-500/10 text-action-blue border-indigo-500/20",
          description: "Timed 10-MCQ test active",
        };
      case "assessment_failed":
        return {
          label: "Assessment Failed",
          variant: "danger" as const,
          step: 2,
          badgeClass: "bg-rose-500/10 text-danger border-rose-500/20",
          description: "Score below threshold",
        };
      case "interview":
        return {
          label: "AI Interview",
          variant: "ai" as const,
          step: 3,
          badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          description: "Interactive video session",
        };
      case "evaluation":
        return {
          label: "Evaluation Ready",
          variant: "ai" as const,
          step: 4,
          badgeClass: "bg-purple-500/10 text-action-blue border-purple-500/20",
          description: "Scorecard synthesized",
        };
      case "shortlisted":
        return {
          label: "Shortlisted",
          variant: "success" as const,
          step: 4,
          badgeClass: "bg-emerald-500/10 text-success border-emerald-500/20",
          description: "Executive approval",
        };
      case "rejected":
        return {
          label: "Not Selected",
          variant: "danger" as const,
          step: 4,
          badgeClass: "bg-rose-500/10 text-danger border-rose-500/20",
          description: "Application closed",
        };
      case "hired":
        return {
          label: "Hired",
          variant: "success" as const,
          step: 4,
          badgeClass: "bg-emerald-500/10 text-success border-emerald-500/20",
          description: "Offer accepted",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          step: 1,
          badgeClass: "bg-hover text-text-secondary border-border",
          description: "Pipeline active",
        };
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
    <div className="animate-in fade-in duration-300">
      <PageHeader
        title="Applications"
        description="Track each application, review the evidence, and record your decision."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1 text-action-blue" /> Automated
            Lifecycle
          </Badge>
        }
        actions={
          isAuthorizedToManage ? (
            <Button
              variant="ai"
              size="md"
              onClick={openShareModal}
              className="bg-action-blue hover:bg-action-blue text-primary-foreground"
            >
              <Share2 className="h-4 w-4 mr-1.5" /> Share application link
            </Button>
          ) : undefined
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-success animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadApplications}
            className="text-danger"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search applications by candidate name, email, or position..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1);
                setSearchQuery(e.target.value);
              }}
              icon={<Search className="h-4 w-4" />}
              className="bg-background border-border text-text-primary"
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
                onChange={(e) => {
                  setPage(1);
                  setStageFilter(e.target.value);
                }}
                options={[
                  { value: "All", label: "Stage: All Stages" },
                  { value: "Applied", label: "Applied" },
                  { value: "Screening", label: "CV Screening" },
                  { value: "Assessment", label: "MCQ Assessment" },
                  { value: "Interview", label: "AI Interview" },
                  { value: "Evaluation", label: "Evaluation" },
                  { value: "Shortlisted", label: "Shortlisted" },
                  { value: "Rejected", label: "Not Selected" },
                ]}
              />
            </div>
            {jobFilter !== "All" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFilteredJobCsv}
                className="border-blue-500/30 text-action-blue hover:bg-blue-500/10 text-xs"
              >
                Export visible rows
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Applications Table */}
      <Section className="my-0">
        {loading ? (
          <div className="p-12 text-center text-text-secondary border border-border rounded-2xl bg-surface">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-action-blue border-r-transparent mb-3" />
            <p className="text-xs">Synchronizing pipeline status...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-text-secondary border border-border rounded-2xl bg-surface space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-text-muted">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-primary">
                No candidate applications found
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {searchQuery || stageFilter !== "All" || jobFilter !== "All"
                  ? "Try resetting your search filters to view active candidates."
                  : "Share your public job portal links with candidates to receive applications."}
              </p>
            </div>
            {isAuthorizedToManage && (
              <Button
                variant="ai"
                size="sm"
                onClick={openShareModal}
                className="mt-2 bg-action-blue"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share Application
                Links
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Candidate
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Target Job Position
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Automated Stage
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Pipeline Progress
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Applied Date
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Decision &amp; Scorecard
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => {
                  const stageInfo = getStageInfo(app.status);
                  const isDecided =
                    app.status === "shortlisted" ||
                    app.status === "rejected" ||
                    app.status === "hired";
                  const isReadyForDecision = app.status === "evaluation";

                  return (
                    <TableRow
                      key={app.id}
                      onClick={() =>
                        router.push(
                          `/candidates/${app.candidate_id}?application=${app.id}`,
                        )
                      }
                      className="cursor-pointer border-b border-border transition-colors hover:bg-hover"
                    >
                      {/* Candidate Name & Email */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={getInitials(app.candidateName)}
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary text-xs">
                              {app.candidateName}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {app.candidateEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Job Title & Department */}
                      <TableCell className="text-xs text-text-primary font-medium">
                        {app.jobTitle}
                        <span className="block text-xs text-text-muted">
                          {app.jobDepartment}
                        </span>
                      </TableCell>

                      {/* Automated Stage Status Badge (No Manual Dropdown!) */}
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stageInfo.badgeClass}`}
                          >
                            {stageInfo.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {stageInfo.description}
                          </span>
                        </div>
                      </TableCell>

                      {/* 4-Step Stepper Progress (CV -> MCQ -> Interview -> Decision) */}
                      <TableCell>
                        <div
                          className="flex items-center gap-1.5"
                          title={`Stage ${stageInfo.step} of 4`}
                        >
                          {[1, 2, 3, 4].map((stepNum) => {
                            const isPast =
                              stageInfo.step > stepNum || isDecided;
                            const isCurrent =
                              stageInfo.step === stepNum && !isDecided;
                            const isKnocked =
                              app.status === "knocked_out" ||
                              app.status === "assessment_failed";

                            return (
                              <div
                                key={stepNum}
                                className={`h-1.5 w-6 rounded-full transition-all ${
                                  isKnocked && stageInfo.step === stepNum
                                    ? "bg-rose-500"
                                    : isPast
                                      ? "bg-success"
                                      : isCurrent
                                        ? "bg-action-blue animate-pulse"
                                        : "bg-hover"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs text-text-muted block mt-1">
                          {stageInfo.step === 1 && "1. CV Screening"}
                          {stageInfo.step === 2 && "2. Timed MCQs"}
                          {stageInfo.step === 3 && "3. AI Video Room"}
                          {stageInfo.step === 4 && "4. Evaluation"}
                        </span>
                      </TableCell>

                      {/* Applied Date */}
                      <TableCell className="text-xs text-text-secondary font-mono">
                        {formatDate(app.applied_at)}
                      </TableCell>

                      {/* Actions Column: Quick Decision & Scorecard */}
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick decision buttons if candidate is ready for human verdict */}
                          {isAuthorizedToManage && isReadyForDecision && (
                            <div className="flex items-center gap-1 mr-2">
                              <button
                                onClick={() =>
                                  handleExecutiveDecision(app.id, "shortlisted")
                                }
                                disabled={updatingAppId === app.id}
                                title="Shortlist Candidate"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-success hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleExecutiveDecision(app.id, "rejected")
                                }
                                disabled={updatingAppId === app.id}
                                title="Reject Candidate"
                                className="p-1.5 rounded-lg bg-rose-500/10 text-danger hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/candidates/${app.candidate_id}?application=${app.id}`,
                              )
                            }
                            className="text-xs text-action-blue hover:text-primary-foreground hover:bg-action-blue/10 h-7 px-2.5 flex items-center gap-1"
                          >
                            Scorecard
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <div className="flex items-center justify-between gap-4 border-t border-border py-4 text-sm">
        <span className="text-text-secondary">
          Page {page} · {filteredApplications.length} visible applications
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={loading || page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={loading || applications.length < 50}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Share Job Application Portal Links Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5 text-text-primary">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-action-blue border border-blue-500/20">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Share Candidate Application Links
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Candidates apply directly with a single CV upload.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activeJobs.length === 0 ? (
                <div className="p-6 text-center text-text-secondary text-xs">
                  No active job positions found. Create a job first to generate
                  an application portal.
                </div>
              ) : (
                activeJobs.map((j) => {
                  const isCopied = copiedSlug === j.slug;
                  return (
                    <div
                      key={j.id}
                      className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-semibold text-text-primary truncate block">
                          {j.title}
                        </span>
                        <span className="text-xs font-mono text-text-muted truncate block">
                          /apply/{j.slug}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(j.slug)}
                          className={`text-xs h-8 ${
                            isCopied
                              ? "bg-emerald-500/10 border-emerald-500/30 text-success"
                              : "border-border hover:bg-hover text-text-primary"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                            </>
                          )}
                        </Button>
                        <a
                          href={`/apply/${j.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-hover hover:bg-hover text-text-secondary hover:text-text-primary"
                          title="Open Application Portal"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsShareModalOpen(false)}
                className="bg-hover hover:bg-hover text-text-primary border-border"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
