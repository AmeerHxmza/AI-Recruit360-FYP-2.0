"use client";

import * as React from "react";
import { Plus, Share2, FileSearch, Timer, Video, Sparkles } from "lucide-react";

export function ProductWorkflow() {
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    {
      id: "01",
      title: "Create Job",
      subtitle: "Define position requirements & criteria",
      icon: Plus,
      panel: {
        heading: "Step 1: Role Configuration & AI Criteria Setup",
        description: "Specify title, department, employment type, requirements, and required skills.",
        previewTitle: "Senior AI Engineer",
        details: [
          { label: "Department", value: "AI & Engineering" },
          { label: "Employment Type", value: "Full-Time" },
          { label: "Workplace", value: "Remote" },
          { label: "Requirements", value: "Python, FastAPI, Next.js, Postgres" },
        ],
        status: "Draft Saved",
      },
    },
    {
      id: "02",
      title: "Publish Job",
      subtitle: "Generate public candidate application link",
      icon: Share2,
      panel: {
        heading: "Step 2: Instant Public Application Link Generation",
        description: "Publish your position with one click to generate a secure, shareable public link.",
        previewTitle: "Public Application Portal Activated",
        link: "https://ai-recruit360.com/apply/senior-ai-engineer-8x42",
        details: [
          { label: "Public URL", value: "/apply/senior-ai-engineer-8x42" },
          { label: "CV Upload", value: "PDF / DOCX Enabled" },
          { label: "Knockout Rules", value: "Active (Automated Rejection)" },
          { label: "Status", value: "Live & Receiving Applicants" },
        ],
        status: "Published",
      },
    },
    {
      id: "03",
      title: "AI Screen CV",
      subtitle: "Automated resume parsing & score match",
      icon: FileSearch,
      panel: {
        heading: "Step 3: CV Parsing & Requirement Matching",
        description: "AI extracts skills, work experience, and educational background to generate instant match scores.",
        previewTitle: "CV Screening Pipeline",
        details: [
          { label: "AI Match Score", value: "92% Match" },
          { label: "Skills Match", value: "96%" },
          { label: "Experience Match", value: "88%" },
          { label: "Recommendation", value: "STRONG MATCH" },
        ],
        status: "Screening Complete",
      },
    },
    {
      id: "04",
      title: "Assessment",
      subtitle: "10 timed MCQ questions (30s per question)",
      icon: Timer,
      panel: {
        heading: "Step 4: Standardized Timed Competency MCQ",
        description: "Candidates take a 10-question MCQ test with a strict 30-second countdown timer per question.",
        previewTitle: "Technical MCQ Assessment",
        details: [
          { label: "Questions Count", value: "10 MCQs" },
          { label: "Time Limit", value: "30 Seconds Per Question" },
          { label: "Auto Progression", value: "Enabled on Timeout" },
          { label: "Candidate Score", value: "9 / 10 Correct (90%)" },
        ],
        status: "Passed Assessment",
      },
    },
    {
      id: "05",
      title: "AI Interview",
      subtitle: "Automated adaptive first-round interview",
      icon: Video,
      panel: {
        heading: "Step 5: Automated First-Round AI Video Interview",
        description: "AI conducts a natural, adaptive video interview asking targeted follow-up questions.",
        previewTitle: "AI Interview Session",
        details: [
          { label: "Interviewer", value: "AI-Recruit360 Engine" },
          { label: "Questions Asked", value: "8 Adaptive Questions" },
          { label: "Audio Waveform", value: "Speech-to-Text Transcribed" },
          { label: "Evaluation Score", value: "92 / 100" },
        ],
        status: "Interview Complete",
      },
    },
    {
      id: "06",
      title: "Hiring Intelligence",
      subtitle: "Comprehensive scorecard & verdict",
      icon: Sparkles,
      panel: {
        heading: "Step 6: Evidence-Based Recruiter Intelligence",
        description: "Recruiters receive a multi-signal scorecard combining CV alignment, assessment score, and interview responses.",
        previewTitle: "Candidate Decision Intelligence",
        details: [
          { label: "Candidate Name", value: "Candidate Profile (Sample)" },
          { label: "Overall Score", value: "91 / 100" },
          { label: "AI Verdict", value: "RECOMMENDED" },
          { label: "Recruiter Action", value: "One-Click Shortlist / Offer" },
        ],
        status: "Shortlisted",
      },
    },
  ];

  const activePanel = steps[activeStep].panel;

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#0D0F12] border-y border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            AUTOMATED CANDIDATE JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display">
            How AI-Recruit360 Works
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed mt-3">
            From recruiter job creation to public application, timed assessment, AI interview, and final hiring verdict.
          </p>
        </div>

        {/* 6 Step Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-[#12151A] border-[#39D9FF] text-[#F5F7FA] shadow-[0_0_16px_rgba(57,217,255,0.15)]"
                    : "bg-[#08090B] border-[#242932] text-[#A7AFBC] hover:border-[#39D9FF]/40 hover:text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isActive ? "text-[#39D9FF]" : "text-[#68717E]"}`}>
                    {step.id}
                  </span>
                  <div className={`p-1.5 rounded-md ${isActive ? "bg-[#39D9FF]/20 text-[#39D9FF]" : "bg-[#12151A] text-[#68717E]"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-xs font-bold font-display">{step.title}</h3>
                <p className="text-[10px] text-[#68717E] line-clamp-1 mt-0.5">{step.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Visual Panel */}
        <div className="rounded-2xl border border-[#242932] bg-[#12151A] p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Panel Left Text */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#39D9FF]/10 text-[#39D9FF] text-xs font-mono font-semibold border border-[#39D9FF]/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Workflow Step {steps[activeStep].id} of 06</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F5F7FA] font-display">
                {activePanel.heading}
              </h3>
              <p className="text-sm text-[#A7AFBC] leading-relaxed">
                {activePanel.description}
              </p>
              {activePanel.link && (
                <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932] text-xs font-mono text-[#39D9FF] break-all">
                  {activePanel.link}
                </div>
              )}
            </div>

            {/* Panel Right Preview Card */}
            <div className="lg:col-span-6 bg-[#0D0F12] rounded-xl border border-[#242932] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <span className="text-xs font-bold text-[#F5F7FA] font-display">
                  {activePanel.previewTitle}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30">
                  {activePanel.status}
                </span>
              </div>

              <div className="space-y-2.5">
                {activePanel.details.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-xs p-2 rounded bg-[#12151A] border border-[#1C2027]">
                    <span className="text-[#A7AFBC]">{d.label}</span>
                    <span className="font-semibold text-[#F5F7FA] font-mono text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

