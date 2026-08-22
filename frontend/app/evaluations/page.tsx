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
import { useAuth } from "@/providers/auth-provider";
import { canManageEvaluations } from "@/lib/auth/permissions";
import { getEvaluationsAction, createEvaluationAction } from "@/app/actions/evaluations";
import { getApplicationsAction } from "@/app/actions/applications";
import { FinalEvaluationItemWithDetails } from "@/lib/services/evaluation-service";
import { ApplicationItemWithDetails } from "@/lib/services/application-service";
import { FinalRecommendation } from "@/types/database.types";
import { BarChart3, ShieldCheck, CheckCircle2, Clock, ExternalLink, Plus, Loader2, AlertCircle, X, Sparkles } from "lucide-react";

export default function EvaluationsPage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageEvaluations(role);

  const [evaluations, setEvaluations] = React.useState<FinalEvaluationItemWithDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Submit Evaluation Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [applications, setApplications] = React.useState<ApplicationItemWithDetails[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [overallScore, setOverallScore] = React.useState(85);
  const [recommendation, setRecommendation] = React.useState<FinalRecommendation>("hire");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalErrorMsg, setModalErrorMsg] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    let isMounted = true;
    getEvaluationsAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setEvaluations(res.data);
      } else {
        setErrorMsg(res.error || "Failed to load candidate evaluations.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const openModal = async () => {
    setModalErrorMsg(null);
    setIsModalOpen(true);

    const res = await getApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data);
      if (res.data.length > 0) setSelectedAppId(res.data[0].id);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg(null);

    if (!selectedAppId) {
      setModalErrorMsg("Please select an application record.");
      return;
    }

    setIsSubmitting(true);

    const res = await createEvaluationAction({
      application_id: selectedAppId,
      overall_score: Number(overallScore) || 85,
      recommendation,
      ai_summary: notes.trim() || undefined,
    });

    if (res.success && res.data) {
      setIsModalOpen(false);
      setNotes("");
      loadEvaluations();
    } else {
      setModalErrorMsg(res.error || "Failed to submit candidate evaluation.");
    }
    setIsSubmitting(false);
  };

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
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Evaluations"]}>
      <PageHeader
        title="Candidate Evaluations"
        description="Centralized candidate evaluation scorecards, technical metrics, and AI hiring recommendations."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Scorecard Matrix
          </Badge>
        }
        actions={
          isAuthorizedToManage ? (
            <Button variant="ai" size="md" onClick={openModal}>
              <Plus className="h-4 w-4 mr-1.5" /> Submit Evaluation
            </Button>
          ) : undefined
        }
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
            <p className="text-xs text-[#A7AFBC] font-mono">Loading evaluation scorecards from database...</p>
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
            {isAuthorizedToManage && (
              <Button variant="ai" size="md" onClick={openModal} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Submit First Evaluation
              </Button>
            )}
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

      {/* Submit Evaluation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-lg rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA]">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#39D9FF]" />
                <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Submit Candidate Evaluation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalErrorMsg && (
              <div className="p-3 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 text-xs text-[#FF5C67] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Select Application Record *</label>
                {applications.length === 0 ? (
                  <p className="text-xs text-[#FF5C67]">
                    No application records found. Submit an application first.
                  </p>
                ) : (
                  <Select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    options={applications.map((a) => ({
                      value: a.id,
                      label: `${a.candidateName} — ${a.jobTitle}`,
                    }))}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Overall Score (0 - 100)</label>
                  <Input
                    type="number"
                    value={overallScore}
                    onChange={(e) => setOverallScore(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Recommendation</label>
                  <Select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as FinalRecommendation)}
                    options={[
                      { value: "strong_hire", label: "Strong Hire" },
                      { value: "hire", label: "Hire" },
                      { value: "review", label: "Needs Review" },
                      { value: "no_hire", label: "No Hire" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Evaluation Notes / Feedback</label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Technical strengths, areas of concern, or interviewer notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="ai"
                  size="sm"
                  disabled={isSubmitting || applications.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Submit Scorecard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}
