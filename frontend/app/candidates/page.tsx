"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MatchScore } from "@/components/dashboard/match-score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { mockCandidates, CandidateMockItem } from "@/lib/mock/candidates";
import { Users, Sparkles, Search, UserCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function CandidatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const filteredCandidates = mockCandidates.filter((cand) => {
    const matchesSearch =
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || cand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CandidateMockItem["status"]) => {
    switch (status) {
      case "Shortlisted":
        return <Badge variant="success" className="text-[11px] font-medium">Shortlisted</Badge>;
      case "Interview":
        return <Badge variant="ai" className="text-[11px] font-medium">Interview</Badge>;
      case "Screening":
        return <Badge variant="warning" className="text-[11px] font-medium">Screening</Badge>;
      case "Review":
        return <Badge variant="default" className="text-[11px] font-medium">Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Candidates"]}>
      <PageHeader
        title="Candidate Intelligence"
        description="AI-powered candidate screening, evidence extraction, and recommendation directory."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Vector Matching
          </Badge>
        }
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Candidates"
          value="183"
          description="Parsed & indexed"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Strong Matches"
          value="27"
          description=">90% threshold"
          icon={<Sparkles className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="In Screening"
          value="48"
          description="Evidence verification"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Shortlisted"
          value="7"
          description="Hiring manager review"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Filter & Search Controls */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search candidates by name, role, or skills (e.g. Python, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "All", label: "Status: All" },
                  { value: "Shortlisted", label: "Shortlisted" },
                  { value: "Interview", label: "Interview" },
                  { value: "Screening", label: "Screening" },
                  { value: "Review", label: "Review" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Candidate Directory Table */}
      <Section title="Candidate Database Directory">
        <Table className="border-[#242932] bg-[#12151A]">
          <TableHeader>
            <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Role</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Match Score</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Skills Tags</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Last Activity</TableHead>
              <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((cand) => (
              <TableRow
                key={cand.id}
                onClick={() => router.push(`/candidates/${cand.id}`)}
                className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={cand.avatarFallback}
                      size="sm"
                      status={cand.matchScore >= 90 ? "ai" : "online"}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#F5F7FA] text-xs">
                        {cand.name}
                      </span>
                      <span className="text-[11px] text-[#A7AFBC]">
                        {cand.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[#F5F7FA] font-medium">{cand.role}</TableCell>
                <TableCell>
                  <MatchScore
                    score={cand.matchScore}
                    label={cand.matchLabel}
                    confidenceLevel={cand.confidenceLevel}
                    size="sm"
                    showBar={true}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1 max-w-xs">
                    {cand.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
                        {skill}
                      </Badge>
                    ))}
                    {cand.skills.length > 3 && (
                      <span className="text-[10px] text-[#68717E]">+{cand.skills.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(cand.status)}</TableCell>
                <TableCell className="text-xs text-[#68717E]">{cand.lastActivity}</TableCell>
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
