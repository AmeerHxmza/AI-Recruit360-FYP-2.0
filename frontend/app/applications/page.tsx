"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MatchScore } from "@/components/dashboard/match-score";
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
import { mockApplications, ApplicationMockItem } from "@/lib/mock/applications";
import { Search, ExternalLink } from "lucide-react";

export default function ApplicationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState("All");

  const filteredApps = mockApplications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "All" || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageBadge = (stage: ApplicationMockItem["stage"]) => {
    switch (stage) {
      case "Shortlisted":
        return <Badge variant="success" className="text-[11px] font-medium">Shortlisted</Badge>;
      case "Interview":
        return <Badge variant="ai" className="text-[11px] font-medium">Interview</Badge>;
      case "Screening":
        return <Badge variant="warning" className="text-[11px] font-medium">Screening</Badge>;
      case "Evaluation":
        return <Badge variant="ai" className="text-[11px] font-medium">Evaluation</Badge>;
      case "Rejected":
        return <Badge variant="danger" className="text-[11px] font-medium">Rejected</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Applications"]}>
      <PageHeader
        title="Pipeline Applications"
        description="Track and manage candidates through each stage of the AI recruitment lifecycle."
      />

      {/* Filter Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search applications by candidate or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
          <div className="flex items-center gap-3">
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
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Pipeline Applications Table */}
      <Section title="Active Applications Lifecycle">
        <Table className="border-[#242932] bg-[#12151A]">
          <TableHeader>
            <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Job Position</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Pipeline Stage</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Match Score</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Applied Date</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Last Activity</TableHead>
              <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow
                key={app.id}
                onClick={() => router.push(`/candidates/${app.candidateId}`)}
                className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={app.avatarFallback} size="sm" status="online" />
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
                <TableCell className="text-xs text-[#F5F7FA] font-medium">{app.jobTitle}</TableCell>
                <TableCell>{getStageBadge(app.stage)}</TableCell>
                <TableCell>
                  <MatchScore score={app.matchScore} size="sm" showBar={true} />
                </TableCell>
                <TableCell className="text-xs text-[#A7AFBC] font-mono">{app.appliedDate}</TableCell>
                <TableCell className="text-xs text-[#68717E]">{app.lastActivity}</TableCell>
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
