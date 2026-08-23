"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicJobBySlugAction } from "@/app/actions/jobs";
import { submitPublicApplicationAction } from "@/app/actions/applications";
import { runCvScreeningAction } from "@/app/actions/ai-screening";
import { getOrGenerateAssessmentAction, submitAssessmentAnswerAction, finalizeAssessmentAction } from "@/app/actions/assessment";
import { initializeInterviewAction, getNextInterviewQuestionAction, submitInterviewResponseAction, finalizeEvaluationAction } from "@/app/actions/interview";
import { Job } from "@/lib/services/job-service";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SimliAvatarPlayer } from "@/components/interview/simli-avatar-player";
import { useVoiceInterview } from "@/hooks/use-voice-interview";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Video,
  Mic,
  MicOff,
  Award,
  ChevronRight,
  Building2,
  MapPin,
  Briefcase,
  XCircle,
} from "lucide-react";

export default function PublicCandidateApplyPage() {
  const params = useParams();
  const jobSlugOrId = (params?.["job-slug"] as string) || "";
  const voiceInterview = useVoiceInterview();

  // Core Job Data State
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Application Flow Step: 1 = Form, 2 = Assessment, 3 = AI Interview, 4 = Success
  const [flowStep, setFlowStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Active Database Record IDs
  const [activeApplicationId, setActiveApplicationId] = React.useState("");
  const [activeAssessmentId, setActiveAssessmentId] = React.useState("");
  const [activeInterviewId, setActiveInterviewId] = React.useState("");

  // Candidate Form Inputs
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [linkedIn, setLinkedIn] = React.useState("");
  const [portfolio, setPortfolio] = React.useState("");
  const [cvText, setCvText] = React.useState("");
  const [formSubmitting, setFormSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Assessment Step State (10 Python-Generated MCQs)
  const [customMcqs, setCustomMcqs] = React.useState<
    Array<{ id: string; assessment_id: string; question: string; options: string[] }>
  >([]);
  const [currentMcqIndex, setCurrentMcqIndex] = React.useState(0);
  const [selectedMcqAnswers, setSelectedMcqAnswers] = React.useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [assessmentScore, setAssessmentScore] = React.useState(0);

  // AI Interview State
  const [interviewQuestion, setInterviewQuestion] = React.useState<{
    id: string;
    question_text: string;
    question_number: number;
    total_questions: number;
  } | null>(null);
  const [candidateResponse, setCandidateResponse] = React.useState("");
  const [interviewSubmitting, setInterviewSubmitting] = React.useState(false);

  // Screening & AI Processing State
  const [isScreening, setIsScreening] = React.useState(false);
  const [screeningMsg, setScreeningMsg] = React.useState("AI Multi-Agent CV Screening in progress...");
  const [isKnockedOut, setIsKnockedOut] = React.useState(false);

  // Fetch Job details on mount using public slug query
  React.useEffect(() => {
    if (!jobSlugOrId) return;
    let isMounted = true;

    getPublicJobBySlugAction(jobSlugOrId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setFetchError("Job position not found or no longer accepting applications.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [jobSlugOrId]);

  const activeMcqs = customMcqs;

  const handleNextQuestion = React.useCallback(async () => {
    if (customMcqs.length === 0) return;
    const currentQ = customMcqs[currentMcqIndex];
    const selectedIdx = selectedMcqAnswers[currentMcqIndex] ?? 0;
    const selectedOptChar = String.fromCharCode(65 + selectedIdx);
    const timeTaken = Math.max(1, 30 - timeLeft);
    const assId = currentQ?.assessment_id || activeAssessmentId;

    if (currentQ && currentQ.id && assId) {
      // Record answer via Python backend
      await submitAssessmentAnswerAction(
        assId,
        currentQ.id,
        currentMcqIndex + 1,
        selectedOptChar,
        timeTaken
      );
    }

    if (currentMcqIndex < customMcqs.length - 1) {
      setCurrentMcqIndex((prev) => prev + 1);
      setTimeLeft(30);
    } else {
      // Complete Assessment & Score Server-Side
      if (assId) {
        const finalRes = await finalizeAssessmentAction(assId);
        if (finalRes.success && finalRes.data) {
          const finalScore = Math.round(finalRes.data.score || 0);
          setAssessmentScore(finalScore);
          if (!finalRes.data.passed) {
            setIsKnockedOut(true);
            return;
          }
        }
      }

      // Passed assessment -> Advance to AI Interview Room
      setFlowStep(3);
      if (activeApplicationId) {
        const initRes = await initializeInterviewAction(activeApplicationId);
        const initData = initRes.data as { interview_id?: string } | undefined;
        if (initRes.success && initData?.interview_id) {
          const intId = initData.interview_id;
          setActiveInterviewId(intId);
          const nextQRes = await getNextInterviewQuestionAction(intId);
          if (nextQRes.success && nextQRes.data) {
            const nqData = nextQRes.data as {
              current_question?: { id?: string; question_text: string; question_number?: number };
              total_questions?: number;
            };
            if (nqData.current_question) {
              setInterviewQuestion({
                id: nqData.current_question.id || "q1",
                question_text: nqData.current_question.question_text,
                question_number: nqData.current_question.question_number || 1,
                total_questions: nqData.total_questions || 5,
              });
            }
          }
        }
      }
    }
  }, [currentMcqIndex, customMcqs, selectedMcqAnswers, timeLeft, activeAssessmentId, activeApplicationId]);

  // 30-Second Countdown Timer for Assessment Step
  React.useEffect(() => {
    if (flowStep !== 2) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowStep, handleNextQuestion]);

  // Submit Application Form Step 1
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid full name and email address.");
      return;
    }

    if (!phone.trim()) {
      setFormError("Mobile phone number is mandatory to submit your application.");
      return;
    }

    if (!job) {
      setFormError("Job details not loaded.");
      return;
    }

    setFormSubmitting(true);
    setIsKnockedOut(false);

    try {
      const res = await submitPublicApplicationAction({
        job_id: job.id,
        organization_id: job.organization_id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim() || undefined,
        linkedin_url: linkedIn.trim() || undefined,
        portfolio_url: portfolio.trim() || undefined,
        cv_text: cvText.trim() || undefined,
      });

      if (res.success && res.data) {
        const appId = res.data.application_id;
        setActiveApplicationId(appId);

        // Step A: Trigger Multi-Agent Screening
        setIsScreening(true);
        setScreeningMsg("Analyzing CV experience & skills against position requirements...");

        const screeningRes = await runCvScreeningAction(appId);
        setIsScreening(false);

        if (screeningRes.success && screeningRes.data) {
          if (!screeningRes.data.qualified) {
            setIsKnockedOut(true);
            return;
          }
        }

        // Step B: Load personalized 10 MCQs from Python FastAPI AI backend
        setScreeningMsg("Generating 10 personalized technical assessment MCQs...");
        const mcqRes = await getOrGenerateAssessmentAction(appId);

        if (mcqRes.success && mcqRes.data && mcqRes.data.length > 0) {
          const assId = mcqRes.data[0].assessment_id || "";
          setActiveAssessmentId(assId);
          setCustomMcqs(
            mcqRes.data.map((q) => ({
              id: q.id,
              assessment_id: q.assessment_id || assId,
              question: q.question,
              options: [q.option_a, q.option_b, q.option_c, q.option_d],
            }))
          );
          setFlowStep(2);
          setCurrentMcqIndex(0);
          setTimeLeft(30);
        } else {
          setFormError(mcqRes.error || "Failed to generate assessment questions.");
        }
      } else {
        setFormError(res.error || "Failed to submit job application.");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setFormSubmitting(false);
      setIsScreening(false);
    }
  };

  // Complete Interview Question / Finalize AI Interview
  const handleCompleteInterview = async () => {
    setInterviewSubmitting(true);
    try {
      if (activeInterviewId && interviewQuestion) {
        const responseText = voiceInterview.transcript || candidateResponse || "Candidate answered technical interview question.";
        await submitInterviewResponseAction(activeInterviewId, interviewQuestion.id, responseText);
        setCandidateResponse("");
        voiceInterview.setTranscript("");

        // Fetch next adaptive question or check if session completed
        const nextRes = await getNextInterviewQuestionAction(activeInterviewId);
        if (nextRes.success && nextRes.data) {
          const nqData = nextRes.data as {
            completed?: boolean;
            current_question?: { id?: string; question_text: string; question_number?: number };
            total_questions?: number;
          };
          if (!nqData.completed && nqData.current_question) {
            setInterviewQuestion({
              id: nqData.current_question.id || "q_next",
              question_text: nqData.current_question.question_text,
              question_number: nqData.current_question.question_number || 1,
              total_questions: nqData.total_questions || 5,
            });
            setInterviewSubmitting(false);
            return;
          }
        }
      }

      // Generate final evaluation scorecard upon interview completion
      if (activeApplicationId) {
        await finalizeEvaluationAction(activeApplicationId);
      }
      setFlowStep(4);
    } catch {
      setFlowStep(4);
    } finally {
      setInterviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading application workspace...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-4">
          <XCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Position Unavailable</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {fetchError || "This job link is invalid or expired."}
          </p>
          <Link href="/" className="inline-block px-4 py-2 rounded-lg bg-[#171B21] border border-[#242932] text-xs text-[#39D9FF]">
            Return to AI-Recruit360 Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isScreening) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] text-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#39D9FF] animate-spin mx-auto" />
          <h2 className="text-base font-bold font-display text-[#F5F7FA]">AI Multi-Agent CV Screening</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed font-mono">
            {screeningMsg}
          </p>
          <div className="text-[10px] text-[#68717E] bg-[#0D0F12] p-3 rounded-xl border border-[#242932]">
            Evaluating Skills Match (40%) · Experience Match (30%) · Education (15%) · Relevance (15%)
          </div>
        </div>
      </div>
    );
  }

  if (isKnockedOut) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-center mx-auto text-[#FF5C67]">
            <XCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Application Screening Complete</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            Thank you for your interest in the <strong className="text-[#F5F7FA]">{job.title}</strong> position at {job.department || "our organization"}.
          </p>
          <p className="text-xs text-[#68717E] leading-relaxed bg-[#0D0F12] p-4 rounded-xl border border-[#242932]">
            Based on the specific core requirements for this position, your application will not proceed to the next assessment stage at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Public Candidate Header (Clean, No Recruiter Sidebar or Switcher) */}
      <header className="border-b border-[#242932] bg-[#0D0F12] py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="/" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#A7AFBC] hidden sm:inline">Candidate Portal</span>
            <span className="h-2 w-2 rounded-full bg-[#35D07F]" />
          </div>
        </div>
      </header>

      {/* Main Candidate Experience Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Step 1: Candidate Application Form */}
        {flowStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-2xl border border-[#242932] bg-[#12151A] p-6 space-y-4 overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#39D9FF] font-bold tracking-wider">
                    {job.department}
                  </span>
                  <h1 className="text-2xl font-bold text-[#F5F7FA] font-display">
                    {job.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[#A7AFBC] pt-1 border-t border-[#242932]">
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <MapPin className="h-3.5 w-3.5 text-[#39D9FF]" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <Briefcase className="h-3.5 w-3.5 text-[#35D07F]" /> {(job.employment_type || "full_time").replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <Building2 className="h-3.5 w-3.5 text-[#F5B942]" /> {job.workplace_type || "hybrid"}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#242932]">
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Position Overview
                  </h3>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line">
                    {job.description || "No overview provided."}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#242932]">
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Key Requirements
                  </h3>
                  <div className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line bg-[#0D0F12] p-3 rounded-lg border border-[#242932]">
                    {job.requirements || "Standard job qualifications apply."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Candidate Application Submission Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#242932] bg-[#12151A] p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="border-b border-[#242932] pb-4 space-y-1">
                  <h2 className="text-xl font-bold font-display text-[#F5F7FA]">Submit Candidate Application</h2>
                  <p className="text-xs text-[#A7AFBC]">Complete your profile to proceed to automated assessment.</p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-2.5 text-xs text-[#FF5C67]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">
                        Phone Number <span className="text-[#FF5C67]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">Current Location</label>
                      <input
                        type="text"
                        placeholder="San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedIn}
                        onChange={(e) => setLinkedIn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">Portfolio / GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>
                  </div>

                  {/* Resume PDF / DOCX File Drag & Drop Dropzone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Upload Resume (PDF or DOCX)</label>
                    <div className="border-2 border-dashed border-[#242932] hover:border-[#39D9FF]/50 bg-[#0D0F12] rounded-xl p-4 text-center transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            setFormError(null);
                            const res = await fetch("/api/py/screening/extract-cv", {
                              method: "POST",
                              body: formData,
                            });
                            if (!res.ok) throw new Error("Failed to extract document text");
                            const data = await res.json();
                            if (data.extracted_text) {
                              setCvText(data.extracted_text);
                              if (data.extracted_text.length > 50 && !fullName) {
                                const nameMatch = data.extracted_text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/);
                                if (nameMatch) setFullName(nameMatch[1]);
                              }
                            }
                          } catch {
                            setFormError("Failed to extract text from selected file. Please paste text below.");
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="p-2 rounded-lg bg-[#171B21] border border-[#242932] text-[#39D9FF] group-hover:scale-105 transition-transform">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#F5F7FA]">
                          Drop your PDF or DOCX resume here, or <span className="text-[#39D9FF]">browse</span>
                        </span>
                        <span className="text-[10px] text-[#68717E] font-mono">
                          Supports PDF, DOCX (Max 10MB) • Automatic AI Text Extraction
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Resume / CV Text Summary</label>
                    <textarea
                      rows={4}
                      placeholder="Extracted resume text will appear here automatically, or paste skills manually..."
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="ai"
                    size="md"
                    disabled={formSubmitting}
                    className="w-full text-xs font-semibold py-3"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Screening Application...
                      </>
                    ) : (
                      <>
                        Submit &amp; Begin 10-Question Assessment
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 10 MCQ Timed Assessment (30s countdown per question) */}
        {flowStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-[#242932] bg-[#12151A] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#242932] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#39D9FF] uppercase tracking-wider font-bold block">
                    TIMED ASSESSMENT
                  </span>
                  <h2 className="text-lg font-bold font-display text-[#F5F7FA]">
                    Question {currentMcqIndex + 1} of {activeMcqs.length}
                  </h2>
                </div>

                {/* 30s Countdown Ring */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D0F12] border border-[#39D9FF]/40 text-[#39D9FF] font-mono font-bold text-sm">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
              </div>

              {/* MCQ Question Card */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#F5F7FA] font-sans leading-snug">
                  {activeMcqs[currentMcqIndex]?.question || "Technical Question"}
                </h3>

                <div className="space-y-2.5 pt-2">
                  {(activeMcqs[currentMcqIndex]?.options || []).map((option, optIdx) => {
                    const isSelected = selectedMcqAnswers[currentMcqIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() =>
                          setSelectedMcqAnswers((prev) => ({
                            ...prev,
                            [currentMcqIndex]: optIdx,
                          }))
                        }
                        className={`w-full p-4 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                          isSelected
                            ? "bg-[#39D9FF]/10 border-[#39D9FF] text-[#F5F7FA] font-medium"
                            : "bg-[#0D0F12] border-[#242932] text-[#A7AFBC] hover:border-[#39D9FF]/30"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full border border-[#242932] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-[#39D9FF]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#242932]">
                <span className="text-xs text-[#68717E] font-mono">
                  30s per question limit • Auto-advances
                </span>
                <Button variant="ai" size="sm" onClick={handleNextQuestion}>
                  {currentMcqIndex < activeMcqs.length - 1 ? "Next Question" : "Submit Assessment"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Interview Room Simulation */}
        {flowStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-[#39D9FF]/40 bg-[#12151A] p-6 sm:p-8 space-y-6 shadow-2xl ai-glow-subtle">
              <div className="flex items-center justify-between border-b border-[#242932] pb-4">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#39D9FF]" />
                  <h2 className="text-lg font-bold font-display text-[#F5F7FA]">AI-Recruit360 Interviewer</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#35D07F]">
                  <span className="h-2 w-2 rounded-full bg-[#35D07F] animate-ping" />
                  <span>Live Voice AI Session</span>
                </div>
              </div>

              {/* Simli AI Video Avatar Player */}
              <SimliAvatarPlayer
                isSpeaking={voiceInterview.isSpeaking}
                currentText={interviewQuestion?.question_text || "Walk me through a challenging production architecture problem you solved recently."}
              />

              {/* Assessment Score Badge */}
              <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#242932] flex items-center justify-between text-xs">
                <span className="text-[#A7AFBC]">MCQ Assessment Score:</span>
                <span className="font-mono font-bold text-[#35D07F]">{assessmentScore}% Competency Score</span>
              </div>

              {/* Current Question */}
              <div className="p-5 rounded-xl bg-[#0D0F12] border border-[#242932] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#39D9FF] uppercase tracking-wider block font-bold">
                    Question {interviewQuestion?.question_number || 1} of {interviewQuestion?.total_questions || 5}
                  </span>
                  <button
                    onClick={() =>
                      voiceInterview.speakText(
                        interviewQuestion?.question_text || "Describe a challenging engineering decision you made recently."
                      )
                    }
                    className="text-xs font-mono text-[#39D9FF] hover:underline flex items-center gap-1"
                  >
                    🔊 Listen Question
                  </button>
                </div>
                <p className="text-sm font-semibold text-[#F5F7FA] font-sans">
                  &quot;{interviewQuestion?.question_text || "Describe a challenging engineering decision you made recently and how you verified its performance."}&quot;
                </p>
              </div>

              {/* Candidate Voice Recording & Waveform Visualizer */}
              <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#242932] text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 55, 35, 70].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-[#39D9FF] rounded-full transition-all duration-300 animate-pulse"
                      style={{ height: `${voiceInterview.isListening ? h : 15}%` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (voiceInterview.isListening) {
                        voiceInterview.stopListening();
                      } else {
                        voiceInterview.startListening();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                      voiceInterview.isListening
                        ? "bg-[#FF5C67] text-white animate-pulse"
                        : "bg-[#39D9FF] text-[#08090B] hover:bg-[#63E3FF]"
                    }`}
                  >
                    {voiceInterview.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {voiceInterview.isListening ? "Stop Microphone (Listening...)" : "Speak Response (Mic STT)"}
                  </button>
                </div>

                {voiceInterview.error && (
                  <p className="text-[11px] text-[#FF5C67] font-mono">{voiceInterview.error}</p>
                )}
              </div>

              {/* Response Textarea (Synced with Voice STT) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#A7AFBC]">
                    Candidate Answer Transcript (Live Voice Sync):
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={voiceInterview.transcript || candidateResponse}
                  onChange={(e) => {
                    setCandidateResponse(e.target.value);
                    voiceInterview.setTranscript(e.target.value);
                  }}
                  placeholder="Click 'Speak Response' to speak into microphone or type response transcript..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-[#242932]">
                <Button
                  variant="ai"
                  size="md"
                  disabled={interviewSubmitting}
                  onClick={handleCompleteInterview}
                  className="shadow-[0_0_16px_rgba(57,217,255,0.25)]"
                >
                  {interviewSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Evaluating Answer...
                    </>
                  ) : interviewQuestion && (interviewQuestion.question_number || 1) < (interviewQuestion.total_questions || 5) ? (
                    <>
                      Submit Answer &amp; Next Question
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-1.5" />
                      Complete &amp; Finalize AI Interview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Submission Success Confirmation */}
        {flowStep === 4 && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-10">
            <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden border border-[#39D9FF]/40 shadow-2xl ai-glow-subtle bg-[#12151A]">
              <Image
                src="/images/application-success.png"
                alt="Application Successfully Submitted"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#35D07F] font-bold uppercase tracking-widest bg-[#35D07F]/10 px-3 py-1 rounded-full border border-[#35D07F]/30">
                Application Received
              </span>
              <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
                Your application has been successfully submitted.
              </h1>
              <p className="text-xs text-[#A7AFBC] leading-relaxed max-w-md mx-auto">
                Thank you for applying to <strong className="text-[#F5F7FA]">{job.title}</strong>. Your candidate profile and completed assessments have been submitted for recruiter review.
              </p>
            </div>

            {/* What Happens Next Section */}
            <div className="p-5 rounded-2xl bg-[#12151A] border border-[#242932] text-left space-y-3 max-w-md mx-auto">
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-2">
                What Happens Next?
              </h3>
              <ol className="space-y-2.5 text-xs text-[#A7AFBC]">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">1</span>
                  <span><strong>AI CV Screening:</strong> Candidate skills and requirement alignment are evaluated objectively.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">2</span>
                  <span><strong>Assessment Review:</strong> Timed 10 MCQ technical test results are compiled.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">3</span>
                  <span><strong>AI Interview &amp; Recruiter Review:</strong> Interview responses are processed for final recruiter decisioning.</span>
                </li>
              </ol>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#39D9FF] text-[#08090B] text-xs font-semibold hover:bg-[#63E3FF] transition-all"
            >
              Return to AI-Recruit360 Homepage
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-[#242932] py-4 text-center text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360 Candidate Intelligence Portal
      </footer>
    </div>
  );
}
