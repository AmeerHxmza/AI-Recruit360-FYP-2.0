"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOrGenerateAssessmentAction,
  submitAssessmentAnswerAction,
  finalizeAssessmentAction,
} from "@/app/actions/assessment";
import type {
  PythonMCQItem,
  PythonAssessmentFinalResult,
} from "@/lib/api/ai-service-client";
import { CandidateShell } from "@/components/layout/candidate-shell";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import {
  AntiCheatStatusBadge,
  AntiCheatWarningModal,
} from "@/components/assessment/anti-cheat-guard";

export default function AssessmentPage() {
  const applicationId = String(useParams()["application-id"]);
  const router = useRouter();
  const [question, setQuestion] = useState<PythonMCQItem | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(60);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<PythonAssessmentFinalResult | null>(
    null,
  );
  const lock = useRef(false);

  const {
    violationCount,
    warningMessage,
    showWarningModal,
    dismissWarning,
    recordViolation,
  } = useAntiCheat({
    enabled: !result && !busy && !!question,
    sessionId: applicationId,
    maxViolations: 3,
    onMaxViolationsReached: () => {
      // Force auto-advance/submit on severe repeated violations
      if (selected) {
        void submit(selected);
      } else {
        void submit("TIMEOUT");
      }
    },
  });
  const load = useCallback(async () => {
    try {
      const res = await getOrGenerateAssessmentAction(applicationId);
      if (!res.success || !res.data)
        throw new Error(res.error || "Could not load assessment.");
      const a = res.data.assessment;
      if (a.status === "completed" || res.data.questions.length === 0) {
        const final = await finalizeAssessmentAction(a.id);
        if (!final.success || !final.data)
          throw new Error(
            final.error ||
              "Could not finish assessment. Retry to save your result.",
          );
        setResult(final.data);
        setQuestion(null);
        return;
      }
      setQuestion(res.data.questions[0]);
      setDeadline(res.data.deadline);
      setSelected("");
      setRemaining(
        Math.max(
          0,
          Math.ceil((Date.parse(res.data.deadline || "") - Date.now()) / 1000),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load assessment.");
    } finally {
      setBusy(false);
    }
  }, [applicationId]);
  useEffect(() => {
    // Begin the request after subscription setup; Strict Mode cleanup cancels its start.
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const submit = useCallback(
    async (answer: string) => {
      if (!question || lock.current) return;
      lock.current = true;
      setBusy(true);
      setError("");
      try {
        const res = await submitAssessmentAnswerAction(
          question.assessment_id!,
          question.id,
          question.question_number,
          answer,
          0,
        );
        if (!res.success)
          throw new Error(res.error || "Could not save this answer.");
        await load();
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not save this answer. Retry below.",
        );
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [question, load],
  );
  useEffect(() => {
    if (!deadline || !question || busy || error) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((Date.parse(deadline) - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (seconds === 0) void submit("TIMEOUT");
    };
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [deadline, question, busy, error, submit]);
  return (
    <CandidateShell step={2}>
      <AntiCheatWarningModal
        isOpen={showWarningModal}
        message={warningMessage}
        violationCount={violationCount}
        maxViolations={3}
        onDismiss={dismissWarning}
      />
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow">Skills assessment</p>
          <h1 className="page-title">Show what you know.</h1>
          <p className="mt-2 text-text-secondary">
            10 role-specific questions. You have 60 seconds per question. Answers
            are saved as you go.
          </p>
        </div>
        <AntiCheatStatusBadge violationCount={violationCount} maxViolations={3} />
      </div>
      {error && (
        <div role="alert" className="notice-error mb-5">
          <p className="font-semibold">{error}</p>
          {error.toLowerCase().includes("session has expired") ||
          error.toLowerCase().includes("invalid application session") ? (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-text-secondary">
              <p>
                Candidate assessment links expire after 24 hours to protect test integrity and ensure fair, timed evaluations. If you need your session re-activated, please reach out to your recruitment contact and provide your reference ID:
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-text-muted">Application Ref:</span>
                <code className="rounded border border-border bg-surface px-2 py-0.5 font-semibold text-text-primary">
                  {applicationId}
                </code>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => {
                setBusy(true);
                setError("");
                void load();
              }}
            >
              Retry
            </Button>
          )}
        </div>
      )}
      {result ? (
        <section className="panel p-8">
          <CheckCircle2 className="mb-4 size-8 text-success" />
          <h2 className="text-xl font-semibold">Assessment saved</h2>
          <p className="my-4 text-text-secondary">
            You answered {result.correct_answers} of {result.total_questions}{" "}
            correctly ({result.percentage}%).
          </p>
          {result.passed ? (
            <Button
              onClick={() => router.push(`/interview-room/${applicationId}`)}
            >
              Continue to interview
            </Button>
          ) : (
            <p>
              Your result is available to the recruitment team. You have not met
              the threshold for the interview stage.
            </p>
          )}
        </section>
      ) : busy ? (
        <div role="status" className="panel flex items-center gap-3 p-8">
          <Loader2 className="size-5 animate-spin text-action-blue" />
          Preparing your next step. Your saved answers are safe.
        </div>
      ) : (
        question && (
          <section
            className="panel p-5 sm:p-8 select-none"
            onCopy={(e) => {
              e.preventDefault();
              recordViolation(
                "COPY_ATTEMPT",
                "Copying assessment questions is disabled to protect test integrity.",
              );
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              recordViolation(
                "COPY_ATTEMPT",
                "Right-click context menu is disabled on assessment questions.",
              );
            }}
          >
            <div className="mb-6 flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">
                Question {question.question_number} of 10 ·{" "}
                {question.skill_category}
              </span>
              <span
                className={`flex shrink-0 items-center gap-2 font-semibold tabular-nums ${remaining <= 10 ? "text-danger" : "text-text-primary"}`}
              >
                <Clock className="size-4" />
                {remaining}s
              </span>
            </div>
            <h2 className="mb-6 text-lg font-semibold leading-relaxed">
              {question.question}
            </h2>
            <fieldset disabled={busy} className="space-y-3">
              <legend className="sr-only">Choose one answer</legend>
              {(["A", "B", "C", "D"] as const).map((letter) => (
                <label
                  key={letter}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${selected === letter ? "border-action-blue bg-action-blue/5" : "border-border hover:bg-hover"}`}
                >
                  <input
                    className="mt-1 accent-[var(--action-blue)]"
                    type="radio"
                    name="answer"
                    checked={selected === letter}
                    onChange={() => setSelected(letter)}
                  />
                  <span>
                    <strong className="mr-2">{letter}.</strong>
                    {
                      question[
                        `option_${letter.toLowerCase()}` as keyof PythonMCQItem
                      ]
                    }
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="mt-7 flex justify-end">
              <Button
                disabled={!selected || busy}
                onClick={() => void submit(selected)}
              >
                Save answer and continue
              </Button>
            </div>
          </section>
        )
      )}
    </CandidateShell>
  );
}
