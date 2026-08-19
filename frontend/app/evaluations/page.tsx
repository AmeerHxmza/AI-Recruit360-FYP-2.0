"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MatchScore } from "@/components/dashboard/match-score";
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
import { mockEvaluations, EvaluationMockItem } from "@/lib/mock/evaluations";
import { BarChart3, ShieldCheck, CheckCircle2, Clock, ExternalLink } from "lucide-react";

export default function EvaluationsPage() {
  const router = useRouter();

  const getRecommendationBadge = (rec: EvaluationMockItem["recommendation"]) => {
    switch (rec) {
      case "STRONGLY RECOMMENDED":
        return <Badge variant="success" className="text-[11px] font-semibold">STRONGLY RECOMMENDED</Badge>;
      case "RECOMMENDED":
        return <Badge variant="ai" className="text-[11px] font-semibold">RECOMMENDED</Badge>;
      case "POTENTIAL":
        return <Badge variant="warning" className="text-[11px] font-semibold">POTENTIAL</Badge>;
      default:
        return <Badge variant="danger" className="text-[11px] font-semibold">NOT RECOMMENDED</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Evaluations"]}>
      <PageHeader
        title="Candidate Evaluations"
        description="Centralized candidate evaluation scorecards, technical metrics, and AI hiring recommendations."
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Pending Review"
          value="1"
          description="Requires recruiter sign-off"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Completed Scorecards"
          value="14"
          description="Synthesized AI reports"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Strong Recommendations"
          value="3"
          description=">90% overall score"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Average Candidate Score"
          value="92%"
          description="Across active pipeline"
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Evaluation Directory Table */}
      <Section title="Candidate Scorecard Directory">
        <Table className="border-[#242932] bg-[#12151A]">
          <TableHeader>
            <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Overall AI Score</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Technical Score</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Recommendation</TableHead>
              <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEvaluations.map((ev) => (
              <TableRow
                key={ev.id}
                onClick={() => router.push(`/candidates/${ev.candidateId}`)}
                className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={ev.avatarFallback} size="sm" status="ai" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#F5F7FA] text-xs">
                        {ev.candidateName}
                      </span>
                      <span className="text-[11px] text-[#A7AFBC]">
                        Evaluated {ev.evaluatedDate}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[#F5F7FA] font-medium">{ev.role}</TableCell>
                <TableCell>
                  <MatchScore score={ev.overallScore} size="sm" showBar={true} />
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-[#35D07F]">
                  {ev.technicalScore}%
                </TableCell>
                <TableCell>{getRecommendationBadge(ev.recommendation)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {ev.status}
                  </Badge>
                </TableCell>
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
