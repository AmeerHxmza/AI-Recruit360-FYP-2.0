"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { canManageInterviews } from "@/lib/auth/permissions";
import {
  getInterviewByIdAction,
  updateInterviewStatusAction,
} from "@/app/actions/interviews";
import {
  InterviewItemWithDetails,
  InterviewQuestion,
} from "@/lib/services/interview-service";
import { InterviewStatus } from "@/types/database.types";
import {
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function InterviewWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const intId = (params?.id as string) || "";

  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageInterviews(role);

  const [interviewData, setInterviewData] = React.useState<{
    interview: InterviewItemWithDetails;
    questions: InterviewQuestion[];
    responses?: {
      id: string;
      question_id: string;
      response_text: string | null;
      transcript: string | null;
      technical_score: number | null;
      communication_score: number | null;
      relevance_score: number | null;
      ai_feedback: string | null;
    }[];
  } | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (!intId) return;
    let isMounted = true;

    getInterviewByIdAction(intId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setInterviewData(res.data);
      } else {
        setErrorMsg(
          res.error || "Interview session not found or access denied.",
        );
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [intId, organization?.id]);

  const handleStatusChange = async (newStatus: InterviewStatus) => {
    if (!interviewData || !isAuthorizedToManage) return;
    setUpdating(true);
    const res = await updateInterviewStatusAction(
      interviewData.interview.id,
      newStatus,
    );
    if (res.success && res.data) {
      setInterviewData({
        ...interviewData,
        interview: {
          ...interviewData.interview,
          status: newStatus,
        },
      });
    } else {
      setErrorMsg(res.error || "Failed to update interview status.");
    }
    setUpdating(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
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

  if (loading) {
    return (
      <ApplicationShell
        pageBreadcrumb={[
          organization?.name || "AI-Recruit360",
          "Interviews",
          "Loading...",
        ]}
      >
        <div className="p-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-action-blue animate-spin mx-auto" />
          <p className="text-xs text-text-secondary font-mono">
            Loading interview workspace session...
          </p>
        </div>
      </ApplicationShell>
    );
  }

  if (errorMsg || !interviewData) {
    return (
      <ApplicationShell
        pageBreadcrumb={[
          organization?.name || "AI-Recruit360",
          "Interviews",
          "Not Found",
        ]}
      >
        <div className="p-12 text-center rounded-2xl border border-border bg-surface space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-danger mx-auto" />
          <h3 className="text-lg font-bold text-text-primary">
            Interview Session Not Found
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {errorMsg ||
              "The requested interview record does not exist or you do not have authorization to access it."}
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/interviews")}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Interviews
            Directory
          </Button>
        </div>
      </ApplicationShell>
    );
  }

  const { interview, questions, responses = [] } = interviewData;

  // Map question id to response
  const responsesByQuestionId = new Map(
    responses.map((r) => [r.question_id, r]),
  );

  return (
    <ApplicationShell
      pageBreadcrumb={[
        organization?.name || "AI-Recruit360",
        "Interviews",
        interview.candidateName,
      ]}
    >
      <PageHeader
        title={`Interview Session: ${interview.candidateName}`}
        description={`${interview.jobTitle} · ${interview.interview_type.replace("_", " ")}`}
        badge={
          <Badge variant="ai" className="capitalize">
            {interview.status}
          </Badge>
        }
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/interviews")}
            className="inline-flex items-center text-xs text-text-secondary hover:text-action-blue transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Interviews
            Directory
          </button>
        }
        actions={
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              {(interview.status === "pending" ||
                (interview.status as string) === "scheduled") && (
                <Button
                  variant="ai"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleStatusChange("in_progress")}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Start Session
                </Button>
              )}
              {interview.status === "in_progress" && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleStatusChange("completed")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete
                  Session
                </Button>
              )}
              {interview.candidateId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/candidates/${interview.candidateId}`)
                  }
                >
                  Candidate Scorecard
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: Interview Details & Questions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Question / Session Overview Card */}
          <Card
            elevated
            className="p-6 border-action-blue/30 bg-hover space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-action-blue" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                  Session Performance &amp; Evaluation
                </h3>
              </div>
              <span className="text-xs font-mono text-success font-bold">
                {interview.overall_score !== null
                  ? `${interview.overall_score}% Score`
                  : "Score Calculating"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-action-blue" />
                <span>
                  Scheduled:{" "}
                  <strong>{formatDate(interview.created_at || "")}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-success" />
                <span>
                  Target: <strong>{interview.jobTitle}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-text-secondary" />
                <span>
                  Progress:{" "}
                  <strong>
                    {interview.questions_answered || questions.length || 5} of{" "}
                    {interview.total_questions || 5} Questions
                  </strong>
                </span>
              </div>
            </div>
          </Card>

          {/* Generated Questions & Transcripts Section */}
          <Card className="p-6 border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-action-blue" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                  Interview Questions &amp; Spoken Answers ({questions.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-text-secondary">
                {responses.length} responses evaluated
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface border border-border/60 space-y-2">
                <p className="text-xs text-text-secondary">
                  No structured questions generated yet for this interview.
                  Questions are dynamically generated during session runtime.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const resp = responsesByQuestionId.get(q.id);
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-surface border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-action-blue">
                          Question #{idx + 1} (
                          {q.skill_category || "Technical Competency"})
                        </span>
                        {resp?.technical_score !== null &&
                          resp?.technical_score !== undefined && (
                            <span className="font-mono text-success font-semibold">
                              Tech: {resp.technical_score}% | Comm:{" "}
                              {resp.communication_score}%
                            </span>
                          )}
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed font-medium">
                        {q.question_text}
                      </p>

                      {resp ? (
                        <div className="pt-2 border-t border-border space-y-2">
                          <div className="text-xs text-text-secondary bg-surface p-3 rounded-lg border border-border">
                            <span className="font-semibold text-text-primary block mb-1">
                              Candidate Transcript:
                            </span>
                            <span className="italic leading-relaxed">
                              &ldquo;{resp.transcript || resp.response_text}
                              &rdquo;
                            </span>
                          </div>
                          {resp.ai_feedback && (
                            <p className="text-xs text-action-blue/90 font-mono">
                              AI Feedback: {resp.ai_feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted italic pt-1">
                          Awaiting candidate response.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Secondary Column: Candidate Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-border bg-surface space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display border-b border-border pb-3">
              Candidate Profile
            </h3>
            <div className="flex items-center gap-3">
              <Avatar
                fallback={getInitials(interview.candidateName)}
                size="md"
                status="ai"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-text-primary text-xs">
                  {interview.candidateName}
                </span>
                <span className="text-xs text-text-secondary">
                  {interview.candidateEmail}
                </span>
              </div>
            </div>
            {interview.candidateId && (
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs mt-2"
                onClick={() =>
                  router.push(`/candidates/${interview.candidateId}`)
                }
              >
                Open Full Candidate Scorecard →
              </Button>
            )}
          </Card>

          <Card
            elevated
            className="p-5 border-action-blue/30 bg-hover space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="h-4 w-4 text-action-blue" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                Multi-Tenant Isolated Session
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              This interview session belongs exclusively to{" "}
              {organization?.name || "your organization"}. RLS policies protect
              candidate data.
            </p>
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
