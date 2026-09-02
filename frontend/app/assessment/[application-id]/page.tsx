"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getOrGenerateAssessmentAction, 
  submitAssessmentAnswerAction, 
  finalizeAssessmentAction 
} from "@/app/actions/assessment";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PythonMCQItem, PythonAssessmentFinalResult } from "@/lib/api/ai-service-client";

export default function CandidateAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = (params?.["application-id"] as string) || "";

  const [questions, setQuestions] = React.useState<PythonMCQItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // State Management
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [submitting, setSubmitting] = React.useState(false);
  const [assessmentComplete, setAssessmentComplete] = React.useState(false);
  const [finalResult, setFinalResult] = React.useState<PythonAssessmentFinalResult | null>(null);

  // Fetch Assessment with Polling
  const fetchAssessmentRef = React.useRef<() => void>(undefined);
  
  const fetchAssessment = React.useCallback(async () => {
    if (!applicationId) return;

    try {
      const res = await getOrGenerateAssessmentAction(applicationId);
      
      if (res.success && res.data) {
        if (res.data.status === "generating") {
          // Keep polling while generating without dropping the loading spinner
          setLoading(true);
          if (fetchAssessmentRef.current) {
            setTimeout(fetchAssessmentRef.current, 2500);
          }
          return;
        }

        if (res.data.questions && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
          const assessment = res.data.assessment;
          const answers = res.data.answers || [];

          if (assessment && assessment.status === 'completed') {
            setFinalResult({
              assessment_id: assessment.id,
              total_questions: assessment.total_questions || 10,
              correct_answers: assessment.correct_answers || 0,
              score: assessment.score || 0,
              percentage: assessment.percentage || 0,
              passed: (assessment.percentage || 0) >= 60,
            });
            setAssessmentComplete(true);
          } else {
            // State recovery: skip already answered questions
            const answeredCount = answers.length;
            setCurrentIdx(Math.min(answeredCount, res.data.questions.length - 1));
          }
          setLoading(false);
          return;
        } else {
          setError("Failed to load assessment. You may not be qualified for this step.");
        }
      } else {
        setError(res.error || "Failed to load assessment. You may not be qualified for this step.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  }, [applicationId]);

  React.useEffect(() => {
    fetchAssessmentRef.current = fetchAssessment;
  }, [fetchAssessment]);

  React.useEffect(() => {
    const initFetch = async () => {
      await fetchAssessment();
    };
    initFetch();
  }, [fetchAssessment]);

  const handleAnswerSubmit = React.useCallback(async (selectedOption: string) => {
    if (submitting || assessmentComplete || questions.length === 0 || !questions[currentIdx]) return;
    setSubmitting(true);
    setSubmitError(null);

    const question = questions[currentIdx];
    const timeTaken = 30 - timeLeft;

    try {
      const res = await submitAssessmentAnswerAction(
        question.assessment_id!,
        question.id,
        question.question_number,
        selectedOption,
        timeTaken
      );

      if (!res.success) {
        setSubmitError("Failed to record answer. Please try again.");
        setSubmitting(false);
        return;
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
          } else {
            setSubmitError("Failed to finalize assessment. Please refresh the page.");
          }
        } catch (err) {
          console.error("Failed to finalize", err);
          setSubmitError("An error occurred during finalization. Please refresh the page.");
        }
        setAssessmentComplete(true);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, questions, currentIdx, timeLeft, assessmentComplete]);

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
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full mx-auto p-12 text-center rounded-2xl bg-[#131B2A] border border-[#1E293B] shadow-2xl">
          <Loader2 className="h-8 w-8 text-[#38BDF8] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Preparing Your Assessment</h2>
          <p className="text-sm text-[#94A3B8]">Our AI is currently analyzing your candidate profile and generating personalized questions for this role. This may take up to 10-15 seconds.</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] text-center space-y-4 shadow-xl">
          <XCircle className="h-10 w-10 text-[#EF4444] mx-auto" />
          <h2 className="text-lg font-bold tracking-tight text-[#F8FAFC]">Assessment Unavailable</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {error || "No questions were found for this application."}
          </p>
        </div>
      </div>
    );
  }

  if (assessmentComplete) {
    const passed = finalResult?.passed;
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] text-center space-y-6 shadow-2xl">
          <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center ${passed ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'}`}>
            {passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Assessment Complete</h1>
            <p className="text-[#94A3B8] text-sm">
              You scored <strong className="text-[#F8FAFC]">{finalResult?.correct_answers} / {finalResult?.total_questions}</strong> ({finalResult?.percentage}%)
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${passed ? 'border-[#10B981]/30 bg-[#10B981]/5' : 'border-[#EF4444]/30 bg-[#EF4444]/5'}`}>
            <p className="text-xs leading-relaxed mb-4 text-[#94A3B8]">
              {passed 
                ? "Your assessment has been completed successfully. You may now proceed to the AI interview." 
                : "Thank you for completing the assessment. Unfortunately, your application will not proceed to the next stage."}
            </p>
            {passed && (
              <Button 
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/20 font-semibold"
                onClick={() => router.push(`/interview-room/${applicationId}`)}
              >
                Proceed to AI Interview
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#2563EB]/25 selection:text-[#38BDF8]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0F1523] py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="#" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131B2A] border border-[#1E293B]">
            <Clock className={`h-4 w-4 ${timeLeft <= 5 ? 'text-[#EF4444] animate-pulse' : 'text-[#38BDF8]'}`} />
            <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-[#EF4444]' : 'text-[#F8FAFC]'}`}>
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
              className={`h-2 w-2 rounded-full transition-all ${idx < currentIdx ? 'bg-[#2563EB]' : idx === currentIdx ? 'bg-[#38BDF8] scale-125 ring-2 ring-[#38BDF8]/40' : 'bg-[#1E293B]'}`} 
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="w-full bg-[#131B2A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {submitting && (
            <div className="absolute inset-0 bg-[#131B2A]/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#38BDF8] animate-spin" />
            </div>
          )}

          <div className="mb-6 space-y-2">
            <span className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC] leading-relaxed">
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
                className="w-full text-left p-4 rounded-xl border border-[#1E293B] bg-[#0F1523] hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#182236] border border-[#1E293B] text-xs font-mono font-bold text-[#94A3B8] group-hover:text-[#38BDF8] group-hover:border-[#2563EB]/50 shrink-0">
                    {opt.id}
                  </span>
                  <span className="text-sm text-[#F8FAFC] leading-relaxed mt-0.5">
                    {opt.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {submitError && (
            <div className="mt-6 p-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">Submission Error</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                  {submitError}
                </p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
