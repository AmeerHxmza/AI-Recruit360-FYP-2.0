"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { InterviewItemWithDetails } from "@/lib/services/interview-service";
import { Video, Clock, CheckCircle2, Sparkles, ExternalLink, Loader2, AlertCircle, Calendar } from "lucide-react";

interface InterviewsClientViewProps {
  initialInterviews: InterviewItemWithDetails[];
}

export function InterviewsClientView({
  initialInterviews,
}: InterviewsClientViewProps) {
  const router = useRouter();

  const [interviews, setInterviews] = React.useState<InterviewItemWithDetails[]>(initialInterviews);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

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

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" className="text-[11px] font-mono">Completed</Badge>;
      case "in_progress":
        return <Badge variant="ai" className="text-[11px] font-mono">Live In Progress</Badge>;
      case "pending":
      case "scheduled":
        return <Badge variant="warning" className="text-[11px] font-mono">Scheduled</Badge>;
      case "cancelled":
      case "abandoned":
        return <Badge variant="danger" className="text-[11px] font-mono">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] font-mono">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
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
    const completed = interviews.filter((i) => i.status === "completed").length;
    const active = interviews.filter((i) => i.status === "in_progress" || i.status === "pending" || i.status === "scheduled").length;
    const aiAdaptive = interviews.filter((i) => i.interview_type === "ai_adaptive").length;

    return { total, completed, active, aiAdaptive };
  }, [interviews]);

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="AI Interview Rooms"
        description="Schedule, monitor, and review candidate voice AI adaptive interview sessions."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Live Adaptive Voice AI
          </Badge>
        }
        actions={undefined}
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active / Scheduled Sessions"
          value={metrics.active}
          description="Upcoming candidate rooms"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="Completed Interviews"
          value={metrics.completed}
          description="Evaluated audio transcripts"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Adaptive AI Sessions"
          value={metrics.aiAdaptive}
          description="Dynamic audio questions"
          icon={<Video className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Workspace Records"
          value={metrics.total}
          description="Recorded interview entries"
          icon={<Calendar className="h-4 w-4" />}
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

      {/* Main Interviews Table */}
      <Section title="Workspace Interview Sessions">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Updating interview rooms...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#12151A] border border-[#242932] text-[#39D9FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(57,217,255,0.15)]">
              <Video className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">No interview sessions available</h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                Candidates who pass the technical assessment will automatically be invited to an AI interview.
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
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Interview Type</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Session Status</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Score / Progress</TableHead>
                  <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => router.push(`/candidates/${item.application_id}`)}
                    className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={getInitials(item.candidateName)} size="sm" status="online" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#F5F7FA] text-xs">
                            {item.candidateName}
                          </span>
                          <span className="text-[11px] text-[#A7AFBC]">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#F5F7FA] font-medium">{item.jobTitle}</TableCell>
                    <TableCell>
                      <span className="rounded bg-[#0D0F12] px-2 py-0.5 border border-[#242932] text-[11px] font-mono text-[#39D9FF]">
                        {item.interview_type || "ai_adaptive"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs font-mono text-[#35D07F]">
                      {item.overall_score !== null && item.overall_score !== undefined
                        ? `${item.overall_score}% Overall Score`
                        : `${item.questions_answered || 0} / ${item.total_questions || 5} Questions`}
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
    </div>
  );
}
