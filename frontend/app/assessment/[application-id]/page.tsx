"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { 
  getOrGenerateAssessmentAction, 
  submitAssessmentAnswerAction, 
  finalizeAssessmentAction 
} from "@/app/actions/assessment";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PythonMCQItem, PythonAssessmentFinalResult } from "@/lib/api/ai-service-client";

export default function CandidateAssessmentPage() {
  const params = useParams();
  const applicationId = (params?.["application-id"] as string) || "";

  const [questions, setQuestions] = React.useState<PythonMCQItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // State Management
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [submitting, setSubmitting] = React.useState(false);
  const [assessmentComplete, setAssessmentComplete] = React.useState(false);
  const [finalResult, setFinalResult] = React.useState<PythonAssessmentFinalResult | null>(null);

  // Fetch Assessment on Mount
  React.useEffect(() => {
    if (!applicationId) return;
    let isMounted = true;

    getOrGenerateAssessmentAction(applicationId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data && res.data.length > 0) {
        setQuestions(res.data);
      } else {
        setError(res.error || "Failed to load assessment. You may not be qualified for this step.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [applicationId]);

  const handleAnswerSubmit = React.useCallback(async (selectedOption: string) => {
    if (submitting || !questions[currentIdx]) return;
    setSubmitting(true);

    const question = questions[currentIdx];
    const timeTaken = 30 - timeLeft;

    try {
      await submitAssessmentAnswerAction(
        question.assessment_id!,
        question.id,
        question.question_number,
        selectedOption,
        timeTaken
      );
    } catch (err) {
      console.error("Failed to submit answer", err);
    }

    // Move to next question or finalize
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(30);
      setSubmitting(false);
    } else {
      // Finalize Assessment
      try {
        const finalizeRes = await finalizeAssessmentAction(question.assessment_id!);
        if (finalizeRes.success && finalizeRes.data) {
          setFinalResult(finalizeRes.data);
        }
      } catch (err) {
        console.error("Failed to finalize", err);
      }
      setAssessmentComplete(true);
      setSubmitting(false);
    }
  }, [submitting, questions, currentIdx, timeLeft]);

  // Timer Logic
  React.useEffect(() => {
    if (loading || assessmentComplete || questions.length === 0 || submitting) return;

    if (timeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleAnswerSubmit("TIMEOUT");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, assessmentComplete, questions, submitting, handleAnswerSubmit]);



  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#39D9FF] animate-spin mx-auto" />
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Preparing Assessment</h2>
          <p className="text-xs text-[#A7AFBC] font-mono">Generating personalized questions based on your profile...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-4">
          <XCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Assessment Unavailable</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {error || "No questions were found for this application."}
          </p>
        </div>
      </div>
    );
  }

  if (assessmentComplete) {
    const passed = finalResult?.passed;
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-6 shadow-2xl">
          <div className={`w-16 h-16 mx-auto rounded-full border flex items-center justify-center ${passed ? 'bg-[#35D07F]/10 border-[#35D07F]/30 text-[#35D07F]' : 'bg-[#FF5C67]/10 border-[#FF5C67]/30 text-[#FF5C67]'}`}>
            {passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-[#F5F7FA]">Assessment Complete</h1>
            <p className="text-[#A7AFBC] text-sm">
              You scored <strong className="text-[#F5F7FA]">{finalResult?.correct_answers} / {finalResult?.total_questions}</strong> ({finalResult?.percentage}%)
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${passed ? 'border-[#35D07F]/30 bg-[#35D07F]/5' : 'border-[#FF5C67]/30 bg-[#FF5C67]/5'}`}>
            <p className="text-xs leading-relaxed">
              {passed 
                ? "Your assessment has been completed successfully. You may now proceed to the AI interview." 
                : "Thank you for completing the assessment. Unfortunately, your application will not proceed to the next stage."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Header */}
      <header className="border-b border-[#242932] bg-[#0D0F12] py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="#" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12151A] border border-[#242932]">
            <Clock className={`h-4 w-4 ${timeLeft <= 5 ? 'text-[#FF5C67] animate-pulse' : 'text-[#39D9FF]'}`} />
            <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-[#FF5C67]' : 'text-[#F5F7FA]'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center">
        
        {/* Progress Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 w-2 rounded-full transition-all ${idx < currentIdx ? 'bg-[#39D9FF]' : idx === currentIdx ? 'bg-[#39D9FF] scale-125 ring-2 ring-[#39D9FF]/30' : 'bg-[#242932]'}`} 
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="w-full bg-[#12151A] border border-[#242932] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {submitting && (
            <div className="absolute inset-0 bg-[#12151A]/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin" />
            </div>
          )}

          <div className="mb-6 space-y-2">
            <span className="text-xs font-mono font-bold text-[#A7AFBC] uppercase tracking-wider">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#F5F7FA] leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {[
              { id: 'A', text: currentQ.option_a },
              { id: 'B', text: currentQ.option_b },
              { id: 'C', text: currentQ.option_c },
              { id: 'D', text: currentQ.option_d }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswerSubmit(opt.id)}
                disabled={submitting}
                className="w-full text-left p-4 rounded-xl border border-[#242932] bg-[#0D0F12] hover:border-[#39D9FF] hover:bg-[#39D9FF]/5 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-[#171B21] border border-[#242932] text-xs font-mono font-bold text-[#A7AFBC] group-hover:text-[#39D9FF] group-hover:border-[#39D9FF]/50 shrink-0">
                    {opt.id}
                  </span>
                  <span className="text-sm text-[#F5F7FA] leading-relaxed mt-0.5">
                    {opt.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
