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
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { canManageInterviews } from "@/lib/auth/permissions";
import { getInterviewsAction, createInterviewAction } from "@/app/actions/interviews";
import { getApplicationsAction } from "@/app/actions/applications";
import { InterviewItemWithDetails } from "@/lib/services/interview-service";
import { ApplicationItemWithDetails } from "@/lib/services/application-service";
import { InterviewStatus, InterviewType } from "@/types/database.types";
import { Video, Clock, CheckCircle2, Sparkles, ExternalLink, Plus, Loader2, AlertCircle, X, Calendar } from "lucide-react";

export default function InterviewsPage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageInterviews(role);

  const [interviews, setInterviews] = React.useState<InterviewItemWithDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [applications, setApplications] = React.useState<ApplicationItemWithDetails[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState(45);
  const [interviewType, setInterviewType] = React.useState<InterviewType>("ai_adaptive");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalErrorMsg, setModalErrorMsg] = React.useState<string | null>(null);

  const loadInterviews = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getInterviewsAction();
    if (res.success && res.data) {
      setInterviews(res.data);
    } else {
      setErrorMsg(res.error || "Failed to load interview sessions.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    getInterviewsAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setInterviews(res.data);
      } else {
        setErrorMsg(res.error || "Failed to load interview sessions.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const openScheduleModal = async () => {
    setModalErrorMsg(null);
    setIsScheduleModalOpen(true);

    const res = await getApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data);
      if (res.data.length > 0) setSelectedAppId(res.data[0].id);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg(null);

    if (!selectedAppId || !scheduledAt) {
      setModalErrorMsg("Please select an application and scheduled date/time.");
      return;
    }

    setIsSubmitting(true);

    const res = await createInterviewAction({
      application_id: selectedAppId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: Number(durationMinutes) || 45,
      interview_type: interviewType,
    });

    if (res.success && res.data) {
      setIsScheduleModalOpen(false);
      loadInterviews();
    } else {
      setModalErrorMsg(res.error || "Failed to schedule interview session.");
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="ai" className="text-[11px] font-medium uppercase">In Progress</Badge>;
      case "scheduled":
        return <Badge variant="default" className="text-[11px] font-medium uppercase">Scheduled</Badge>;
      case "completed":
        return <Badge variant="success" className="text-[11px] font-medium uppercase">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger" className="text-[11px] font-medium uppercase">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] uppercase">{status}</Badge>;
    }
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

  const metrics = React.useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i) => i.status === "pending" || (i as unknown as { status: string }).status === "scheduled").length;
    const completed = interviews.filter((i) => i.status === "completed").length;
    return { total, scheduled, completed };
  }, [interviews]);

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Interviews"]}>
      <PageHeader
        title="Interviews"
        description="AI-assisted adaptive interview management, question generation, and real-time evaluation."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Adaptive Engine
          </Badge>
        }
        actions={
          isAuthorizedToManage ? (
            <Button variant="ai" size="md" onClick={openScheduleModal}>
              <Plus className="h-4 w-4 mr-1.5" /> Schedule Interview
            </Button>
          ) : undefined
        }
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Upcoming Sessions"
          value={metrics.scheduled}
          description="Booked interviews"
          icon={<Video className="h-4 w-4" />}
        />
        <MetricCard
          label="Completed Interviews"
          value={metrics.completed}
          description="Evaluated sessions"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Sessions"
          value={metrics.total}
          description="Workspace directory"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadInterviews} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {/* Interview List Table */}
      <Section title="Interview Sessions Directory">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Loading interview sessions from database...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
              <Video className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">No interview sessions scheduled</h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                Schedule your organization&apos;s first interview session to begin conducting AI adaptive evaluations.
              </p>
            </div>
            {isAuthorizedToManage && (
              <Button variant="ai" size="md" onClick={openScheduleModal} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Schedule First Interview
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
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview Type</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Date &amp; Time</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((int) => (
                  <TableRow
                    key={int.id}
                    onClick={() => router.push(`/interviews/${int.id}`)}
                    className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={getInitials(int.candidateName)} size="sm" status="ai" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#F5F7FA] text-xs">
                            {int.candidateName}
                          </span>
                          <span className="text-[11px] text-[#A7AFBC]">
                            {int.candidateEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#F5F7FA] font-medium">{int.jobTitle}</TableCell>
                    <TableCell className="text-xs text-[#39D9FF] font-medium capitalize">
                      {int.interview_type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-xs text-[#A7AFBC] font-mono">
                      {formatDate(int.created_at || (int as unknown as { scheduled_at?: string }).scheduled_at || "")}
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
          </div>
        )}
      </Section>

      {/* Schedule Interview Modal Dialog */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsScheduleModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-lg rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA]">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#39D9FF]" />
                <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Schedule Interview Session</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
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

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Target Application *</label>
                {applications.length === 0 ? (
                  <p className="text-xs text-[#FF5C67]">
                    No applications found. Please submit a candidate application first.
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
                  <label className="text-xs font-semibold text-[#A7AFBC]">Scheduled Date &amp; Time *</label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={15}
                    max={180}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Interview Type</label>
                <Select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  options={[
                    { value: "ai_adaptive", label: "AI Adaptive Engine" },
                    { value: "technical", label: "Technical Interview" },
                    { value: "behavioral", label: "Behavioral Screening" },
                    { value: "screening", label: "Initial Screening" },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
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
                    <Calendar className="h-4 w-4 mr-1.5" />
                  )}
                  Schedule Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}
