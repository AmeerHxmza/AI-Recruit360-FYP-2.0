"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { canManageJobs } from "@/lib/auth/permissions";
import { getJobsAction } from "@/app/actions/jobs";
import { Job } from "@/lib/services/job-service";
import {
  EmploymentType,
  JobStatus,
  OrganizationRole,
  WorkplaceType,
} from "@/types/database.types";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  MapPin,
  FilterX,
  Copy,
  Check,
} from "lucide-react";

interface JobsClientViewProps {
  initialJobs: Job[];
  role: OrganizationRole;
}

export function JobsClientView({ initialJobs, role }: JobsClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageJobs(role);

  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [copiedJobId, setCopiedJobId] = React.useState<string | null>(null);

  const handleCopyLink = async (
    e: React.MouseEvent,
    slugOrId: string,
    id: string,
  ) => {
    e.stopPropagation();
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://ai-recruit360.vercel.app";
    const url = `${baseUrl}/apply/${slugOrId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedJobId(id);
      setTimeout(() => setCopiedJobId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<JobStatus | "all">(
    "all",
  );
  const [employmentFilter, setEmploymentFilter] = React.useState<
    EmploymentType | "all"
  >("all");
  const [workplaceFilter, setWorkplaceFilter] = React.useState<
    WorkplaceType | "all"
  >("all");

  const requestVersion = React.useRef(0);
  const loadJobs = React.useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await getJobsAction({
        status: statusFilter,
        employment_type: employmentFilter,
        workplace_type: workplaceFilter,
        search: searchQuery,
      });

      if (version !== requestVersion.current) return;
      if (res.success && res.data) {
        setJobs(res.data);
      } else {
        setErrorMsg(res.error || "Unable to fetch job positions.");
      }
    } catch {
      if (version === requestVersion.current)
        setErrorMsg("Could not load jobs. Please retry.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [statusFilter, employmentFilter, workplaceFilter, searchQuery]);

  // Refetch ONLY when user explicitly changes search query or dropdown filters
  const prevSearchRef = React.useRef(searchQuery);
  const prevStatusRef = React.useRef(statusFilter);
  const prevEmploymentRef = React.useRef(employmentFilter);
  const prevWorkplaceRef = React.useRef(workplaceFilter);

  React.useEffect(() => {
    const versionRef = requestVersion;
    const searchChanged = prevSearchRef.current !== searchQuery;
    const statusChanged = prevStatusRef.current !== statusFilter;
    const employmentChanged = prevEmploymentRef.current !== employmentFilter;
    const workplaceChanged = prevWorkplaceRef.current !== workplaceFilter;

    prevSearchRef.current = searchQuery;
    prevStatusRef.current = statusFilter;
    prevEmploymentRef.current = employmentFilter;
    prevWorkplaceRef.current = workplaceFilter;

    if (
      searchChanged ||
      statusChanged ||
      employmentChanged ||
      workplaceChanged
    ) {
      const timer = setTimeout(() => void loadJobs(), 300);
      return () => {
        clearTimeout(timer);
        ++versionRef.current;
      };
    }
  }, [searchQuery, statusFilter, employmentFilter, workplaceFilter, loadJobs]);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "closed":
        return <Badge variant="danger">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage open roles, public application gateways, and screening thresholds."
        actions={
          isAuthorizedToManage ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/jobs/new")}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create job
            </Button>
          ) : undefined
        }
      />

      {/* Error State Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-between text-xs text-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadJobs}
            className="text-danger hover:bg-danger/20"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Section className="my-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search by job title, department, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-background"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as JobStatus | "all")
                }
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "paused", label: "Paused" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </div>

            {/* Employment Type Filter */}
            <div className="w-36">
              <Select
                value={employmentFilter}
                onChange={(e) =>
                  setEmploymentFilter(e.target.value as EmploymentType | "all")
                }
                options={[
                  { value: "all", label: "All types" },
                  { value: "full_time", label: "Full-Time" },
                  { value: "part_time", label: "Part-Time" },
                  { value: "contract", label: "Contract" },
                  { value: "internship", label: "Internship" },
                ]}
              />
            </div>

            {/* Workplace Type Filter */}
            <div className="w-36">
              <Select
                value={workplaceFilter}
                onChange={(e) =>
                  setWorkplaceFilter(e.target.value as WorkplaceType | "all")
                }
                options={[
                  { value: "all", label: "All locations" },
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "on_site", label: "On-Site" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Main Jobs Listing */}
      <Section className="my-0">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
            <Loader2 className="h-6 w-6 animate-spin text-action-blue" />
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-xl border border-border bg-surface space-y-4">
            <div className="h-12 w-12 rounded-xl bg-background border border-border text-text-muted mx-auto flex items-center justify-center">
              {searchQuery ||
              statusFilter !== "all" ||
              employmentFilter !== "all" ||
              workplaceFilter !== "all" ? (
                <FilterX className="h-6 w-6" />
              ) : (
                <Briefcase className="h-6 w-6" />
              )}
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-semibold text-text-primary">
                {searchQuery ||
                statusFilter !== "all" ||
                employmentFilter !== "all" ||
                workplaceFilter !== "all"
                  ? "No matching positions found"
                  : "No jobs created yet"}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {searchQuery ||
                statusFilter !== "all" ||
                employmentFilter !== "all" ||
                workplaceFilter !== "all"
                  ? "Try clearing your filters or search terms to view existing roles."
                  : "Create your first role to start receiving candidates and scheduling AI interviews."}
              </p>
            </div>

            {isAuthorizedToManage && (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push("/jobs/new")}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Create job
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background hover:bg-background">
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Role
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Department
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Location
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary text-center">
                      Applicants
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary text-center">
                      Qualified
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium text-text-secondary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-hover"
                    >
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-action-blue shrink-0">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-text-primary text-xs">
                              {job.title}
                            </span>
                            <span className="text-xs text-text-muted">
                              {formatEmploymentType(job.employment_type)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary font-medium">
                        {job.department}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {job.location}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        <span className="rounded bg-background px-2 py-0.5 border border-border text-xs">
                          {formatEmploymentType(job.employment_type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-text-primary font-medium text-center">
                        {job.applicantsCount ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-success font-medium text-center">
                        {job.qualifiedCount ?? 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {formatDate(job.created_at)}
                      </TableCell>
                      <TableCell
                        className="text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) =>
                            handleCopyLink(e, job.slug || job.id, job.id)
                          }
                          className="h-7 text-xs text-text-secondary hover:text-text-primary gap-1 px-2"
                          title="Copy public candidate application link"
                        >
                          {copiedJobId === job.id ? (
                            <>
                              <Check className="h-3 w-3 text-success" />
                              <span className="text-success font-medium text-xs">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-xs">Share</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="h-8 text-xs text-action-blue hover:text-text-secondary hover:bg-blue-500/10"
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="p-4 rounded-xl border border-border bg-surface space-y-3 cursor-pointer hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {job.title}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {job.department}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary border-t border-border pt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-text-muted" />
                      <span>{job.location}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) =>
                        handleCopyLink(e, job.slug || job.id, job.id)
                      }
                      className="h-7 text-xs text-action-blue hover:bg-blue-500/10 gap-1 px-2"
                    >
                      {copiedJobId === job.id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="text-xs">
                        {copiedJobId === job.id ? "Copied" : "Copy Link"}
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
