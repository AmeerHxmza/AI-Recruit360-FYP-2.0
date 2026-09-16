"use client";

import { useState } from "react";
import {
  FileText,
  ListChecks,
  Video,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<"screening" | "mcq" | "avatar" | "scorecard">(
    "scorecard",
  );

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-border/90 bg-white shadow-xl">
      {/* Top Application Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 bg-[#FAFAF7] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#111111] font-semibold text-white text-xs">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Alex Rivera</span>
              <span className="rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-2 py-0.5 text-[11px] font-medium text-[#167348]">
                ● Qualified Candidate
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Role: <span className="font-medium text-text-primary">Senior Python &amp; AI Infrastructure Engineer</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">Overall Match:</span>
          <span className="rounded-md bg-gradient-to-r from-[#FF4F62] to-[#ED3F74] px-2.5 py-1 font-semibold text-white shadow-2xs">
            86.7% • Strong Hire
          </span>
        </div>
      </div>

      {/* Stage Navigation Tabs */}
      <div className="flex border-b border-border/80 bg-white text-xs font-medium overflow-x-auto">
        {[
          {
            id: "screening",
            label: "Tier 1: CV Screening",
            weight: "40% weight",
            icon: FileText,
            score: "88%",
          },
          {
            id: "mcq",
            label: "Tier 2: Dynamic MCQs",
            weight: "25% weight",
            icon: ListChecks,
            score: "80%",
          },
          {
            id: "avatar",
            label: "Tier 3: Avatar Interview",
            weight: "35% weight",
            icon: Video,
            score: "90%",
          },
          {
            id: "scorecard",
            label: "Consolidated Scorecard",
            weight: "Final Verdict",
            icon: Award,
            score: "86.7%",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-center transition-colors whitespace-nowrap min-w-[140px] cursor-pointer",
                isActive
                  ? "border-[#111111] bg-[#F6F6F2] text-[#111111] font-semibold"
                  : "border-transparent text-text-secondary hover:bg-[#FAFAF7] hover:text-text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.2 text-[10px] tabular-nums font-semibold",
                  isActive ? "bg-[#111111] text-white" : "bg-[#F1F1ED] text-text-muted",
                )}
              >
                {tab.score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Stage Content */}
      <div className="p-6 sm:p-8 bg-white">
        {activeTab === "screening" && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Grounded Resume Evidence Extraction (Score: 88.0%)
                </h4>
                <p className="text-xs text-text-secondary">
                  Every score is grounded in exact quote citations parsed from candidate resumes.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-[#167348] font-medium bg-[#ECF9F3] px-2.5 py-1 rounded-full border border-[#35C88A]/20">
                <ShieldCheck className="size-3.5 text-[#35C88A]" /> 0% Hallucination Isolation
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-[#FAFAF7] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Job Requirement
                </span>
                <p className="mt-1 text-xs font-medium text-text-primary">
                  High-throughput asynchronous APIs and microservices handling concurrent traffic.
                </p>
                <div className="mt-3 rounded-lg border border-[#35C88A]/30 bg-white p-3 text-xs text-text-primary shadow-2xs">
                  <span className="font-semibold text-[#167348] flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-[#35C88A]" /> Verified Resume Quote:
                  </span>
                  <p className="mt-1.5 italic text-text-secondary leading-relaxed">
                    &ldquo;Architected high-throughput FastAPI and Redis microservices processing 4,200 req/sec across Docker clusters.&rdquo;
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#FAFAF7] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Job Requirement
                </span>
                <p className="mt-1 text-xs font-medium text-text-primary">
                  PostgreSQL optimization, relational database modeling, and schema migrations.
                </p>
                <div className="mt-3 rounded-lg border border-[#35C88A]/30 bg-white p-3 text-xs text-text-primary shadow-2xs">
                  <span className="font-semibold text-[#167348] flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-[#35C88A]" /> Verified Resume Quote:
                  </span>
                  <p className="mt-1.5 italic text-text-secondary leading-relaxed">
                    &ldquo;Designed PostgreSQL schemas with custom indexing and transactional RPC functions, reducing query latencies by 42%.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-[#F6F6F2] px-4 py-2.5 text-xs text-text-primary">
              <span>Threshold passed: 88.0% &ge; 70.0% standard. Automatically invited to dynamic assessment.</span>
              <ChevronRight className="size-4 text-text-muted" />
            </div>
          </div>
        )}

        {activeTab === "mcq" && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Candidate-Tailored Assessment (Question 4 of 10)
                </h4>
                <p className="text-xs text-text-secondary">
                  Generated specifically from the candidate&apos;s actual projects. No leaked static question banks.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-[#FAFAF7] px-2.5 py-1 text-xs font-semibold tabular-nums text-text-primary">
                <Clock className="size-3.5 text-[#FF4F62]" />
                <span>48s remaining</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 shadow-2xs">
              <p className="text-sm font-medium leading-relaxed text-text-primary">
                In your project using Redis caching for high-throughput FastAPI endpoints, what is the most appropriate caching strategy to prevent cache stampede when a hot key expires under heavy concurrent load?
              </p>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {[
                  { id: "A", text: "Purge all keys synchronously upon cache invalidation" },
                  { id: "B", text: "Implement probabilistic early expiration (XFetch) or mutex locking on cache miss", correct: true },
                  { id: "C", text: "Increase Redis memory capacity to unlimited without eviction" },
                  { id: "D", text: "Disable read replicas and direct all queries to PostgreSQL primary" },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg border p-3 text-xs transition-colors",
                      opt.correct
                        ? "border-[#35C88A] bg-[#ECF9F3] font-medium text-text-primary"
                        : "border-border bg-[#FAFAF7] text-text-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded font-bold text-xs",
                        opt.correct ? "bg-[#35C88A] text-white" : "bg-white border border-border text-text-muted",
                      )}
                    >
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">Anti-Cheating Integrity:</span> Server-enforced 60s question countdown with sequential locking. Answers are immutable upon submission.
            </p>
          </div>
        )}

        {activeTab === "avatar" && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Adaptive Avatar Interview (Simli AI + Live Voice)
                </h4>
                <p className="text-xs text-text-secondary">
                  5-stage progressive conversational dialogue adapting dynamically to answers.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-2.5 py-0.5 text-xs font-medium text-[#167348]">
                <span className="size-2 rounded-full bg-[#35C88A] animate-pulse" />
                Interviewer Live • Simli WebRTC
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              {/* Simulated Avatar Player Box */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-[#161616] p-6 text-white min-h-[220px]">
                <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-[#FF4F62]/60 bg-[#222] shadow-lg">
                  <div className="size-20 rounded-full bg-gradient-to-tr from-[#FF4F62] to-[#FF9272] opacity-80" />
                  <Video className="absolute size-8 text-white" />
                </div>
                
                <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-xs">
                  <Volume2 className="size-3.5 text-[#FF9272] animate-pulse" />
                  <span>AI Recruiter Nova · Speaking Question #4</span>
                </div>

                <div className="mt-2 flex items-center gap-1">
                  {[40, 75, 55, 90, 60, 80, 45, 70, 85, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-[#FF9272] animate-pulse"
                      style={{ height: `${h * 0.25}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>

              {/* Spoken Question & Candidate Response */}
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-[#FAFAF7] p-3.5 text-xs">
                  <span className="font-semibold text-text-primary">
                    Stage 4 Adaptive Probe (Technical Depth):
                  </span>
                  <p className="mt-1 text-text-secondary leading-relaxed">
                    &ldquo;Alex, you mentioned earlier using distributed locks in your FastAPI service. Can you explain how you ensured lock expiration safely without risking a split-brain condition if a worker thread hangs?&rdquo;
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-white p-3.5 text-xs shadow-2xs">
                  <span className="font-semibold text-text-secondary">
                    Candidate Audio Transcript:
                  </span>
                  <p className="mt-1 text-text-primary leading-relaxed">
                    &ldquo;We used Redlock with short TTL leases and an asynchronous heartbeat extension task. If a worker blocked on I/O, the lease would safely lapse before allowing another worker to acquire the lock...&rdquo;
                  </p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[11px] text-text-muted">
                    <span>Evaluated by AI Engine</span>
                    <span className="font-semibold text-[#167348] bg-[#ECF9F3] px-2 py-0.5 rounded">
                      Score: 92/100 (High Depth &amp; Clarity)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scorecard" && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Consolidated Audit Scorecard &amp; Decision
                </h4>
                <p className="text-xs text-text-secondary">
                  Auditable mathematical formula: 40% CV + 25% Assessment + 35% Interview.
                </p>
              </div>
              <span className="rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-3 py-1 text-xs font-semibold text-[#167348]">
                Recommendation: STRONG HIRE
              </span>
            </div>

            {/* Score Formula Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-[#FAFAF7] p-4 text-center">
                <span className="text-[11px] font-semibold text-text-muted">CV Screening (40%)</span>
                <div className="my-1.5 text-2xl font-bold text-text-primary">88.0%</div>
                <span className="text-[11px] text-text-secondary">Contribution: 35.2 pts</span>
              </div>
              <div className="rounded-xl border border-border bg-[#FAFAF7] p-4 text-center">
                <span className="text-[11px] font-semibold text-text-muted">Assessment (25%)</span>
                <div className="my-1.5 text-2xl font-bold text-text-primary">80.0%</div>
                <span className="text-[11px] text-text-secondary">Contribution: 20.0 pts</span>
              </div>
              <div className="rounded-xl border border-border bg-[#FAFAF7] p-4 text-center">
                <span className="text-[11px] font-semibold text-text-muted">AI Interview (35%)</span>
                <div className="my-1.5 text-2xl font-bold text-text-primary">90.0%</div>
                <span className="text-[11px] text-text-secondary">Contribution: 31.5 pts</span>
              </div>
            </div>

            {/* Composite Result Strip */}
            <div className="rounded-xl border border-border bg-[#F6F6F2] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#121212]">
                    Composite Decision Index: 86.7 / 100.0
                  </span>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Exceeds high-bar threshold (85.0%). Ready for Recruiter 1-Click Shortlist or Offer.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-[9px] bg-[#111111] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#202020] transition-colors cursor-pointer">
                    Shortlist Candidate
                  </button>
                  <button className="rounded-[9px] border border-border bg-white px-4 py-2 text-xs font-medium text-text-primary hover:bg-[#F6F6F2] transition-colors cursor-pointer">
                    Export Audit CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
