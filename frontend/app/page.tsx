import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { InteractiveShowcase } from "@/components/landing/interactive-showcase";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#121212] selection:bg-[#FF4F62] selection:text-white">
      {/* BeatView Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 border-b border-[rgba(20,20,20,0.06)] bg-[rgba(250,250,247,0.86)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-6 sm:px-8">
          <BrandLogo size="md" />

          <nav className="hidden items-center gap-7 text-[14px] font-medium text-[#4F4F4C] md:flex">
            <a href="#workflow" className="transition-colors hover:text-[#111111]">
              Workflow
            </a>
            <a href="#features" className="transition-colors hover:text-[#111111]">
              3-Tier Engine
            </a>
            <a href="#interactive-demo" className="transition-colors hover:text-[#111111]">
              Live Demo
            </a>
            <a href="#scoring" className="transition-colors hover:text-[#111111]">
              Scoring Model
            </a>
            <a href="#comparison" className="transition-colors hover:text-[#111111]">
              Comparison
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#111111]">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[9px] px-3.5 py-2 text-[14px] font-medium text-[#121212] transition-colors hover:bg-[#F1F1ED]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-[9px] bg-[#111111] px-4 py-2 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-[#202020] hover:-translate-y-0.5"
            >
              <span>Create workspace</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* BeatView-Style Centered Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="mx-auto max-w-[920px] text-center">
              {/* Announcement Pill with Green Status Dot */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-white/90 px-3.5 py-1 text-xs font-medium text-[#121212] shadow-2xs">
                <span className="size-1.5 rounded-full bg-[#35C88A]" />
                <span>New — AI-Powered Hiring from Resume to Interview</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="mx-auto mt-6 text-4xl font-[520] tracking-[-0.045em] text-[#121212] sm:text-6xl lg:text-[72px] lg:leading-[1.01]">
                AI-Powered Hiring.
                <br />
                From Resume to Interview.
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-6 max-w-[660px] text-base leading-[1.55] text-[#60605D] sm:text-lg">
                Screen candidates with grounded evidence, generate adaptive project assessments,
                and conduct structured conversational AI interviews through one unified recruitment workflow.
              </p>

              {/* Solid Black Primary CTA & Secondary Action */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 rounded-[9px] bg-[#111111] px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#202020] hover:-translate-y-0.5"
                >
                  <span>Launch Recruiter Workspace</span>
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#workflow"
                  className="flex items-center gap-2 rounded-[9px] border border-[#D8D8D2] bg-white px-6 py-3 text-[14px] font-medium text-[#161616] transition-all hover:bg-[#F6F6F2] hover:-translate-y-0.5"
                >
                  <span>Explore 3-Tier Workflow</span>
                </a>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-[#E7E7E2] pt-6 text-xs text-[#60605D]">
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  40% Grounded CV Quotes
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  25% Dynamic Server-Timed MCQs
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  35% Conversational Avatar Interview
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <ShieldCheck className="size-4 text-[#111111]" />
                  NYC LL144 &amp; EU AI Act Auditable
                </span>
              </div>
            </div>

            {/* Product Screenshot / Interactive Showcase with Atmospheric Warm Glow */}
            <div id="interactive-demo" className="relative mt-14 scroll-mt-24 sm:mt-18">
              {/* Overlapping Warm Atmospheric Glow (Section 3 of spec) */}
              <div className="hero-glow pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-70" />

              {/* Clean Browser / App Frame */}
              <div className="overflow-hidden rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.07)]">
                {/* Browser-style Titlebar */}
                <div className="flex h-11 items-center justify-between border-b border-[#E7E7E2] bg-[#F7F7F4] px-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#E7E7E2]" />
                    <span className="size-2.5 rounded-full bg-[#E7E7E2]" />
                    <span className="size-2.5 rounded-full bg-[#E7E7E2]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-[#E7E7E2] bg-white px-3 py-1 text-[11px] font-mono text-[#8C8C87]">
                    <Lock className="size-3 text-[#8C8C87]" />
                    <span>ai-recruit360.workspace / evaluation</span>
                  </div>
                  <div className="w-14" />
                </div>

                {/* Embedded Interactive Product Cockpit */}
                <InteractiveShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Connected Recruitment Workflow Section (Section 48 of spec) */}
        <section id="workflow" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#F6F6F2] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="text-center">
              <p className="eyebrow">RECRUITMENT PIPELINE</p>
              <h2 className="text-3xl font-[520] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                A Connected, End-to-End Workflow
              </h2>
              <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.55] text-[#60605D]">
                Every application moves through an auditable progression. No fragmented tools or disconnected candidate portals.
              </p>
            </div>

            {/* Connected Process Flow */}
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {[
                {
                  step: "01",
                  title: "CV Upload",
                  desc: "Direct PDF/DOCX resume upload via applicant portal",
                  accent: "border-[#E7E7E2]",
                },
                {
                  step: "02",
                  title: "AI Screening",
                  desc: "Verifiable quote citation extraction & 70% gate (40% weight)",
                  accent: "border-[#FF4F62]/40 bg-white",
                  highlight: true,
                },
                {
                  step: "03",
                  title: "Dynamic MCQs",
                  desc: "Candidate-tailored questions with 60s server timers (25% weight)",
                  accent: "border-[#E7E7E2]",
                },
                {
                  step: "04",
                  title: "AI Interview",
                  desc: "Conversational talking avatar with adaptive dialogue (35% weight)",
                  accent: "border-[#ED3F74]/40 bg-white",
                  highlight: true,
                },
                {
                  step: "05",
                  title: "Composite Score",
                  desc: "Deterministic mathematical scorecard with zero black-box bias",
                  accent: "border-[#E7E7E2]",
                },
                {
                  step: "06",
                  title: "Human Decision",
                  desc: "Recruiter 1-click decision: Shortlist, Interview, or Reject",
                  accent: "border-[#111111]/30 bg-white",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-[14px] border bg-white p-5 shadow-xs transition-all hover:border-[#111111] hover:shadow-md ${item.accent}`}
                >
                  <span className="text-[11px] font-mono font-semibold text-[#8C8C87]">
                    {item.step}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-[#121212]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-[1.5] text-[#60605D]">
                    {item.desc}
                  </p>
                  {item.highlight && (
                    <span className="mt-3 inline-block rounded-full bg-[#FF4F62]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF4F62]">
                      AI Grounded
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asymmetric Feature Cards (Section 19 of spec: Large feature + two smaller features) */}
        <section id="features" className="scroll-mt-20 border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="text-center">
              <p className="eyebrow">SYSTEM ARCHITECTURE</p>
              <h2 className="text-3xl font-[520] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                The 3-Tier Autonomous Recruitment Engine
              </h2>
              <p className="mx-auto mt-4 max-w-[640px] text-base leading-[1.55] text-[#60605D]">
                Built to solve the fundamental flaw in modern recruitment: unverified resume buzzwords and leaked multiple-choice question banks.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {/* Large Feature 1 (Spans 2 columns on desktop) */}
              <div className="panel flex flex-col justify-between p-8 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#FF4F62]/10 px-3 py-1 text-xs font-semibold text-[#FF4F62]">
                      Tier 1 · 40% Composite Weight
                    </span>
                    <span className="text-xs font-mono text-[#8C8C87]">Grounded Extraction</span>
                  </div>

                  <h3 className="mt-5 text-2xl font-[550] tracking-[-0.025em] text-[#121212]">
                    Verifiable CV Evidence Grounding
                  </h3>
                  <p className="mt-3 max-w-[620px] text-sm leading-[1.6] text-[#60605D]">
                    Standard keyword matchers reward candidates for stuffing technical buzzwords into their resumes.
                    AI-Recruit360 extracts concrete quote citations directly from the resume to validate actual project achievements and architectural ownership.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-[#E7E7E2] pt-6">
                    <div className="rounded-lg bg-[#FAFAF7] p-3.5 border border-[#E7E7E2]">
                      <span className="text-xs font-semibold text-[#121212]">Quote Extraction</span>
                      <p className="mt-1 text-xs text-[#60605D]">Direct text evidence citations parsed verbatim</p>
                    </div>
                    <div className="rounded-lg bg-[#FAFAF7] p-3.5 border border-[#E7E7E2]">
                      <span className="text-xs font-semibold text-[#121212]">Strict Gating</span>
                      <p className="mt-1 text-xs text-[#60605D]">Automatic 70% threshold gating before assessments</p>
                    </div>
                    <div className="rounded-lg bg-[#FAFAF7] p-3.5 border border-[#E7E7E2]">
                      <span className="text-xs font-semibold text-[#121212]">Zero Hallucination</span>
                      <p className="mt-1 text-xs text-[#60605D]">Pydantic schema isolation prevents fabrications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smaller Feature 2 */}
              <div className="panel flex flex-col justify-between p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#111111]/5 px-3 py-1 text-xs font-semibold text-[#121212]">
                      Tier 2 · 25% Weight
                    </span>
                    <span className="text-xs font-mono text-[#8C8C87]">Anti-Cheat</span>
                  </div>

                  <h3 className="mt-5 text-xl font-[550] tracking-[-0.025em] text-[#121212]">
                    Context-Aware Dynamic MCQs
                  </h3>
                  <p className="mt-3 text-xs leading-[1.6] text-[#60605D]">
                    Static testing question banks (iMocha, TestGorilla) are widely leaked on Reddit and Discord.
                    AI-Recruit360 synthesizes 10 technical scenarios tailored specifically to the candidate&apos;s actual resume projects.
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-[#E7E7E2] pt-4 text-xs text-[#60605D]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>PostgreSQL 60s server-enforced timer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Strict sequential question locking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Immutable recorded answer history</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Smaller Feature 3 */}
              <div className="panel flex flex-col justify-between p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#ED3F74]/10 px-3 py-1 text-xs font-semibold text-[#ED3F74]">
                      Tier 3 · 35% Weight
                    </span>
                    <span className="text-xs font-mono text-[#8C8C87]">Real-Time WebRTC</span>
                  </div>

                  <h3 className="mt-5 text-xl font-[550] tracking-[-0.025em] text-[#121212]">
                    Conversational Talking Avatar
                  </h3>
                  <p className="mt-3 text-xs leading-[1.6] text-[#60605D]">
                    Unlike passive one-way asynchronous video recordings (HireVue, Beatview), AI-Recruit360 deploys an interactive talking avatar via WebSockets that listens, clarifies, and asks progressive technical follow-ups.
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-[#E7E7E2] pt-4 text-xs text-[#60605D]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>5-stage progressive technical probe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Low-latency STT/TTS audio pipeline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Objective rubric scoring without facial bias</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Large Feature 4 (Spans 2 columns on desktop) */}
              <div className="panel flex flex-col justify-between p-8 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#35C88A]/10 px-3 py-1 text-xs font-semibold text-[#167348]">
                      Final Synthesis
                    </span>
                    <span className="text-xs font-mono text-[#8C8C87]">100% Transparent</span>
                  </div>

                  <h3 className="mt-5 text-2xl font-[550] tracking-[-0.025em] text-[#121212]">
                    Explainable AI Analysis &amp; Ethical Compliance
                  </h3>
                  <p className="mt-3 max-w-[620px] text-sm leading-[1.6] text-[#60605D]">
                    Every decision recommendation is supported by full audit trails. Recruiter dashboards display exact score contributions, strengths, gaps, and grounded citations—fully compliant with NYC Local Law 144 and EU AI Act.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#E7E7E2] pt-6 text-xs text-[#60605D]">
                    <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                      <CheckCircle2 className="size-4 text-[#35C88A]" />
                      Human-in-the-Loop Override
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                      <CheckCircle2 className="size-4 text-[#35C88A]" />
                      Multi-Tenant Isolation
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                      <CheckCircle2 className="size-4 text-[#35C88A]" />
                      Deterministic Math Scoring
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deterministic Scoring Model Breakdown */}
        <section id="scoring" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#FAFAF7] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="text-center">
              <p className="eyebrow">DETERMINISTIC FORMULATION</p>
              <h2 className="text-3xl font-[520] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                The Mathematical Composite Index
              </h2>
              <p className="mx-auto mt-4 max-w-[640px] text-base leading-[1.55] text-[#60605D]">
                No opaque black-box deep learning scores. We evaluate candidates through a verified, transparent weighted formula.
              </p>
            </div>

            {/* Formula Pill */}
            <div className="mx-auto mt-10 max-w-xl rounded-xl border border-[#E7E7E2] bg-white p-5 text-center shadow-xs">
              <span className="text-xs font-mono font-medium text-[#8C8C87]">Composite Score Equation</span>
              <div className="mt-2 text-lg sm:text-xl font-bold font-mono tracking-tight text-[#121212]">
                S = (0.40 × CV) + (0.25 × MCQ) + (0.35 × Interview)
              </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="panel p-6 text-center">
                <span className="text-3xl font-bold text-[#121212]">40%</span>
                <h3 className="mt-2 text-sm font-semibold text-[#121212]">CV Evidence Match</h3>
                <p className="mt-2 text-xs text-[#60605D]">
                  Measures alignment between verified resume experience and hard job requirements.
                </p>
              </div>

              <div className="panel p-6 text-center">
                <span className="text-3xl font-bold text-[#121212]">25%</span>
                <h3 className="mt-2 text-sm font-semibold text-[#121212]">Adaptive Project MCQs</h3>
                <p className="mt-2 text-xs text-[#60605D]">
                  Validates core domain competence with server-timed technical scenario questions.
                </p>
              </div>

              <div className="panel p-6 text-center">
                <span className="text-3xl font-bold text-[#121212]">35%</span>
                <h3 className="mt-2 text-sm font-semibold text-[#121212]">Interactive Avatar Interview</h3>
                <p className="mt-2 text-xs text-[#60605D]">
                  Assesses technical depth, problem-solving reasoning, and professional communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Matrix (BeatView Clean Table Style) */}
        <section id="comparison" className="scroll-mt-20 border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="text-center">
              <p className="eyebrow">MARKET COMPARISON</p>
              <h2 className="text-3xl font-[520] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                How AI-Recruit360 Compares
              </h2>
              <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.55] text-[#60605D]">
                A unified 3-tier recruitment platform engineered specifically to outperform fragmented enterprise tools.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-[14px] border border-[#E7E7E2] bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E7E7E2] bg-[#FAFAF7]">
                    <th className="p-4 font-semibold text-[#121212]">Feature Capability</th>
                    <th className="p-4 font-bold text-[#FF4F62] bg-[#FF4F62]/5">AI-Recruit360</th>
                    <th className="p-4 font-medium text-[#60605D]">Beatview.ai</th>
                    <th className="p-4 font-medium text-[#60605D]">iMocha</th>
                    <th className="p-4 font-medium text-[#60605D]">HireVue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E7E2]">
                  <tr className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="p-4 font-medium text-[#121212]">Grounded Resume Quote Extraction</td>
                    <td className="p-4 font-semibold text-[#167348] bg-[#FF4F62]/5">Yes (100% Citations)</td>
                    <td className="p-4 text-[#60605D]">Basic Matching</td>
                    <td className="p-4 text-[#60605D]">No (Test Only)</td>
                    <td className="p-4 text-[#60605D]">Keyword Scan</td>
                  </tr>
                  <tr className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="p-4 font-medium text-[#121212]">Dynamic Project-Tailored MCQs</td>
                    <td className="p-4 font-semibold text-[#167348] bg-[#FF4F62]/5">Yes (Resume-Specific)</td>
                    <td className="p-4 text-[#60605D]">No MCQs</td>
                    <td className="p-4 text-[#60605D]">Static Question Bank</td>
                    <td className="p-4 text-[#60605D]">No MCQs</td>
                  </tr>
                  <tr className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="p-4 font-medium text-[#121212]">Interactive Talking Avatar Interview</td>
                    <td className="p-4 font-semibold text-[#167348] bg-[#FF4F62]/5">Yes (Live WebRTC Avatar)</td>
                    <td className="p-4 text-[#60605D]">Asynchronous One-Way</td>
                    <td className="p-4 text-[#60605D]">None</td>
                    <td className="p-4 text-[#60605D]">Asynchronous Video</td>
                  </tr>
                  <tr className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="p-4 font-medium text-[#121212]">Deterministic Formula Scorecard</td>
                    <td className="p-4 font-semibold text-[#167348] bg-[#FF4F62]/5">Yes (40/25/35 Weights)</td>
                    <td className="p-4 text-[#60605D]">Qualitative Summaries</td>
                    <td className="p-4 text-[#60605D]">Test Score Only</td>
                    <td className="p-4 text-[#60605D]">Black-Box Predictive</td>
                  </tr>
                  <tr className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="p-4 font-medium text-[#121212]">Anti-Cheating Server Time Countdown</td>
                    <td className="p-4 font-semibold text-[#167348] bg-[#FF4F62]/5">Yes (PostgreSQL RPC)</td>
                    <td className="p-4 text-[#60605D]">N/A</td>
                    <td className="p-4 text-[#60605D]">Proctoring Extension</td>
                    <td className="p-4 text-[#60605D]">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Transparent Pricing Plans (Section 55 of spec) */}
        <section id="pricing" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#F6F6F2] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="text-center">
              <p className="eyebrow">SIMPLE SAAS TIERS</p>
              <h2 className="text-3xl font-[520] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                Transparent Workspace Pricing
              </h2>
              <p className="mx-auto mt-4 max-w-[540px] text-base leading-[1.55] text-[#60605D]">
                Scale candidate screening, assessments, and AI avatar interviews with predictable tiers.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {/* Starter */}
              <div className="panel flex flex-col justify-between p-8 bg-white">
                <div>
                  <h3 className="text-base font-semibold text-[#121212]">Starter Workspace</h3>
                  <p className="mt-1 text-xs text-[#60605D]">For boutique teams &amp; startups hiring monthly</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-[#121212]">$99</span>
                    <span className="text-xs text-[#8C8C87]">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#60605D]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Up to 3 Active Job Openings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>50 Grounded CV Screenings / mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>25 Dynamic MCQ Assessments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>15 Conversational Avatar Interviews</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-[9px] border border-[#D8D8D2] bg-white py-2.5 text-xs font-medium text-[#121212] transition-colors hover:bg-[#F6F6F2]"
                >
                  Start 14-Day Trial
                </Link>
              </div>

              {/* Pro (Highlighted) */}
              <div className="panel relative flex flex-col justify-between p-8 bg-white border-[#111111] shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#111111] px-3 py-0.5 text-[10px] font-semibold text-white">
                  Most Popular
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#121212]">Growth Recruiter</h3>
                  <p className="mt-1 text-xs text-[#60605D]">For scaling tech teams and active agencies</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-[#121212]">$299</span>
                    <span className="text-xs text-[#8C8C87]">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#60605D]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Unlimited Active Job Openings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>250 Grounded CV Screenings / mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>100 Dynamic MCQ Assessments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>75 Conversational Avatar Interviews</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Audit Scorecards &amp; Export</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-[9px] bg-[#111111] py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#202020] shadow-sm"
                >
                  Launch Pro Workspace
                </Link>
              </div>

              {/* Enterprise */}
              <div className="panel flex flex-col justify-between p-8 bg-white">
                <div>
                  <h3 className="text-base font-semibold text-[#121212]">Enterprise Custom</h3>
                  <p className="mt-1 text-xs text-[#60605D]">For enterprise HR orgs and custom pipelines</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-[#121212]">$999</span>
                    <span className="text-xs text-[#8C8C87]">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#60605D]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Custom Candidate Evaluation Volume</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Dedicated Tenant Database Isolation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>Custom Avatar Persona &amp; Voice Tuning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-[#35C88A]" />
                      <span>NYC LL144 Bias Audit Certification</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-[9px] border border-[#D8D8D2] bg-white py-2.5 text-xs font-medium text-[#121212] transition-colors hover:bg-[#F6F6F2]"
                >
                  Contact Enterprise Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final Centered CTA Section with Atmospheric Warm Glow */}
        <section className="relative overflow-hidden border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="hero-glow pointer-events-none absolute -inset-6 -z-10 opacity-60" />

          <div className="mx-auto max-w-[800px] px-6 text-center">
            <h2 className="text-3xl font-[520] tracking-[-0.04em] text-[#121212] sm:text-5xl">
              Ready to Upgrade to Autonomous AI Hiring?
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-base leading-[1.55] text-[#60605D]">
              Join the recruitment teams screening candidates 10x faster with 100% auditable grounded evidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-[9px] bg-[#111111] px-7 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#202020] hover:-translate-y-0.5"
              >
                <span>Launch Recruiter Workspace</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-[#E7E7E2] bg-[#FAFAF7] py-12 text-xs text-[#8C8C87]">
        <div className="mx-auto flex max-w-[1240px] flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8">
          <BrandLogo size="sm" />
          <p>© 2026 AI-Recruit360. Autonomous Multi-Modal Recruitment Platform. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[#121212] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-[#121212] transition-colors">
              Recruiter Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
