"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  ListChecks,
  Video,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Activity,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<"screening" | "mcq" | "avatar" | "scorecard">("scorecard");
  const [selectedQuote, setSelectedQuote] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>("B");
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(48);
  const [shortlisted, setShortlisted] = useState(false);

  // Simulated countdown timer for MCQ demo
  useEffect(() => {
    if (activeTab !== "mcq") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 10 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-border/80 bg-white shadow-xl">
      {/* Top Application Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 bg-[#FAFAF8] px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-[#111111] font-semibold text-white text-xs shadow-xs">
            AR
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#35C88A] ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Alex Rivera</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-2 py-0.5 text-[11px] font-medium text-[#167348]">
                <span className="size-1.5 rounded-full bg-[#35C88A] animate-pulse-subtle" />
                Qualified Candidate
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Role: <span className="font-medium text-text-primary">Staff AI Infrastructure &amp; Systems Engineer</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-text-muted hidden sm:inline">Composite Decision Index:</span>
          <div className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 font-mono shadow-2xs">
            <span className="font-bold text-[#111111] text-sm">86.7</span>
            <span className="text-[11px] text-text-muted">/100</span>
            <span className="ml-1 rounded bg-[#35C88A]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#167348]">
              Strong Hire
            </span>
          </div>
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
            badge: "Grounded",
          },
          {
            id: "mcq",
            label: "Tier 2: Dynamic MCQs",
            weight: "25% weight",
            icon: ListChecks,
            score: "80%",
            badge: "Server-Timed",
          },
          {
            id: "avatar",
            label: "Tier 3: Avatar Interview",
            weight: "35% weight",
            icon: Video,
            score: "90%",
            badge: "Live WebRTC",
          },
          {
            id: "scorecard",
            label: "Audit Scorecard",
            weight: "Deterministic",
            icon: Award,
            score: "86.7%",
            badge: "Verdict",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "group relative flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-center transition-all whitespace-nowrap min-w-[150px] cursor-pointer",
                isActive
                  ? "border-[#111111] bg-[#F7F7F4] text-[#111111] font-semibold"
                  : "border-transparent text-text-secondary hover:bg-[#FAFAF8] hover:text-text-primary",
              )}
            >
              <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-[#111111]")} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] tabular-nums font-semibold transition-colors",
                  isActive ? "bg-[#111111] text-white" : "bg-[#F1F1ED] text-text-muted group-hover:bg-[#E8E8E3]",
                )}
              >
                {tab.score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Stage Content */}
      <div className="p-6 sm:p-8 bg-white min-h-[320px]">
        {/* Tier 1: CV Screening Tab */}
        {activeTab === "screening" && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Grounded Resume Evidence Extraction
                  </h4>
                  <span className="rounded bg-black/[0.05] px-2 py-0.5 text-[11px] font-mono font-medium text-text-secondary">
                    Tier 1 · 40% Weight
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Scores are calculated strictly from parsed resume quote citations. Zero hallucinations allowed.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#167348] font-medium bg-[#ECF9F3] px-3 py-1 rounded-full border border-[#35C88A]/25">
                <ShieldCheck className="size-3.5 text-[#35C88A]" /> 0% Hallucination Isolation Active
              </span>
            </div>

            {/* Interactive Quotes vs Requirements Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              {[
                {
                  id: 0,
                  requirement: "High-throughput asynchronous APIs and microservices handling concurrent traffic.",
                  category: "Architecture & Scale",
                  quote: "Architected high-throughput FastAPI and Redis microservices processing 4,200 req/sec across Docker clusters.",
                  similarity: "96.4% match",
                  page: "Page 1, Paragraph 4",
                },
                {
                  id: 1,
                  requirement: "PostgreSQL optimization, relational database modeling, and schema migrations.",
                  category: "Data Systems",
                  quote: "Designed PostgreSQL schemas with custom indexing and transactional RPC functions, reducing query latencies by 42%.",
                  similarity: "94.8% match",
                  page: "Page 2, Section 3",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedQuote(item.id)}
                  className={cn(
                    "interactive-card group relative cursor-pointer rounded-xl border p-4.5 transition-all",
                    selectedQuote === item.id
                      ? "border-[#111111] bg-[#FAFAF8] shadow-sm ring-1 ring-[#111111]/10"
                      : "border-border bg-white hover:border-black/20 hover:bg-[#FAFAF8]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-[#ECF9F3] px-2 py-0.5 text-[10px] font-semibold text-[#167348]">
                      {item.similarity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-text-primary leading-snug">
                    {item.requirement}
                  </p>

                  <div className="mt-3 relative overflow-hidden rounded-lg border border-[#35C88A]/35 bg-white p-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#167348] flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                        Verified Quote Citation:
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">{item.page}</span>
                    </div>
                    <p className="mt-1.5 italic text-text-secondary leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[#F7F7F4] px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#35C88A] text-white text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-medium text-text-primary">
                  Threshold Check: 88.0% Score &ge; 70.0% Gate.
                </span>
                <span className="text-text-muted hidden sm:inline">— Automatically unlocked Tier 2 Assessment.</span>
              </div>
              <button
                onClick={() => setActiveTab("mcq")}
                className="flex items-center gap-1 font-semibold text-[#111111] hover:underline cursor-pointer"
              >
                <span>View Dynamic Assessment</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tier 2: Dynamic MCQs Tab */}
        {activeTab === "mcq" && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Context-Aware Dynamic Assessment (Question 4 of 10)
                  </h4>
                  <span className="rounded bg-black/[0.05] px-2 py-0.5 text-[11px] font-mono font-medium text-text-secondary">
                    Tier 2 · 25% Weight
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Generated in real-time from candidate resume projects. Prevents leaked static questions.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-[#FAFAF8] px-3 py-1.5 text-xs font-mono font-semibold tabular-nums text-text-primary shadow-2xs">
                <Clock className="size-3.5 text-[#FF4F62] animate-pulse" />
                <span>{secondsRemaining}s server lock</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted mb-2">
                <span className="rounded bg-[#FAFAF8] border border-border px-1.5 py-0.5 font-semibold text-text-primary">
                  Resume Context: Redis Microservices
                </span>
                <span>• Single-attempt server lock</span>
              </div>
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
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={cn(
                      "interactive-card flex items-start gap-2.5 rounded-lg border p-3.5 text-xs text-left transition-all cursor-pointer",
                      selectedOption === opt.id && opt.correct
                        ? "border-[#35C88A] bg-[#ECF9F3] ring-1 ring-[#35C88A] font-medium text-text-primary"
                        : selectedOption === opt.id
                          ? "border-red-400 bg-red-50 text-red-900"
                          : "border-border bg-[#FAFAF8] hover:bg-white hover:border-black/20 text-text-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded font-bold text-[11px] transition-colors",
                        selectedOption === opt.id && opt.correct
                          ? "bg-[#35C88A] text-white"
                          : selectedOption === opt.id
                            ? "bg-red-500 text-white"
                            : "bg-white border border-border text-text-muted",
                      )}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {selectedOption === opt.id && opt.correct && (
                      <Check className="size-4 shrink-0 text-[#167348]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary border-t border-border/60 pt-3">
              <span className="flex items-center gap-1.5 text-text-primary font-medium">
                <ShieldCheck className="size-3.5 text-[#35C88A]" />
                Anti-Cheating Integrity: Answers locked into PostgreSQL with tamper-evident audit log.
              </span>
              <button
                onClick={() => setActiveTab("avatar")}
                className="flex items-center gap-1 font-semibold text-[#111111] hover:underline cursor-pointer"
              >
                <span>View Conversational Interview</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tier 3: Avatar Interview Tab */}
        {activeTab === "avatar" && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Conversational Talking Avatar Interview
                  </h4>
                  <span className="rounded bg-black/[0.05] px-2 py-0.5 text-[11px] font-mono font-medium text-text-secondary">
                    Tier 3 · 35% Weight
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  5-stage progressive technical probe. Standardized scoring rubric without facial or accent bias.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-3 py-1 text-xs font-medium text-[#167348]">
                  <span className="size-2 rounded-full bg-[#35C88A] animate-pulse-subtle" />
                  Live WebRTC • 32ms RTT
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              {/* Simulated Avatar Player Box */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-[#121212] p-6 text-white min-h-[230px] shadow-sm">
                <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-white/20 bg-[#1e1e1e] shadow-inner">
                  <div className="size-20 rounded-full bg-gradient-to-tr from-[#FF4F62] to-[#FF9272] opacity-80 blur-xs" />
                  <Video className="absolute size-8 text-white drop-shadow" />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs backdrop-blur-md">
                  <Volume2 className="size-3.5 text-[#FF9272] animate-pulse" />
                  <span>Interviewer Persona Nova · Question #4</span>
                </div>

                {/* Live Dynamic Audio Frequency Bars */}
                <div className="mt-3 flex items-center gap-1.5 h-6">
                  {isPlayingAudio ? (
                    <>
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-1" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-2" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-3" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-4" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-5" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-6" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-3" />
                      <span className="w-1 bg-[#FF9272] rounded-full wave-bar-1" />
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-white/60">
                      <span>Audio Paused</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="mt-3 text-[11px] font-medium text-white/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="size-3" /> Pause Avatar Speech Simulation
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3" /> Play Avatar Speech Simulation
                    </>
                  )}
                </button>
              </div>

              {/* Spoken Question & Candidate Response */}
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-[#FAFAF8] p-4 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-primary mb-1">
                    <span>Stage 4 Adaptive Follow-Up (Technical Depth):</span>
                    <span className="text-[10px] font-mono text-text-muted">Audio Synthesis Nova</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed italic">
                    &ldquo;Alex, you mentioned using distributed locks in your FastAPI service. How did you ensure lock expiration safely without risking a split-brain condition if a worker thread hangs on an unhandled exception?&rdquo;
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-white p-4 text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary mb-1">
                    <span>Candidate Live Speech Transcript:</span>
                    <span className="text-[10px] font-mono text-[#167348]">Transcribed in 120ms</span>
                  </div>
                  <p className="text-text-primary leading-relaxed">
                    &ldquo;We implemented Redlock with short TTL leases and an asynchronous heartbeat extension task. If a worker blocked on I/O, the lease would safely lapse before allowing another worker to acquire the lock...&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-2.5 text-[11px]">
                    <span className="text-text-muted">Rubric Depth Evaluation:</span>
                    <span className="font-semibold text-[#167348] bg-[#ECF9F3] px-2.5 py-0.5 rounded-full border border-[#35C88A]/20">
                      Score: 90.0% (Exceptional Architecture Clarity)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consolidated Scorecard Tab */}
        {activeTab === "scorecard" && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Consolidated Audit Scorecard &amp; Decision Index
                  </h4>
                  <span className="rounded bg-black/[0.05] px-2 py-0.5 text-[11px] font-mono font-medium text-text-secondary">
                    Deterministic Roll-Up
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Weighted formula: S = (0.40 × CV) + (0.25 × MCQ) + (0.35 × Interview). Auditable and explainable.
                </p>
              </div>
              <span className="rounded-full bg-[#ECF9F3] border border-[#35C88A]/30 px-3 py-1 text-xs font-semibold text-[#167348]">
                Recommendation: STRONG HIRE
              </span>
            </div>

            {/* Score Formula Cards */}
            <div className="grid gap-3.5 sm:grid-cols-3">
              <div className="interactive-card rounded-xl border border-border bg-[#FAFAF8] p-4 text-center">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-text-muted">Tier 1: CV Screening</span>
                  <span className="rounded bg-black/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-text-secondary">40% weight</span>
                </div>
                <div className="my-2 text-3xl font-bold font-mono tracking-tight text-text-primary">88.0%</div>
                <div className="w-full bg-black/[0.06] rounded-full h-1.5 overflow-hidden mb-2">
                  <div className="bg-[#111111] h-1.5 rounded-full" style={{ width: "88%" }} />
                </div>
                <span className="text-[11px] text-text-secondary font-mono">Contributes: +35.2 pts</span>
              </div>

              <div className="interactive-card rounded-xl border border-border bg-[#FAFAF8] p-4 text-center">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-text-muted">Tier 2: MCQs</span>
                  <span className="rounded bg-black/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-text-secondary">25% weight</span>
                </div>
                <div className="my-2 text-3xl font-bold font-mono tracking-tight text-text-primary">80.0%</div>
                <div className="w-full bg-black/[0.06] rounded-full h-1.5 overflow-hidden mb-2">
                  <div className="bg-[#111111] h-1.5 rounded-full" style={{ width: "80%" }} />
                </div>
                <span className="text-[11px] text-text-secondary font-mono">Contributes: +20.0 pts</span>
              </div>

              <div className="interactive-card rounded-xl border border-border bg-[#FAFAF8] p-4 text-center">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-text-muted">Tier 3: AI Interview</span>
                  <span className="rounded bg-black/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-text-secondary">35% weight</span>
                </div>
                <div className="my-2 text-3xl font-bold font-mono tracking-tight text-text-primary">90.0%</div>
                <div className="w-full bg-black/[0.06] rounded-full h-1.5 overflow-hidden mb-2">
                  <div className="bg-[#111111] h-1.5 rounded-full" style={{ width: "90%" }} />
                </div>
                <span className="text-[11px] text-text-secondary font-mono">Contributes: +31.5 pts</span>
              </div>
            </div>

            {/* Composite Result Strip with Interactive Decision Feedback */}
            <div className="rounded-xl border border-border bg-[#F7F7F4] p-4.5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111]">
                      Composite Decision Score: 86.7 / 100.0
                    </span>
                    <span className="rounded bg-[#35C88A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#167348]">
                      Passed 80.0% High-Bar
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    Formula: (0.40 × 88.0) + (0.25 × 80.0) + (0.35 × 90.0) = 86.7. Complete audit trail stored in Supabase.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShortlisted(!shortlisted)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-xs font-medium transition-all shadow-xs cursor-pointer",
                      shortlisted
                        ? "bg-[#167348] text-white"
                        : "bg-[#111111] text-white hover:bg-[#202020] hover:-translate-y-0.5",
                    )}
                  >
                    {shortlisted ? (
                      <>
                        <Check className="size-3.5" /> Shortlisted Candidate
                      </>
                    ) : (
                      <>
                        <span>Shortlist Candidate</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => alert("Audit report CSV exported with verified citations.")}
                    className="rounded-[9px] border border-border bg-white px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-[#F6F6F2] transition-colors cursor-pointer"
                  >
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
