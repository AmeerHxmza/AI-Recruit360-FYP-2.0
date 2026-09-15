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

export function EvaluationsClientView({
  initialEvaluations,
}: EvaluationsClientViewProps) {
  const router = useRouter();
  const [evaluations] =
    React.useState<FinalEvaluationItemWithDetails[]>(initialEvaluations);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRecommendation, setFilterRecommendation] =
    React.useState<string>("all");

  const filtered = evaluations.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRec =
      filterRecommendation === "all" ||
      item.recommendation === filterRecommendation;

    return matchesSearch && matchesRec;
  });

  const totalCount = evaluations.length;
  const strongHires = evaluations.filter(
    (e) => e.recommendation === "strong_hire" || e.recommendation === "hire",
  ).length;
  const underReview = evaluations.filter(
    (e) => e.recommendation === "review",
  ).length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          evaluations.reduce(
            (sum, e) => sum + (Number(e.overall_score) || 0),
            0,
          ) / totalCount,
        )
      : 0;

  const getRecommendationBadge = (rec?: string | null) => {
    switch (rec) {
      case "strong_hire":
        return <Badge variant="success">Strong hire</Badge>;
      case "hire":
        return <Badge variant="ai">Hire</Badge>;
      case "review":
        return <Badge variant="warning">Review</Badge>;
      case "reject":
      case "strong_reject":
        return <Badge variant="danger">Reject</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluations"
        description="Executive candidate scorecards combining CV screening (40%), MCQ assessment (25%), and AI interview signals (35%)."
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-surface space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Total evaluated
            </span>
            <Award className="h-4 w-4 text-text-muted" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-text-primary font-sans">
            {totalCount}
          </div>
          <span className="text-xs text-text-muted">
            Completed multi-signal assessments
          </span>
        </Card>

        <Card className="p-5 border-border bg-surface space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-success">
              Hire / Strong hire
            </span>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-success font-sans">
            {strongHires}
          </div>
          <span className="text-xs text-text-muted">
            Top qualified candidates
          </span>
        </Card>

        <Card className="p-5 border-border bg-surface space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-warning">
              Under review
            </span>
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-warning font-sans">
            {underReview}
          </div>
          <span className="text-xs text-text-muted">
            Requires recruiter review
          </span>
        </Card>

        <Card className="p-5 border-border bg-surface space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-action-blue">
              Avg composite score
            </span>
            <BarChart3 className="h-4 w-4 text-action-blue" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-text-primary font-sans">
            {avgScore} / 100
          </div>
          <span className="text-xs text-text-muted">Weighted hiring index</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, email, or role..."
            className="pl-9 text-xs h-9 bg-background border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="text-xs text-text-secondary shrink-0 font-medium">
            Filter:
          </span>
          {["all", "strong_hire", "hire", "review", "reject"].map((rec) => (
            <button
              key={rec}
              onClick={() => setFilterRecommendation(rec)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
                filterRecommendation === rec
                  ? "bg-hover text-text-primary border border-border"
                  : "text-text-secondary hover:text-text-primary hover:bg-hover"
              }`}
            >
              {rec === "all" ? "All" : rec.replace("_", " ")}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Table */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-border bg-surface space-y-4">
          <div className="h-12 w-12 rounded-xl bg-background border border-border text-text-muted mx-auto flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-text-primary">
              {searchQuery || filterRecommendation !== "all"
                ? "No evaluations matched your filters"
                : "No candidate evaluations yet"}
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              Candidate evaluations are automatically generated when applicants
              complete their CV screening, technical MCQ assessments, and AI
              voice interviews.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/candidates")}
            >
              View candidates
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/interviews")}
            >
              View interviews
            </Button>
          </div>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-background hover:bg-background">
                <TableHead className="text-xs font-medium text-text-secondary">
                  Candidate
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  Target role
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  CV match (40%)
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  MCQ (25%)
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  Interview (35%)
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  Overall score
                </TableHead>
                <TableHead className="text-xs font-medium text-text-secondary">
                  Recommendation
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-text-secondary">
                  Action
                </TableHead>
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
                  className="cursor-pointer border-b border-border hover:bg-hover transition-colors"
                >
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        fallback={item.candidateName.slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary text-xs hover:text-action-blue">
                          {item.candidateName}
                        </span>
                        <span className="text-xs text-text-muted">
                          {item.candidateEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-text-primary">
                    {item.jobTitle}
                    <span className="block text-xs text-text-muted">
                      {item.jobDepartment}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs font-medium">
                    {item.cv_score !== null ? (
                      <span className="text-text-primary font-sans">
                        {item.cv_score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-medium">
                    {item.assessment_score !== null ? (
                      <span className="text-text-primary font-sans">
                        {item.assessment_score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-medium">
                    {item.interview_score !== null ? (
                      <span className="text-text-primary font-sans">
                        {item.interview_score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {item.overall_score !== null ? (
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium font-sans border ${
                          item.overall_score >= 80
                            ? "bg-success/10 text-success border-success/20"
                            : item.overall_score >= 60
                              ? "bg-action-blue/10 text-action-blue border-action-blue/20"
                              : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {item.overall_score} / 100
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {getRecommendationBadge(item.recommendation)}
                  </TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.candidateId) {
                          router.push(`/candidates/${item.candidateId}`);
                        }
                      }}
                      className="text-xs text-action-blue hover:text-text-secondary h-7 px-2"
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
