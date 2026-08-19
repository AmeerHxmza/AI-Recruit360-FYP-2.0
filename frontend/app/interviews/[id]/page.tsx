"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { mockInterviews } from "@/lib/mock/interviews";
import { ArrowLeft, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";

export default function InterviewWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const intId = (params?.id as string) || "int-001";

  const interview = mockInterviews.find((i) => i.id === intId) || mockInterviews[0];

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Interviews", interview.candidateName]}>
      <PageHeader
        title={`AI Interview Workspace: ${interview.candidateName}`}
        description={`${interview.role} · ${interview.interviewType}`}
        badge={<Badge variant="ai">Question {interview.currentQuestion}/{interview.totalQuestions}</Badge>}
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
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert("Next Question triggered (UI Mock)")}
            >
              Next Question
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                alert("Interview ended (UI Mock). Navigating to evaluations...");
                router.push("/evaluations");
              }}
            >
              End Interview &amp; Synthesize Scorecard
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: Active Question & Live Transcript */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Question Card */}
          <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Active Adaptive Question #{interview.currentQuestion}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#39D9FF]">
                {interview.currentQuestion} of {interview.totalQuestions} Questions
              </span>
            </div>

            <p className="text-sm font-medium text-[#F5F7FA] leading-relaxed">
              &quot;{interview.activeQuestionText}&quot;
            </p>

            <div className="space-y-1.5 pt-2 border-t border-[#242932]">
              <div className="flex items-center justify-between text-xs text-[#A7AFBC]">
                <span>Interview Progress</span>
                <span className="font-mono text-[#39D9FF] font-semibold">40%</span>
              </div>
              <Progress value={40} variant="ai" size="sm" />
            </div>
          </Card>

          {/* Transcript Box */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <MessageSquare className="h-4 w-4 text-[#39D9FF]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Real-Time Conversation Transcript
              </h3>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {interview.transcript.map((tr) => (
                <div
                  key={tr.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                    tr.speaker === "AI System"
                      ? "bg-[#171B21] border-[#39D9FF]/30 text-[#F5F7FA]"
                      : "bg-[#0D0F12] border-[#242932] text-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className={tr.speaker === "AI System" ? "text-[#39D9FF]" : "text-[#35D07F]"}>
                      {tr.speaker}
                    </span>
                    <span className="text-[10px] text-[#68717E] font-mono">{tr.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{tr.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Secondary Column: Candidate Summary & Real-Time AI Scorecard */}
        <div className="lg:col-span-4 space-y-6">
          {/* Candidate Card */}
          <Card className="p-5 border-[#242932] bg-[#12151A] space-y-3">
            <div className="flex items-center gap-3">
              <Avatar fallback={interview.avatarFallback} size="md" status="ai" />
              <div className="flex flex-col">
                <span className="font-semibold text-[#F5F7FA] text-xs">{interview.candidateName}</span>
                <span className="text-[11px] text-[#A7AFBC]">{interview.role}</span>
              </div>
            </div>
          </Card>

          {/* Real-Time AI Evaluation Scorecard */}
          <Card elevated className="p-5 border-[#35D07F]/40 bg-[#171B21] space-y-4 shadow-[0_0_20px_rgba(53,208,127,0.06)]">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#35D07F]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Live AI Evaluation
                </h3>
              </div>
              <Badge variant="success" className="text-[10px]">
                Real-Time Scoring
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-[#A7AFBC] mb-1">
                  <span>Technical Depth</span>
                  <span className="font-bold text-[#35D07F] font-mono">{interview.evaluationScores.technicalDepth}%</span>
                </div>
                <Progress value={interview.evaluationScores.technicalDepth} variant="success" size="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#A7AFBC] mb-1">
                  <span>Problem Solving</span>
                  <span className="font-bold text-[#39D9FF] font-mono">{interview.evaluationScores.problemSolving}%</span>
                </div>
                <Progress value={interview.evaluationScores.problemSolving} variant="ai" size="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#A7AFBC] mb-1">
                  <span>Communication</span>
                  <span className="font-bold text-[#F5F7FA] font-mono">{interview.evaluationScores.communication}%</span>
                </div>
                <Progress value={interview.evaluationScores.communication} variant="default" size="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#A7AFBC] mb-1">
                  <span>Reasoning &amp; Logic</span>
                  <span className="font-bold text-[#63E3FF] font-mono">{interview.evaluationScores.reasoning}%</span>
                </div>
                <Progress value={interview.evaluationScores.reasoning} variant="ai" size="sm" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
