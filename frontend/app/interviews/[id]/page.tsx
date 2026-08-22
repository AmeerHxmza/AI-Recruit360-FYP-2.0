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
import { getInterviewByIdAction, updateInterviewStatusAction } from "@/app/actions/interviews";
import { InterviewItemWithDetails, InterviewQuestion } from "@/lib/services/interview-service";
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
        setErrorMsg(res.error || "Interview session not found or access denied.");
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
    const res = await updateInterviewStatusAction(interviewData.interview.id, newStatus);
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
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Interviews", "Loading..."]}>
        <div className="p-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading interview workspace session...</p>
        </div>
      </ApplicationShell>
    );
  }

  if (errorMsg || !interviewData) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Interviews", "Not Found"]}>
        <div className="p-12 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F7FA]">Interview Session Not Found</h3>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {errorMsg || "The requested interview record does not exist or you do not have authorization to access it."}
          </p>
          <Button variant="secondary" size="md" onClick={() => router.push("/interviews")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Interviews Directory
          </Button>
        </div>
      </ApplicationShell>
    );
  }

  const { interview, questions } = interviewData;

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Interviews", interview.candidateName]}>
      <PageHeader
        title={`Interview Session: ${interview.candidateName}`}
        description={`${interview.jobTitle} · ${interview.interview_type.replace("_", " ")}`}
        badge={<Badge variant="ai" className="capitalize">{interview.status}</Badge>}
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/interviews")}
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Interviews Directory
          </button>
        }
        actions={
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              {(interview.status === "pending" || (interview.status as string) === "scheduled") && (
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
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete Session
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/evaluations")}
              >
                View Evaluations
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: Interview Details & Questions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Question / Session Overview Card */}
          <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Interview Session Config
                </h3>
              </div>
              <span className="text-xs font-mono text-[#39D9FF]">
                {(interview as unknown as { duration_minutes?: number }).duration_minutes || 45} Minutes Duration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A7AFBC]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#39D9FF]" />
                <span>Scheduled: <strong>{formatDate(interview.created_at || (interview as unknown as { scheduled_at?: string }).scheduled_at || "")}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#35D07F]" />
                <span>Target Position: <strong>{interview.jobTitle}</strong></span>
              </div>
            </div>
          </Card>

          {/* Generated Questions Section */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <MessageSquare className="h-4 w-4 text-[#39D9FF]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Session Questions &amp; Evaluation Rubric ({questions.length})
              </h3>
            </div>

            {questions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0D0F12] border border-[#242932]/60 space-y-2">
                <p className="text-xs text-[#A7AFBC]">
                  No structured questions generated yet for this interview. Questions are dynamically generated during session runtime.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#0D0F12] border border-[#1C2027] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#39D9FF]">Question #{idx + 1} ({q.skill_category || (q as unknown as { category?: string }).category || "General"})</span>
                    </div>
                    <p className="text-xs text-[#F5F7FA] leading-relaxed">{q.question_text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Secondary Column: Candidate Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Candidate Profile
            </h3>
            <div className="flex items-center gap-3">
              <Avatar fallback={getInitials(interview.candidateName)} size="md" status="ai" />
              <div className="flex flex-col">
                <span className="font-semibold text-[#F5F7FA] text-xs">{interview.candidateName}</span>
                <span className="text-[11px] text-[#A7AFBC]">{interview.candidateEmail}</span>
              </div>
            </div>
          </Card>

          <Card elevated className="p-5 border-[#39D9FF]/30 bg-[#171B21] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <Sparkles className="h-4 w-4 text-[#39D9FF]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Multi-Tenant Isolated Session
              </h3>
            </div>
            <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
              This interview session belongs exclusively to {organization?.name || "your organization"}. RLS policies protect candidate data.
            </p>
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
