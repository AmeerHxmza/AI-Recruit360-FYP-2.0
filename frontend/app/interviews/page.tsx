"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
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
import { mockInterviews, InterviewMockItem } from "@/lib/mock/interviews";
import { Video, Clock, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";

export default function InterviewsPage() {
  const router = useRouter();

  const getStatusBadge = (status: InterviewMockItem["status"]) => {
    switch (status) {
      case "In Progress":
        return <Badge variant="ai" className="text-[11px] font-medium">In Progress</Badge>;
      case "Scheduled":
        return <Badge variant="default" className="text-[11px] font-medium">Scheduled</Badge>;
      case "Needs Evaluation":
        return <Badge variant="warning" className="text-[11px] font-medium">Needs Evaluation</Badge>;
      case "Completed":
        return <Badge variant="success" className="text-[11px] font-medium">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Interviews"]}>
      <PageHeader
        title="Interviews"
        description="AI-assisted adaptive interview management, question generation, and real-time evaluation."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Adaptive Engine
          </Badge>
        }
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Upcoming Sessions"
          value="3"
          description="Booked for today & tomorrow"
          icon={<Video className="h-4 w-4" />}
        />
        <MetricCard
          label="Completed Interviews"
          value="14"
          description="Evaluated by AI engine"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Needs Evaluation"
          value="1"
          description="Pending recruiter review"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
      </div>

      {/* Interview List Table */}
      <Section title="Interview Sessions Directory">
        <Table className="border-[#242932] bg-[#12151A]">
          <TableHeader>
            <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview Type</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Date &amp; Time</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInterviews.map((int) => (
              <TableRow
                key={int.id}
                onClick={() => router.push(`/interviews/${int.id}`)}
                className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={int.avatarFallback} size="sm" status="ai" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#F5F7FA] text-xs">
                        {int.candidateName}
                      </span>
                      <span className="text-[11px] text-[#A7AFBC]">
                        ID: {int.candidateId}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[#F5F7FA] font-medium">{int.role}</TableCell>
                <TableCell className="text-xs text-[#39D9FF] font-medium">{int.interviewType}</TableCell>
                <TableCell className="text-xs text-[#A7AFBC] font-mono">
                  {int.date} at {int.time}
                </TableCell>
                <TableCell>{getStatusBadge(int.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Workspace <ExternalLink className="h-3 w-3 ml-1" />
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
