"use client";
import "../interview-room.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  initializeInterviewAction,
  getNextInterviewQuestionAction,
  submitInterviewResponseAction,
  transcribeAudioAction,
  finalizeEvaluationAction,
} from "@/app/actions/interview";
import { CandidateShell } from "@/components/layout/candidate-shell";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";

import { SimliAvatarPlayer } from "@/components/interview/simli-avatar-player";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import {
  AntiCheatStatusBadge,
  AntiCheatWarningModal,
} from "@/components/assessment/anti-cheat-guard";

type Question = { id: string; question_number: number; question_text: string };
export default function InterviewPage() {
  const applicationId = String(useParams()["application-id"]);
  const [interviewId, setInterviewId] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const locked = useRef(false);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    violationCount,
    warningMessage,
    showWarningModal,
    dismissWarning,
    recordViolation,
  } = useAntiCheat({
    enabled: !complete && !!question && !busy,
    sessionId: applicationId,
    maxViolations: 3,
  });
  useEffect(
    () => () => {
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      if (recorder.current) recorder.current.onstop = null;
      stream.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
    },
    [],
  );
  async function next(id: string) {
    const res = await getNextInterviewQuestionAction(id);
    if (!res.success || !res.data)
      throw new Error(res.error || "Could not load the next question.");
    if (res.data.completed) {
      const evaluation = await finalizeEvaluationAction(applicationId);
      if (!evaluation.success)
        throw new Error(
          evaluation.error ||
            "Your answers are saved. Retry to prepare the scorecard.",
        );
      setComplete(true);
      setQuestion(null);
      return;
    }
    const q = res.data.current_question as Question | undefined;
    if (!q?.id) throw new Error("Question could not be loaded. Please retry.");
    setQuestion(q);
    setAnswer(sessionStorage.getItem(`answer:${q.id}`) || "");
  }
  async function start() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      let id = interviewId;
      if (!id) {
        const res = await initializeInterviewAction(applicationId);
        if (!res.success || !res.data)
          throw new Error(res.error || "Could not open interview.");
        id = String(res.data.interview_id || res.data.id);
        setInterviewId(id);
      }
      await next(id);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not continue the interview.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function submit() {
    if (!question || !answer.trim() || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    window.speechSynthesis?.cancel();
    try {
      const res = await submitInterviewResponseAction(
        interviewId,
        question.id,
        answer.trim(),
      );
      if (!res.success)
        throw new Error(
          res.error || "Could not save your answer. Your draft is preserved.",
        );
      sessionStorage.removeItem(`answer:${question.id}`);
      await next(interviewId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your answer.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function record() {
    setError("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const media = new MediaRecorder(stream.current);
      recorder.current = media;
      const chunks: Blob[] = [];
      media.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      media.onstop = async () => {
        if (recordingTimer.current) clearTimeout(recordingTimer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setBusy(true);
        const form = new FormData();
        const mime = media.mimeType || "audio/webm";
        form.set(
          "audio",
          new Blob(chunks, { type: mime }),
          mime.includes("mp4") ? "answer.mp4" : "answer.webm",
        );
        form.set("applicationId", applicationId);
        try {
          if (
            chunks.reduce((size, chunk) => size + chunk.size, 0) >
            4 * 1024 * 1024
          )
            throw new Error(
              "Recording is too large. Please record a shorter answer or type it below.",
            );
          const res = await transcribeAudioAction(form);
          if (!res.success || !res.data)
            throw new Error(
              res.error || "Could not transcribe. You can type your answer.",
            );
          setAnswer(res.data.transcript);
          if (question)
            sessionStorage.setItem(
              `answer:${question.id}`,
              res.data.transcript,
            );
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Could not transcribe audio.",
          );
        } finally {
          setBusy(false);
        }
      };
      media.start();
      setRecording(true);
      recordingTimer.current = setTimeout(() => {
        if (media.state === "recording") media.stop();
      }, 180000);
    } catch {
      setError("Microphone is unavailable. You can type your answer below.");
    }
  }
  return (
    <CandidateShell step={3} interview>
      <AntiCheatWarningModal
        isOpen={showWarningModal}
        message={warningMessage}
        violationCount={violationCount}
        maxViolations={3}
        onDismiss={dismissWarning}
      />
      <div className="interview-intro flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow">Structured interview</p>
          <h1 className="page-title">A conversation about your work.</h1>
          <p className="interview-description text-text-secondary mt-2">
            Five questions about your experience and this role. Type your answer
            or record it, then review the transcript before submitting.
          </p>
        </div>
        <AntiCheatStatusBadge violationCount={violationCount} maxViolations={3} />
      </div>
      {error && (
        <div role="alert" className="interview-error notice-error">
          <p className="font-semibold">{error}</p>
          {error.toLowerCase().includes("session has expired") ||
          error.toLowerCase().includes("invalid application session") ? (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-text-secondary">
              <p>
                Candidate interview sessions expire after 24 hours for security
                and candidate privacy. If you were disconnected or need an
                extension, please contact your recruitment team and share your
                reference ID:
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-text-muted">Application Ref:</span>
                <code className="rounded border border-border bg-surface px-2 py-0.5 font-semibold text-text-primary">
                  {applicationId}
                </code>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void start()}
              >
                Reload saved progress
              </Button>
            </div>
          )}
        </div>
      )}
      {complete ? (
        <div className="panel p-8">
          <CheckCircle2 className="mb-4 size-8 text-success" />
          <h2 className="text-xl font-semibold">Your interview is complete.</h2>
          <p className="my-4 text-text-secondary">
            Your answers and scorecard are saved for the recruitment team. Thank
            you for your time.
          </p>
          <Link className="text-action-blue underline" href="/">
            Return to homepage
          </Link>
        </div>
      ) : !question ? (
        <div className="panel p-8">
          <h2 className="text-lg font-semibold">Before you begin</h2>
          <ul className="my-5 list-disc space-y-3 pl-5 text-text-secondary">
            <li>Find a quiet place and keep your resume nearby.</li>
            <li>You can use text throughout; a camera is not required.</li>
            <li>Your progress is saved after every submitted answer.</li>
          </ul>
          <Button disabled={busy} onClick={() => void start()}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" />
                Preparing interview
              </>
            ) : (
              "Start or resume interview"
            )}
          </Button>
        </div>
      ) : (
        <section
          className="interview-workspace"
          aria-label="Interview workspace"
        >
          <div className="interview-prompt panel">
            <SimliAvatarPlayer
              interviewId={interviewId}
              questionId={question.id}
              paused={busy || recording}
              recording={recording}
            />
          </div>
          <div className="interview-answer panel">
            <div
              className="interview-question select-none"
              tabIndex={0}
              aria-label="Current interview question"
              onCopy={(e) => {
                e.preventDefault();
                recordViolation(
                  "COPY_ATTEMPT",
                  "Copying interview questions is disabled to preserve evaluation integrity.",
                );
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                recordViolation(
                  "COPY_ATTEMPT",
                  "Right-click context menu is disabled on interview questions.",
                );
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="eyebrow">
                  Question {question.question_number} of 5
                </span>
              </div>
              <h2 className="text-lg font-semibold leading-relaxed">
                {question.question_text}
              </h2>
            </div>
            <label
              className="mb-2 block text-base font-semibold"
              htmlFor="response"
            >
              Your answer
            </label>
            <textarea
              id="response"
              rows={8}
              maxLength={5000}
              disabled={busy || recording}
              value={answer}
              onPaste={(e) => {
                const pastedText = e.clipboardData?.getData("text") || "";
                if (pastedText.trim().length > 10) {
                  e.preventDefault();
                  recordViolation(
                    "PASTE_ATTEMPT",
                    "Pasting pre-generated text into your response is disabled. Please type or speak your answer naturally.",
                  );
                }
              }}
              onChange={(e) => {
                setAnswer(e.target.value);
                sessionStorage.setItem(`answer:${question.id}`, e.target.value);
              }}
              className="interview-response field"
              placeholder="Explain your approach, the decisions you made, and what you learned."
            />
            <div className="interview-answer-actions flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  recording ? recorder.current?.stop() : void record()
                }
              >
                {recording ? (
                  <>
                    <Square />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic />
                    Record answer
                  </>
                )}
              </Button>
              <Button
                disabled={busy || recording || !answer.trim()}
                onClick={() => void submit()}
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving and preparing
                  </>
                ) : (
                  "Submit answer"
                )}
              </Button>
            </div>
            <p className="interview-answer-help text-xs text-text-secondary">
              Record up to three minutes. Your recording is transcribed for
              review. Only submit when your answer is ready.
            </p>
          </div>
        </section>
      )}
    </CandidateShell>
  );
}
