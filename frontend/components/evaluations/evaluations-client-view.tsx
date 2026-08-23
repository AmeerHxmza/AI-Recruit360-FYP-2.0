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
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { canManageEvaluations } from "@/lib/auth/permissions";
import { getEvaluationsAction } from "@/app/actions/evaluations";
import { FinalEvaluationItemWithDetails } from "@/lib/services/evaluation-service";
import { FinalRecommendation, OrganizationRole } from "@/types/database.types";
import { BarChart3, ShieldCheck, CheckCircle2, Clock, ExternalLink, Plus, Loader2, AlertCircle, X, Sparkles } from "lucide-react";

interface EvaluationsClientViewProps {
  initialEvaluations: FinalEvaluationItemWithDetails[];
  role: OrganizationRole;
  orgName: string;
}

export function EvaluationsClientView({
  initialEvaluations,
  role,
  orgName,
}: EvaluationsClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageEvaluations(role);

  const [evaluations, setEvaluations] = React.useState<FinalEvaluationItemWithDetails[]>(initialEvaluations);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);



  const loadEvaluations = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getEvaluationsAction();
    if (res.success && res.data) {
      setEvaluations(res.data);
    } else {
      setErrorMsg(res.error || "Failed to load candidate evaluations.");
    }
    setLoading(false);
  }, []);



  const getRecommendationBadge = (rec: FinalRecommendation | null) => {
    switch (rec) {
      case "strong_hire":
        return <Badge variant="success" className="text-[11px] font-semibold uppercase">STRONGLY RECOMMENDED</Badge>;
      case "hire":
        return <Badge variant="ai" className="text-[11px] font-semibold uppercase">RECOMMENDED</Badge>;
      case "review":
        return <Badge variant="warning" className="text-[11px] font-semibold uppercase">NEEDS REVIEW</Badge>;
      case "no_hire":
        return <Badge variant="danger" className="text-[11px] font-semibold uppercase">NOT RECOMMENDED</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] font-semibold uppercase">PENDING</Badge>;
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

  const metrics = React.useMemo(() => {
    const total = evaluations.length;
    const strong = evaluations.filter(
      (e) => e.recommendation === "strong_hire" || (e.overall_score && e.overall_score >= 90)
    ).length;
    const pending = evaluations.filter((e) => e.status === "pending" || e.status === "in_review").length;
    const avgScore =
      total > 0
        ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / total)
        : 0;

    return { total, strong, pending, avgScore };
  }, [evaluations]);

  return (
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "Evaluations"]}>
      <PageHeader
        title="Candidate Evaluations"
        description="Centralized candidate evaluation scorecards, technical metrics, and AI hiring recommendations."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Scorecard Matrix
          </Badge>
        }
        actions={undefined}
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Pending Review"
          value={metrics.pending}
          description="Requires recruiter sign-off"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Completed Scorecards"
          value={metrics.total}
          description="Recorded evaluations"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Strong Recommendations"
          value={metrics.strong}
          description=">90% overall score"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Average Candidate Score"
          value={metrics.avgScore > 0 ? `${metrics.avgScore}%` : "N/A"}
          description="Across workspace pipeline"
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadEvaluations} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {/* Evaluation Directory Table */}
      <Section title="Candidate Scorecard Directory">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Updating evaluation scorecards...</p>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">No evaluation scorecards recorded</h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                Submit your workspace&apos;s first candidate evaluation scorecard to begin recording technical hiring decisions.
              </p>
            </div>

          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Position</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Overall Score</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Recommendation</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev) => (
                  <TableRow
                    key={ev.id}
                    onClick={() => router.push(`/candidates/${ev.application_id}`)}
                    className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={getInitials(ev.candidateName)} size="sm" status="ai" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#F5F7FA] text-xs">
                            {ev.candidateName}
                          </span>
                          <span className="text-[11px] text-[#A7AFBC]">
                            Evaluated {formatDate(ev.created_at)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#F5F7FA] font-medium">{ev.jobTitle}</TableCell>
                    <TableCell>
                      {ev.overall_score !== null ? (
                        <MatchScore score={ev.overall_score} size="sm" showBar={true} />
                      ) : (
                        <span className="text-xs text-[#A7AFBC] font-mono">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{getRecommendationBadge(ev.recommendation)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-medium uppercase">
                        {ev.model || "COMPLETED"}
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
          </div>
        )}
      </Section>


    </ApplicationShell>
  );
}
