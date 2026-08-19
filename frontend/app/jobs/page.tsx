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
import { mockJobs, JobMockItem } from "@/lib/mock/jobs";
import { Plus, Search, Briefcase, ExternalLink } from "lucide-react";

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [deptFilter, setDeptFilter] = React.useState("All");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const matchesDept = deptFilter === "All" || job.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const getStatusBadge = (status: JobMockItem["status"]) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" className="text-[11px] font-medium">Active</Badge>;
      case "Draft":
        return <Badge variant="default" className="text-[11px] font-medium">Draft</Badge>;
      case "Paused":
        return <Badge variant="warning" className="text-[11px] font-medium">Paused</Badge>;
      case "Closed":
        return <Badge variant="danger" className="text-[11px] font-medium">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Jobs"]}>
      <PageHeader
        title="Jobs"
        description="Create and manage open recruitment positions across your hiring pipeline."
        actions={
          <Button
            variant="ai"
            size="md"
            onClick={() => router.push("/jobs/new")}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Create Job
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search jobs by title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "All", label: "Status: All" },
                  { value: "Active", label: "Active" },
                  { value: "Draft", label: "Draft" },
                  { value: "Paused", label: "Paused" },
                  { value: "Closed", label: "Closed" },
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={[
                  { value: "All", label: "Department: All" },
                  { value: "Engineering", label: "Engineering" },
                  { value: "Infrastructure", label: "Infrastructure" },
                  { value: "Data & AI", label: "Data & AI" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Jobs Table */}
      <Section title="Job Openings Directory">
        <Table className="border-[#242932] bg-[#12151A]">
          <TableHeader>
            <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Job Position</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Department</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Location</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Pipeline Breakdown</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Created</TableHead>
              <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#242932] bg-[#0D0F12] text-[#39D9FF]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#F5F7FA] text-xs">
                        {job.title}
                      </span>
                      <span className="text-[11px] text-[#A7AFBC]">
                        {job.employmentType}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[#A7AFBC] font-medium">{job.department}</TableCell>
                <TableCell className="text-xs text-[#A7AFBC]">{job.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#F5F7FA] font-bold">{job.applicantsCount} <span className="text-[10px] text-[#68717E] font-sans font-normal">App</span></span>
                    <span className="text-[#63E3FF]">{job.screeningCount} <span className="text-[10px] text-[#68717E] font-sans font-normal">Scr</span></span>
                    <span className="text-[#F5B942]">{job.interviewsCount} <span className="text-[10px] text-[#68717E] font-sans font-normal">Int</span></span>
                    <span className="text-[#35D07F] font-bold">{job.shortlistedCount} <span className="text-[10px] text-[#68717E] font-sans font-normal">Short</span></span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="text-xs text-[#68717E] font-mono">{job.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#A7AFBC] hover:text-[#39D9FF]">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </ApplicationShell>
  );
}
