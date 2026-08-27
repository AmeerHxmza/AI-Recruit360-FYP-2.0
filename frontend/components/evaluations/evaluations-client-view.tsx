"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FinalEvaluationItemWithDetails } from "@/lib/services/evaluation-service";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Sparkles,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Filter,
} from "lucide-react";

interface EvaluationsClientViewProps {
  initialEvaluations: FinalEvaluationItemWithDetails[];
}

export function EvaluationsClientView({ initialEvaluations }: EvaluationsClientViewProps) {
  const router = useRouter();
  const [evaluations] = React.useState<FinalEvaluationItemWithDetails[]>(initialEvaluations);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRecommendation, setFilterRecommendation] = React.useState<string>("all");

  const filtered = evaluations.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRec =
      filterRecommendation === "all" || item.recommendation === filterRecommendation;

    return matchesSearch && matchesRec;
  });

  const totalCount = evaluations.length;
  const strongHires = evaluations.filter(
    (e) => e.recommendation === "strong_hire" || e.recommendation === "hire"
  ).length;
  const underReview = evaluations.filter((e) => e.recommendation === "review").length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          evaluations.reduce((sum, e) => sum + (Number(e.overall_score) || 0), 0) / totalCount
        )
      : 0;

  const getRecommendationBadge = (rec?: string | null) => {
    switch (rec) {
      case "strong_hire":
        return <Badge variant="success" className="text-[10px] px-2 py-0.5 uppercase font-mono font-bold">Strong Hire</Badge>;
      case "hire":
        return <Badge variant="ai" className="text-[10px] px-2 py-0.5 uppercase font-mono font-bold">Hire</Badge>;
      case "review":
        return <Badge variant="warning" className="text-[10px] px-2 py-0.5 uppercase font-mono font-bold">Review</Badge>;
      case "reject":
      case "strong_reject":
        return <Badge variant="danger" className="text-[10px] px-2 py-0.5 uppercase font-mono font-bold">Reject</Badge>;
      default:
        return <Badge variant="default" className="text-[10px] px-2 py-0.5 uppercase font-mono">Pending</Badge>;
    }
  };

  const getScoreColor = (score?: number | null) => {
    if (!score && score !== 0) return "text-[#68717E]";
    if (score >= 80) return "text-[#35D07F]";
    if (score >= 65) return "text-[#39D9FF]";
    return "text-[#FF5C67]";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate AI Evaluations & Scorecards"
        description="Comprehensive multi-modal AI hiring dossiers combining CV Screening (40%), Technical MCQ Assessment (25%), and Voice AI Interview (35%)."
        badge={<Badge variant="ai">AI Decision Engine</Badge>}
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card elevated className="p-5 border-[#242932] bg-[#12151A] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">Total Evaluated</span>
            <Award className="h-4 w-4 text-[#39D9FF]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F7FA] font-display">{totalCount}</div>
          <span className="text-[10px] text-[#68717E]">Completed multi-modal assessments</span>
        </Card>

        <Card elevated className="p-5 border-[#35D07F]/30 bg-[#35D07F]/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#35D07F] uppercase tracking-wider">Hire / Strong Hire</span>
            <CheckCircle2 className="h-4 w-4 text-[#35D07F]" />
          </div>
          <div className="text-2xl font-bold text-[#35D07F] font-display">{strongHires}</div>
          <span className="text-[10px] text-[#35D07F]/80">Top qualified candidates</span>
        </Card>

        <Card elevated className="p-5 border-[#F5B942]/30 bg-[#F5B942]/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F5B942] uppercase tracking-wider">Under Review</span>
            <AlertCircle className="h-4 w-4 text-[#F5B942]" />
          </div>
          <div className="text-2xl font-bold text-[#F5B942] font-display">{underReview}</div>
          <span className="text-[10px] text-[#F5B942]/80">Requires recruiter decision</span>
        </Card>

        <Card elevated className="p-5 border-[#39D9FF]/30 bg-[#39D9FF]/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#39D9FF] uppercase tracking-wider">Avg Composite Score</span>
            <BarChart3 className="h-4 w-4 text-[#39D9FF]" />
          </div>
          <div className="text-2xl font-bold text-[#39D9FF] font-display">{avgScore} / 100</div>
          <span className="text-[10px] text-[#39D9FF]/80">Weighted hiring index</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-[#242932] bg-[#12151A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#68717E]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, email, or role..."
            className="pl-9 text-xs h-9 bg-[#0D0F12] border-[#242932]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-[#A7AFBC] shrink-0" />
          <span className="text-xs text-[#A7AFBC] shrink-0 font-medium">Filter:</span>
          {["all", "strong_hire", "hire", "review", "reject"].map((rec) => (
            <Button
              key={rec}
              variant={filterRecommendation === rec ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterRecommendation(rec)}
              className="text-xs capitalize h-8 px-2.5"
            >
              {rec.replace("_", " ")}
            </Button>
          ))}
        </div>
      </Card>

      {/* Evaluations Table */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-[#242932] bg-[#12151A] space-y-4">
          <Sparkles className="h-10 w-10 text-[#39D9FF] mx-auto opacity-40" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F5F7FA]">No Candidate Evaluations Recorded</h4>
            <p className="text-xs text-[#A7AFBC] max-w-md mx-auto leading-relaxed">
              Candidate evaluations are automatically generated when candidates complete their CV screening, technical MCQ assessments, and AI voice interviews.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/candidates")}>
              View Candidates
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/interviews")}>
              View Interviews
            </Button>
          </div>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">CV Match (40%)</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">MCQ (25%)</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview (35%)</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Overall AI Score</TableHead>
                <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Recommendation</TableHead>
                <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    if (item.candidateId) {
                      router.push(`/candidates/${item.candidateId}`);
                    }
                  }}
                  className="cursor-pointer border-b border-[#1C2027] hover:bg-[#171B21]/80 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        fallback={item.candidateName.slice(0, 2).toUpperCase()}
                        size="sm"
                        status={item.recommendation === "strong_hire" || item.recommendation === "hire" ? "online" : "ai"}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#F5F7FA] text-xs hover:text-[#39D9FF]">
                          {item.candidateName}
                        </span>
                        <span className="text-[11px] text-[#A7AFBC]">{item.candidateEmail}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#F5F7FA] font-medium">
                    {item.jobTitle}
                    <span className="block text-[10px] text-[#68717E]">{item.jobDepartment}</span>
                  </TableCell>

                  <TableCell className="text-xs font-mono font-medium">
                    {item.cv_score !== null ? `${item.cv_score}%` : "—"}
                  </TableCell>

                  <TableCell className="text-xs font-mono font-medium">
                    {item.assessment_score !== null ? `${item.assessment_score}%` : "—"}
                  </TableCell>

                  <TableCell className="text-xs font-mono font-medium">
                    {item.interview_score !== null ? `${item.interview_score}%` : "—"}
                  </TableCell>

                  <TableCell>
                    <span className={`text-sm font-bold font-display ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score !== null ? `${item.overall_score} / 100` : "—"}
                    </span>
                  </TableCell>

                  <TableCell>{getRecommendationBadge(item.recommendation)}</TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.candidateId) {
                          router.push(`/candidates/${item.candidateId}`);
                        }
                      }}
                      className="text-xs text-[#39D9FF] hover:text-[#63E3FF] h-7 px-2"
                    >
                      Dossier <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
