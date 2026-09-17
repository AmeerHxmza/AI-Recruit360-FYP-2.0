import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  ExternalLink,
  Check,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { InteractiveShowcase } from "@/components/landing/interactive-showcase";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#121212] selection:bg-[#FF4F62] selection:text-white relative">
      {/* Scroll Depth Progress Bar across the top of the browser */}
      <ScrollProgress />

      {/* High-Performance Sticky Frosted Glass Navbar */}
      <header className="sticky top-0 z-40 border-b border-[rgba(20,20,20,0.06)] bg-[rgba(250,250,248,0.85)] backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-6 sm:px-8">
          <BrandLogo size="md" />

          <nav className="hidden items-center gap-1 rounded-full border border-black/[0.06] bg-white/70 p-1.5 text-[13px] font-medium text-[#50504D] shadow-2xs backdrop-blur-md md:flex">
            <a
              href="#pipeline"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              Evaluation Pipeline
            </a>
            <a
              href="#architecture"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              3-Tier Architecture
            </a>
            <a
              href="#interactive-demo"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              Live Cockpit
            </a>
            <a
              href="#scoring"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              Audit Scorecard
            </a>
            <a
              href="#comparison"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              Comparison
            </a>
            <a
              href="#pricing"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-[9px] px-3.5 py-2 text-[14px] font-medium text-[#121212] transition-colors hover:bg-black/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-1.5 rounded-[9px] bg-[#111111] px-4 py-2 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-[#222222] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Create workspace</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Ambient Dot Pattern and Sequenced Entrance */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 dot-pattern">
          {/* Subtle Radial Gradient Vignette over the dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 15%, rgba(250,250,248,0) 0%, rgba(250,250,248,0.95) 85%, #FAFAF8 100%)",
            }}
          />

          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <div className="mx-auto max-w-[940px] text-center">
              {/* Telemetry Status Pill (Enters first) */}
              <div className="hero-enter-1 inline-flex items-center gap-2 rounded-full border border-[#E4E4DF] bg-white/95 px-3.5 py-1 text-xs font-medium text-[#121212] shadow-2xs backdrop-blur-md">
                <span className="size-2 rounded-full bg-[#35C88A] animate-pulse-subtle" />
                <span className="font-mono text-[11px] text-text-muted">ENGINE 2.0</span>
                <span className="h-3 w-px bg-border" />
                <span>Zero-Hallucination Evidence Grounding Active</span>
              </div>

              {/* High-Impact Headline (Enters second) */}
              <h1 className="hero-enter-2 mx-auto mt-6 text-4xl font-[540] tracking-[-0.045em] text-[#121212] sm:text-6xl lg:text-[72px] lg:leading-[1.01]">
                Precision hiring.
                <br />
                <span className="bg-gradient-to-r from-[#111111] via-[#2a2a2a] to-[#555555] bg-clip-text text-transparent">
                  Verified at every stage.
                </span>
              </h1>

              {/* Subtitle with High-Conviction Value Proposition (Enters third) */}
              <p className="hero-enter-3 mx-auto mt-6 max-w-[680px] text-base leading-[1.6] text-[#555552] sm:text-lg">
                Cross-reference resume claims against grounded text citations, generate leak-proof dynamic assessments, and conduct structured conversational interviews. Zero hallucinations. Complete audit trails.
              </p>

              {/* Action Buttons with Spring Hover Physics (Enters fourth) */}
              <div className="hero-enter-4 mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/signup"
                  className="group flex items-center gap-2 rounded-[9px] bg-[#111111] px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#222222] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  <span>Launch Recruiter Workspace</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pipeline"
                  className="flex items-center gap-2 rounded-[9px] border border-[#D5D5CF] bg-white px-6 py-3 text-[14px] font-medium text-[#161616] shadow-2xs transition-all hover:bg-[#F4F4F0] hover:-translate-y-0.5 hover:border-black/25 active:scale-[0.98]"
                >
                  <span>Explore Evaluation Pipeline</span>
                </a>
              </div>

              {/* Key Verification Guarantees Bar (Enters fifth) */}
              <div className="hero-enter-5 mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-[#E7E7E2] pt-6 text-xs text-[#555552]">
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  40% Weight: Verified Resume Citations
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  25% Weight: Server-Timed Dynamic MCQs
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <CheckCircle2 className="size-4 text-[#35C88A]" />
                  35% Weight: Conversational Avatar Interview
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                  <ShieldCheck className="size-4 text-[#111111]" />
                  NYC LL144 &amp; EU AI Act Auditable
                </span>
              </div>
            </div>

            {/* Interactive Product Cockpit Frame with Ambient Glow and Floating Telemetry Chips */}
            <div id="interactive-demo" className="hero-enter-5 relative mt-14 scroll-mt-24 sm:mt-18">
              {/* Atmospheric Glow */}
              <div className="hero-glow pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-75" />

              {/* Floating Telemetry Chip (Top Left) */}
              <div className="animate-float-slow hidden lg:flex absolute -top-5 -left-5 z-20 items-center gap-2.5 rounded-full border border-black/[0.08] bg-white/95 px-4 py-2 text-xs font-medium text-[#111111] shadow-lg backdrop-blur-md">
                <span className="size-2 rounded-full bg-[#35C88A] animate-pulse-subtle" />
                <span className="font-mono text-[11px] text-text-muted">CITATION ENGINE</span>
                <span className="h-3 w-px bg-border" />
                <span>0% Hallucination Isolation Verified</span>
              </div>

              {/* Floating Telemetry Chip (Bottom Right) */}
              <div className="animate-float-delayed hidden lg:flex absolute -bottom-5 -right-5 z-20 items-center gap-2.5 rounded-full border border-black/[0.08] bg-white/95 px-4 py-2 text-xs font-medium text-[#111111] shadow-lg backdrop-blur-md">
                <Clock className="size-3.5 text-[#FF4F62]" />
                <span className="font-mono text-[11px] text-text-muted">ANTI-CHEAT LOCK</span>
                <span className="h-3 w-px bg-border" />
                <span>60s PostgreSQL Mutex Enforced</span>
              </div>

              {/* Cockpit Window Container */}
              <div className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.07)]">
                {/* Browser-style Titlebar */}
                <div className="flex h-11 items-center justify-between border-b border-[#E7E7E2] bg-[#F7F7F4] px-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#E5E5DF]" />
                    <span className="size-2.5 rounded-full bg-[#E5E5DF]" />
                    <span className="size-2.5 rounded-full bg-[#E5E5DF]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-[#E2E2DC] bg-white px-3 py-1 text-[11px] font-mono text-[#7A7A75]">
                    <Lock className="size-3 text-[#7A7A75]" />
                    <span>ai-recruit360.workspace / evaluation-cockpit</span>
                  </div>
                  <div className="w-14" />
                </div>

                {/* Embedded Interactive Product Cockpit */}
                <InteractiveShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Connected Evaluation Pipeline Section */}
        <section id="pipeline" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#F6F6F2] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <ScrollReveal distance={44} durationMs={750}>
              <div className="text-center">
                <p className="eyebrow">AUDITABLE HIRING PIPELINE</p>
                <h2 className="text-3xl font-[540] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                  A Unified, Sequential Evaluation Protocol
                </h2>
                <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.6] text-[#555552]">
                  Every candidate moves through an immutable, multi-tier progression. No fragmented tools, no unverified claims, and zero manual spreadsheet grading.
                </p>
              </div>
            </ScrollReveal>

            {/* Connected Process Flow with Staggered Scroll Reveal */}
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {[
                {
                  step: "01",
                  title: "Resume Intake",
                  desc: "Native PDF/DOCX parsing extracting plain text, layout blocks, and experience milestones.",
                  badge: "PyMuPDF",
                },
                {
                  step: "02",
                  title: "Evidence Extraction",
                  desc: "Extracts exact quote citations validating required competencies with strict 70% threshold gating.",
                  badge: "40% Weight",
                  highlight: true,
                },
                {
                  step: "03",
                  title: "Dynamic Assessment",
                  desc: "10 project-tailored technical questions with server-locked 60s countdown timers.",
                  badge: "25% Weight",
                },
                {
                  step: "04",
                  title: "Avatar Interview",
                  desc: "Conversational talking avatar conducting structured 5-stage progressive technical follow-ups.",
                  badge: "35% Weight",
                  highlight: true,
                },
                {
                  step: "05",
                  title: "Composite Roll-up",
                  desc: "Deterministic mathematical scoring equation producing an explainable audit score.",
                  badge: "Zero Black-Box",
                },
                {
                  step: "06",
                  title: "Human Verdict",
                  desc: "Recruiter 1-click decision with full citation transcripts and CSV compliance exports.",
                  badge: "Final Decision",
                },
              ].map((item, idx) => (
                <ScrollReveal key={idx} delayMs={idx * 80} distance={44} durationMs={700}>
                  <div
                    className={`interactive-card card-sheen group relative h-full rounded-[14px] border bg-white p-5 shadow-2xs transition-all ${
                      item.highlight ? "border-[#FF4F62]/35 bg-white ring-1 ring-[#FF4F62]/10" : "border-[#E4E4DF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#8C8C87]">
                        {item.step}
                      </span>
                      <span className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#555552]">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-[#121212] group-hover:text-black">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-[1.5] text-[#60605D]">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Tier Architecture Section */}
        <section id="architecture" className="scroll-mt-20 border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <ScrollReveal distance={44} durationMs={750}>
              <div className="text-center">
                <p className="eyebrow">SYSTEM ARCHITECTURE</p>
                <h2 className="text-3xl font-[540] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                  The 3-Tier Autonomous Intelligence Architecture
                </h2>
                <p className="mx-auto mt-4 max-w-[640px] text-base leading-[1.6] text-[#555552]">
                  Engineered to replace unverified resume keyword stuffing and leaked static question banks with deterministic evaluation.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {/* Feature 1 (Spans 2 columns) */}
              <ScrollReveal delayMs={0} distance={44} durationMs={750} className="lg:col-span-2">
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 border-border/90 h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#FF4F62]/10 px-3 py-1 text-xs font-semibold text-[#FF4F62]">
                        Tier 1 · 40% Composite Weight
                      </span>
                      <span className="text-xs font-mono text-[#8C8C87]">Grounded Text Citations</span>
                    </div>

                    <h3 className="mt-5 text-2xl font-[550] tracking-[-0.025em] text-[#121212]">
                      Verifiable Resume Evidence Grounding
                    </h3>
                    <p className="mt-3 max-w-[620px] text-sm leading-[1.6] text-[#555552]">
                      Standard keyword matchers reward candidates for stuffing technical buzzwords into their resumes. AI-Recruit360 extracts concrete quote citations directly from the resume to validate actual project achievements and architectural ownership.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-[#E7E7E2] pt-6">
                      <div className="rounded-xl bg-[#FAFAF8] p-4 border border-[#E7E7E2]">
                        <span className="text-xs font-semibold text-[#121212]">Quote Extraction</span>
                        <p className="mt-1 text-xs text-[#60605D]">Direct text evidence citations parsed verbatim</p>
                      </div>
                      <div className="rounded-xl bg-[#FAFAF8] p-4 border border-[#E7E7E2]">
                        <span className="text-xs font-semibold text-[#121212]">Threshold Gating</span>
                        <p className="mt-1 text-xs text-[#60605D]">Automated 70% threshold gating before assessments</p>
                      </div>
                      <div className="rounded-xl bg-[#FAFAF8] p-4 border border-[#E7E7E2]">
                        <span className="text-xs font-semibold text-[#121212]">Zero Hallucination</span>
                        <p className="mt-1 text-xs text-[#60605D]">Pydantic schema isolation prevents fabrications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Feature 2 */}
              <ScrollReveal delayMs={100} distance={44} durationMs={750}>
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 border-border/90 h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-semibold text-[#121212]">
                        Tier 2 · 25% Weight
                      </span>
                      <span className="text-xs font-mono text-[#8C8C87]">Server Mutex Timer</span>
                    </div>

                    <h3 className="mt-5 text-xl font-[550] tracking-[-0.025em] text-[#121212]">
                      Context-Aware Dynamic MCQs
                    </h3>
                    <p className="mt-3 text-xs leading-[1.6] text-[#555552]">
                      Static testing question banks (iMocha, TestGorilla) are widely leaked on forums. AI-Recruit360 synthesizes 10 technical scenarios tailored specifically to the candidate&apos;s actual resume projects.
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-[#E7E7E2] pt-4 text-xs text-[#555552]">
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
              </ScrollReveal>

              {/* Feature 3 */}
              <ScrollReveal delayMs={160} distance={44} durationMs={750}>
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 border-border/90 h-full">
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
                    <p className="mt-3 text-xs leading-[1.6] text-[#555552]">
                      Unlike passive one-way asynchronous video recordings (HireVue), AI-Recruit360 deploys an interactive talking avatar via WebSockets that listens, clarifies, and asks progressive technical follow-ups.
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-[#E7E7E2] pt-4 text-xs text-[#555552]">
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
              </ScrollReveal>

              {/* Feature 4 (Spans 2 columns) */}
              <ScrollReveal delayMs={200} distance={44} durationMs={750} className="lg:col-span-2">
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 border-border/90 h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#35C88A]/10 px-3 py-1 text-xs font-semibold text-[#167348]">
                        Final Synthesis
                      </span>
                      <span className="text-xs font-mono text-[#8C8C87]">100% Explainable</span>
                    </div>

                    <h3 className="mt-5 text-2xl font-[550] tracking-[-0.025em] text-[#121212]">
                      Explainable AI Analysis &amp; Ethical Compliance
                    </h3>
                    <p className="mt-3 max-w-[620px] text-sm leading-[1.6] text-[#555552]">
                      Every decision recommendation is supported by full audit trails. Recruiter dashboards display exact score contributions, strengths, gaps, and grounded citations—fully compliant with NYC Local Law 144 and EU AI Act.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-[#E7E7E2] pt-6 text-xs text-[#555552]">
                      <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                        <CheckCircle2 className="size-4 text-[#35C88A]" />
                        Human-in-the-Loop Override
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                        <CheckCircle2 className="size-4 text-[#35C88A]" />
                        Multi-Tenant Row Level Security
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-[#121212]">
                        <CheckCircle2 className="size-4 text-[#35C88A]" />
                        Deterministic Mathematical Scoring
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Deterministic Scoring Model Breakdown with Rolling Animated Numbers */}
        <section id="scoring" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#FAFAF8] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <ScrollReveal distance={44} durationMs={750}>
              <div className="text-center">
                <p className="eyebrow">DETERMINISTIC FORMULATION</p>
                <h2 className="text-3xl font-[540] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                  The Mathematical Composite Index
                </h2>
                <p className="mx-auto mt-4 max-w-[640px] text-base leading-[1.6] text-[#555552]">
                  No opaque black-box deep learning scores. Candidates are evaluated through a verified, transparent weighted formula.
                </p>
              </div>
            </ScrollReveal>

            {/* Formula Pill */}
            <ScrollReveal delayMs={100} distance={30} durationMs={700}>
              <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#E4E4DF] bg-white p-5 text-center shadow-xs">
                <span className="text-xs font-mono font-medium text-[#8C8C87]">Composite Score Equation</span>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono tracking-tight text-[#121212]">
                  S = (0.40 × CV) + (0.25 × MCQ) + (0.35 × Interview)
                </div>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  value: 40,
                  title: "CV Evidence Match",
                  desc: "Measures alignment between verified resume experience and hard job requirements.",
                },
                {
                  value: 25,
                  title: "Adaptive Project MCQs",
                  desc: "Validates core domain competence with server-timed technical scenario questions.",
                },
                {
                  value: 35,
                  title: "Interactive Avatar Interview",
                  desc: "Assesses technical depth, problem-solving reasoning, and professional communication.",
                },
              ].map((card, idx) => (
                <ScrollReveal key={idx} delayMs={idx * 100} distance={44} durationMs={750}>
                  <div className="interactive-card panel p-6 text-center h-full">
                    <div className="text-3xl font-bold font-mono text-[#121212]">
                      <AnimatedCounter value={card.value} suffix="%" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[#121212]">{card.title}</h3>
                    <p className="mt-2 text-xs text-[#555552] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Competitive Matrix */}
        <section id="comparison" className="scroll-mt-20 border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <ScrollReveal distance={44} durationMs={750}>
              <div className="text-center">
                <p className="eyebrow">MARKET COMPARISON</p>
                <h2 className="text-3xl font-[540] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                  How AI-Recruit360 Compares
                </h2>
                <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.6] text-[#555552]">
                  A unified 3-tier recruitment platform engineered specifically to outperform fragmented enterprise tools.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={150} distance={44} durationMs={800}>
              <div className="mt-12 overflow-x-auto rounded-[16px] border border-[#E7E7E2] bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E7E7E2] bg-[#FAFAF8]">
                      <th className="p-4.5 font-semibold text-[#121212]">Feature Capability</th>
                      <th className="p-4.5 font-bold text-[#FF4F62] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        AI-Recruit360
                      </th>
                      <th className="p-4.5 font-medium text-[#60605D]">Beatview.ai</th>
                      <th className="p-4.5 font-medium text-[#60605D]">iMocha</th>
                      <th className="p-4.5 font-medium text-[#60605D]">HireVue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E2]">
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4.5 font-medium text-[#121212]">Grounded Resume Quote Extraction</td>
                      <td className="p-4.5 font-semibold text-[#167348] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#35C88A]" />
                          Yes (100% Citations)
                        </span>
                      </td>
                      <td className="p-4.5 text-[#60605D]">Basic Keyword Matching</td>
                      <td className="p-4.5 text-[#60605D]">No (Testing Only)</td>
                      <td className="p-4.5 text-[#60605D]">Generic Keyword Scan</td>
                    </tr>
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4.5 font-medium text-[#121212]">Dynamic Project-Tailored MCQs</td>
                      <td className="p-4.5 font-semibold text-[#167348] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#35C88A]" />
                          Yes (Resume-Specific)
                        </span>
                      </td>
                      <td className="p-4.5 text-[#60605D]">No MCQs</td>
                      <td className="p-4.5 text-[#60605D]">Static Question Bank (Leaked)</td>
                      <td className="p-4.5 text-[#60605D]">No MCQs</td>
                    </tr>
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4.5 font-medium text-[#121212]">Interactive Talking Avatar Interview</td>
                      <td className="p-4.5 font-semibold text-[#167348] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#35C88A]" />
                          Yes (Live WebRTC Avatar)
                        </span>
                      </td>
                      <td className="p-4.5 text-[#60605D]">Asynchronous One-Way</td>
                      <td className="p-4.5 text-[#60605D]">None</td>
                      <td className="p-4.5 text-[#60605D]">Asynchronous Video</td>
                    </tr>
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4.5 font-medium text-[#121212]">Deterministic Formula Scorecard</td>
                      <td className="p-4.5 font-semibold text-[#167348] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#35C88A]" />
                          Yes (40/25/35 Weights)
                        </span>
                      </td>
                      <td className="p-4.5 text-[#60605D]">Qualitative Summaries</td>
                      <td className="p-4.5 text-[#60605D]">Test Score Only</td>
                      <td className="p-4.5 text-[#60605D]">Black-Box Predictive</td>
                    </tr>
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4.5 font-medium text-[#121212]">Anti-Cheating Server Time Countdown</td>
                      <td className="p-4.5 font-semibold text-[#167348] bg-[#FF4F62]/5 border-x border-[#FF4F62]/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#35C88A]" />
                          Yes (PostgreSQL Mutex)
                        </span>
                      </td>
                      <td className="p-4.5 text-[#60605D]">N/A</td>
                      <td className="p-4.5 text-[#60605D]">Proctoring Extension</td>
                      <td className="p-4.5 text-[#60605D]">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Transparent Pricing Plans with Counting Prices */}
        <section id="pricing" className="scroll-mt-20 border-t border-[#E7E7E2] bg-[#F6F6F2] py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
            <ScrollReveal distance={44} durationMs={750}>
              <div className="text-center">
                <p className="eyebrow">SIMPLE RECRUITMENT TIERS</p>
                <h2 className="text-3xl font-[540] tracking-[-0.035em] text-[#121212] sm:text-5xl">
                  Predictable Workspace Pricing
                </h2>
                <p className="mx-auto mt-4 max-w-[540px] text-base leading-[1.6] text-[#555552]">
                  Scale candidate screening, assessments, and AI avatar interviews with clear, transparent tiers.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {/* Starter */}
              <ScrollReveal delayMs={0} distance={44} durationMs={750}>
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 bg-white h-full">
                  <div>
                    <h3 className="text-base font-semibold text-[#121212]">Starter Workspace</h3>
                    <p className="mt-1 text-xs text-[#60605D]">For boutique teams &amp; startups hiring monthly</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <AnimatedCounter value={99} prefix="$" className="text-4xl font-bold font-mono tracking-tight text-[#121212]" />
                      <span className="text-xs text-[#8C8C87]">/ month</span>
                    </div>

                    <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#555552]">
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
                    className="mt-8 flex w-full items-center justify-center rounded-[9px] border border-[#D5D5CF] bg-white py-2.5 text-xs font-medium text-[#121212] transition-colors hover:bg-[#F6F6F2] hover:border-black/30"
                  >
                    Start 14-Day Trial
                  </Link>
                </div>
              </ScrollReveal>

              {/* Growth (Most Popular) */}
              <ScrollReveal delayMs={100} distance={44} durationMs={750}>
                <div className="interactive-card card-sheen panel relative flex flex-col justify-between p-8 bg-white border-[#111111] shadow-lg ring-1 ring-[#111111]/10 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#111111] px-3.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                    Most Popular
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#121212]">Growth Recruiter</h3>
                    <p className="mt-1 text-xs text-[#60605D]">For scaling tech teams and active agencies</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <AnimatedCounter value={299} prefix="$" className="text-4xl font-bold font-mono tracking-tight text-[#121212]" />
                      <span className="text-xs text-[#8C8C87]">/ month</span>
                    </div>

                    <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#555552]">
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
                        <span>Audit Scorecards &amp; CSV Export</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href="/signup"
                    className="mt-8 flex w-full items-center justify-center rounded-[9px] bg-[#111111] py-2.5 text-xs font-medium text-white transition-all hover:bg-[#222222] shadow-sm hover:-translate-y-0.5"
                  >
                    Launch Growth Workspace
                  </Link>
                </div>
              </ScrollReveal>

              {/* Enterprise */}
              <ScrollReveal delayMs={200} distance={44} durationMs={750}>
                <div className="interactive-card card-sheen panel flex flex-col justify-between p-8 bg-white h-full">
                  <div>
                    <h3 className="text-base font-semibold text-[#121212]">Enterprise Custom</h3>
                    <p className="mt-1 text-xs text-[#60605D]">For enterprise talent teams &amp; custom pipelines</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <AnimatedCounter value={999} prefix="$" className="text-4xl font-bold font-mono tracking-tight text-[#121212]" />
                      <span className="text-xs text-[#8C8C87]">/ month</span>
                    </div>

                    <ul className="mt-6 space-y-3 border-t border-[#E7E7E2] pt-6 text-xs text-[#555552]">
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
                    className="mt-8 flex w-full items-center justify-center rounded-[9px] border border-[#D5D5CF] bg-white py-2.5 text-xs font-medium text-[#121212] transition-colors hover:bg-[#F6F6F2] hover:border-black/30"
                  >
                    Contact Enterprise Sales
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Final High-Conviction CTA Section */}
        <section className="relative overflow-hidden border-t border-[#E7E7E2] bg-white py-20 sm:py-28">
          <div className="hero-glow pointer-events-none absolute -inset-6 -z-10 opacity-70" />

          <ScrollReveal distance={44} durationMs={750}>
            <div className="mx-auto max-w-[820px] px-6 text-center">
              <h2 className="text-3xl font-[540] tracking-[-0.04em] text-[#121212] sm:text-5xl">
                Ready to Upgrade to Grounded, Auditable Hiring?
              </h2>
              <p className="mx-auto mt-4 max-w-[580px] text-base leading-[1.6] text-[#555552]">
                Join recruitment teams making verifiable hiring decisions 10x faster with complete evidence citations and zero hallucinations.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/signup"
                  className="group flex items-center gap-2 rounded-[9px] bg-[#111111] px-7 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#222222] hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span>Launch Recruiter Workspace</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* World-Class Modern 4-Column Footer */}
      <footer className="border-t border-[#E7E7E2] bg-[#FAFAF8] pt-16 pb-12 text-xs text-[#6E6E69]">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Col 1: Brand & Status (Spans 2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo size="md" />
              <p className="max-w-[320px] text-xs leading-relaxed text-[#6E6E69]">
                AI-Recruit360 is the autonomous multi-tier recruitment evaluation platform engineered for verifiable evidence, dynamic assessments, and structured conversational interviews.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[11px] font-medium text-[#111111] shadow-2xs">
                <span className="size-2 rounded-full bg-[#35C88A] animate-pulse-subtle" />
                <span>All Systems Operational</span>
              </div>
            </div>

            {/* Col 2: Architecture */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Platform Architecture
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#pipeline" className="hover:text-[#111111] transition-colors">
                    Tier 1: Grounded CV Quotes
                  </a>
                </li>
                <li>
                  <a href="#pipeline" className="hover:text-[#111111] transition-colors">
                    Tier 2: Timed Dynamic MCQs
                  </a>
                </li>
                <li>
                  <a href="#pipeline" className="hover:text-[#111111] transition-colors">
                    Tier 3: WebRTC Avatar Interview
                  </a>
                </li>
                <li>
                  <a href="#scoring" className="hover:text-[#111111] transition-colors">
                    Mathematical Composite Index
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Compliance */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Compliance &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-[#50504D]">NYC Local Law 144 Auditable</span>
                </li>
                <li>
                  <span className="text-[#50504D]">EU AI Act High-Risk Compliant</span>
                </li>
                <li>
                  <span className="text-[#50504D]">Zero Hallucination Guarantee</span>
                </li>
                <li>
                  <span className="text-[#50504D]">Row Level Security (RLS)</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Portals */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Access Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-[#111111] transition-colors">
                    Recruiter Workspace Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-[#111111] transition-colors">
                    Create New Organization
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#111111] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E7E7E2] pt-6 text-[11px] text-[#8C8C87]">
            <p>© 2026 AI-Recruit360. Autonomous Recruitment Evaluation Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Deterministic Hiring Systems</span>
              <span>•</span>
              <span>FastAPI + Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
