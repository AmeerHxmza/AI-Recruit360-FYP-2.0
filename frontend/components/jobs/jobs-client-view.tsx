"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
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
import { EmploymentType, JobStatus, OrganizationRole, WorkplaceType } from "@/types/database.types";
import {
  Plus,
  Search,
  Briefcase,
  ExternalLink,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  FilterX,
} from "lucide-react";

interface JobsClientViewProps {
  initialJobs: Job[];
  role: OrganizationRole;
  orgName: string;
}

export function JobsClientView({ initialJobs, role, orgName }: JobsClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageJobs(role);

  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<JobStatus | "all">("all");
  const [employmentFilter, setEmploymentFilter] = React.useState<EmploymentType | "all">("all");
  const [workplaceFilter, setWorkplaceFilter] = React.useState<WorkplaceType | "all">("all");

  const loadJobs = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getJobsAction({
      status: statusFilter,
      employment_type: employmentFilter,
      workplace_type: workplaceFilter,
      search: searchQuery,
    });

    if (res.success && res.data) {
      setJobs(res.data);
    } else {
      setErrorMsg(res.error || "Unable to fetch job positions.");
    }
    setLoading(false);
  }, [statusFilter, employmentFilter, workplaceFilter, searchQuery]);

  // Refetch ONLY when user explicitly changes search query or dropdown filters
  const prevSearchRef = React.useRef(searchQuery);
  const prevStatusRef = React.useRef(statusFilter);
  const prevEmploymentRef = React.useRef(employmentFilter);
  const prevWorkplaceRef = React.useRef(workplaceFilter);

  React.useEffect(() => {
    const searchChanged = prevSearchRef.current !== searchQuery;
    const statusChanged = prevStatusRef.current !== statusFilter;
    const employmentChanged = prevEmploymentRef.current !== employmentFilter;
    const workplaceChanged = prevWorkplaceRef.current !== workplaceFilter;

    prevSearchRef.current = searchQuery;
    prevStatusRef.current = statusFilter;
    prevEmploymentRef.current = employmentFilter;
    prevWorkplaceRef.current = workplaceFilter;

    if (searchChanged || statusChanged || employmentChanged || workplaceChanged) {
      loadJobs();
    }
  }, [searchQuery, statusFilter, employmentFilter, workplaceFilter, loadJobs]);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="text-[11px] font-mono">Active</Badge>;
      case "draft":
        return <Badge variant="default" className="text-[11px] font-mono">Draft</Badge>;
      case "paused":
        return <Badge variant="warning" className="text-[11px] font-mono">Paused</Badge>;
      case "closed":
        return <Badge variant="danger" className="text-[11px] font-mono">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] font-mono">{status}</Badge>;
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
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "Jobs"]}>
      <PageHeader
        title="Jobs"
        description="Create positions, publish application links, and monitor candidate activity."
        actions={
          isAuthorizedToManage ? (
            <Button
              variant="ai"
              size="md"
              onClick={() => router.push("/jobs/new")}
              className="shadow-[0_0_16px_rgba(57,217,255,0.25)]"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create Job
            </Button>
          ) : undefined
        }
      />

      {/* Error State Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadJobs} className="text-[#FF5C67] hover:bg-[#FF5C67]/20">
            Retry
          </Button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search by job title, department, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | "all")}
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "active", label: "Active" },
                  { value: "draft", label: "Draft" },
                  { value: "paused", label: "Paused" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </div>

            {/* Employment Type Filter */}
            <div className="w-40">
              <Select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value as EmploymentType | "all")}
                options={[
                  { value: "all", label: "Type: All" },
                  { value: "full_time", label: "Full-Time" },
                  { value: "part_time", label: "Part-Time" },
                  { value: "contract", label: "Contract" },
                  { value: "internship", label: "Internship" },
                ]}
              />
            </div>

            {/* Workplace Filter */}
            <div className="w-36">
              <Select
                value={workplaceFilter}
                onChange={(e) => setWorkplaceFilter(e.target.value as WorkplaceType | "all")}
                options={[
                  { value: "all", label: "Workplace: All" },
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "on_site", label: "On-Site" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Main Content Area */}
      <Section title="Active & Historic Job Positions">
        {loading ? (
          /* Loading State Skeleton */
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Filtering jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
              {searchQuery || statusFilter !== "all" || employmentFilter !== "all" || workplaceFilter !== "all" ? (
                <FilterX className="h-7 w-7" />
              ) : (
                <Briefcase className="h-7 w-7" />
              )}
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">
                {searchQuery || statusFilter !== "all" || employmentFilter !== "all" || workplaceFilter !== "all"
                  ? "No matching positions found"
                  : "No job positions created yet"}
              </h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                {searchQuery || statusFilter !== "all" || employmentFilter !== "all" || workplaceFilter !== "all"
                  ? "Try clearing filters or search queries to view existing organization roles."
                  : "Create your organization's first role to start screening candidate profiles and scheduling interviews."}
              </p>
            </div>

            {isAuthorizedToManage && (
              <Button
                variant="ai"
                size="md"
                onClick={() => router.push("/jobs/new")}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Create First Job Position
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Job</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Department</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Location</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider text-center">Applicants</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider text-center">Qualified</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Created</TableHead>
                    <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#242932] bg-[#0D0F12] text-[#39D9FF] shrink-0">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#F5F7FA] text-xs">
                              {job.title}
                            </span>
                            <span className="text-[11px] text-[#A7AFBC] font-mono">
                              {formatEmploymentType(job.employment_type)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#A7AFBC] font-medium">{job.department}</TableCell>
                      <TableCell className="text-xs text-[#A7AFBC]">{job.location}</TableCell>
                      <TableCell className="text-xs text-[#A7AFBC]">
                        <span className="rounded bg-[#0D0F12] px-2 py-0.5 border border-[#242932] text-[11px] font-mono">
                          {formatEmploymentType(job.employment_type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#F5F7FA] font-bold text-center">
                        {job.applicantsCount ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-[#35D07F] font-bold text-center">
                        {job.qualifiedCount ?? 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-xs text-[#68717E] font-mono">{formatDate(job.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-[#39D9FF] hover:text-[#63E3FF] hover:bg-[#39D9FF]/10"
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
                  className="p-4 rounded-xl border border-[#242932] bg-[#12151A] space-y-3 cursor-pointer hover:border-[#39D9FF]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#F5F7FA] font-display">{job.title}</h4>
                      <p className="text-xs text-[#A7AFBC]">{job.department}</p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A7AFBC] border-t border-[#242932] pt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#68717E]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-[#68717E]" />
                      <span>{formatWorkplaceType(job.workplace_type)}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto font-mono text-[11px] text-[#68717E]">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>
    </ApplicationShell>
  );
}
