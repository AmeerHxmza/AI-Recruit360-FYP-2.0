"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ApplicationShell } from "@/components/layout/application-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2, AlertCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { 
  initializeInterviewAction, 
  getNextInterviewQuestionAction, 
  submitInterviewResponseAction,
  transcribeAudioAction,
  finalizeEvaluationAction
} from "@/app/actions/interview";

type InterviewState = "CONNECTING" | "LISTENING" | "THINKING" | "SPEAKING" | "COMPLETED" | "ERROR";

export default function CandidateInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.["application-id"] as string;

  const [interviewState, setInterviewState] = React.useState<InterviewState>("CONNECTING");
  const [interviewId, setInterviewId] = React.useState<string | null>(null);
  const [questionId, setQuestionId] = React.useState<string | null>(null);
  
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState<number>(0);
  const [totalQuestions, setTotalQuestions] = React.useState<number>(0);
  const [questionText, setQuestionText] = React.useState<string>("");
  
  const [transcript, setTranscript] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioContextRef = React.useRef<HTMLAudioElement | null>(null);

  async function handleCompletion() {
    setInterviewState("COMPLETED");
    if (applicationId) {
      // Trigger final evaluation scorecard generation asynchronously
      finalizeEvaluationAction(applicationId).catch((err) => console.error("Final eval error", err));
    }
  }

  async function playTTSAudio(text: string) {
    setInterviewState("SPEAKING");
    try {
      // Proxy through secure Next.js API
      const res = await fetch(`/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, applicationId: params?.["application-id"] })
      });
      
      if (!res.ok) {
        throw new Error("TTS Failed");
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioContextRef.current = audio;
      
      audio.onended = () => {
        setInterviewState("LISTENING");
      };
      
      await audio.play();
    } catch (err) {
      console.warn("TTS Playback failed, falling back to text only.", err);
      // Fallback: Just let the candidate read the text and respond
      setInterviewState("LISTENING");
    }
  }

  // Recovery & Initialization
  async function fetchNextQuestion(id: string) {
    setInterviewState("THINKING");
    try {
      const qRes = await getNextInterviewQuestionAction(id);
      if (!qRes.success || !qRes.data) {
        setErrorMsg(qRes.error || "Failed to load next question.");
        setInterviewState("ERROR");
        return;
      }
      
      const qData = qRes.data as Record<string, unknown>;
      if (qData.completed) {
        handleCompletion();
        return;
      }

      const q = qData.current_question as Record<string, unknown>;
      if (q) {
        setCurrentQuestionNumber(q.question_number as number);
        setTotalQuestions(qData.total_questions as number);
        setQuestionText(q.question_text as string);
        setQuestionId((q.id as string) || "temp-id"); // The id might be nested in the schema
        setTranscript("");
        setErrorMsg(null);
        // Play audio TTS
        playTTSAudio(q.question_text as string);
      } else {
        setInterviewState("LISTENING");
      }

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error while fetching question.";
      setErrorMsg(errMsg);
      setInterviewState("ERROR");
    }
  }

  React.useEffect(() => {
    if (!applicationId) return;
    
    let isMounted = true;
    
    const init = async () => {
      try {
        // 1. Initialize or recover session
        const initRes = await initializeInterviewAction(applicationId);
        if (!isMounted) return;
        
        if (!initRes.success || !initRes.data) {
          setErrorMsg(initRes.error || "Failed to initialize interview.");
          setInterviewState("ERROR");
          return;
        }

        const data = initRes.data as Record<string, unknown>;
        setInterviewId(data.interview_id as string);
        setTotalQuestions((data.total_questions as number) || 5);
        
        // 2. Get current question state
        await fetchNextQuestion(data.interview_id as string);
      } catch (err: unknown) {
        if (!isMounted) return;
        const errMsg = err instanceof Error ? err.message : "Failed to connect.";
        setErrorMsg(errMsg);
        setInterviewState("ERROR");
      }
    };

    init();

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);



;

  async function handleStartRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Microphone access is not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await handleAudioSubmission(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg(null);
    } catch (err: unknown) {
      console.error("Microphone permission denied or failure:", err);
      setErrorMsg("Microphone access is required to continue the interview. Please allow microphone permissions and try again.");
    }
  };

  function handleStopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInterviewState("THINKING");
    }
  };

  async function handleAudioSubmission(blob: Blob) {
    setInterviewState("THINKING");
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("audio", blob, "response.webm");

    try {
      // 1. Transcribe Audio
      const sttRes = await transcribeAudioAction(formData);
      
      if (!sttRes.success || !sttRes.data) {
        setErrorMsg("Failed to upload audio. Please retry your answer.");
        setInterviewState("LISTENING"); // Revert so they can retry
        return;
      }
      
      const transcribedText = sttRes.data.transcript;
      setTranscript(transcribedText);

      // 2. Submit Response
      if (interviewId && questionId) {
        const evalRes = await submitInterviewResponseAction(interviewId, questionId, transcribedText);
        if (!evalRes.success) {
          setErrorMsg("Failed to evaluate response. The transcript was saved. Please continue.");
          // We could allow them to retry or fetch next question.
          // For resilience, let's fetch the next question anyway so they aren't stuck forever.
        }
        
        // 3. Get Next Question
        await fetchNextQuestion(interviewId);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during submission.";
      setErrorMsg(errMsg);
      setInterviewState("LISTENING");
    }
  };

;

  return (
    <ApplicationShell pageBreadcrumb={["Interview Room"]}>
      <div className="min-h-screen bg-[#06080A] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        
        {/* Progress Header */}
        <div className="w-full max-w-4xl text-center mb-8 space-y-2">
          <h1 className="text-xl font-bold text-[#F5F7FA] font-display tracking-wide uppercase">AI-Recruit360 Interview</h1>
          {interviewState !== "COMPLETED" && totalQuestions > 0 && (
            <p className="text-xs text-[#A7AFBC] font-mono">
              Question {currentQuestionNumber} of {totalQuestions}
            </p>
          )}
        </div>

        {/* Main Interface Room */}
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Avatar & State Column */}
          <Card className="flex flex-col items-center justify-center p-8 bg-[#0D0F12] border-[#242932] shadow-2xl rounded-2xl min-h-[400px]">
            {interviewState === "COMPLETED" ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-[#35D07F] mx-auto" />
                <h2 className="text-lg font-bold text-[#F5F7FA]">Interview Completed</h2>
                <p className="text-sm text-[#A7AFBC] max-w-sm mx-auto leading-relaxed">
                  Thank you. Your responses have been submitted for evaluation. You may now close this window.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className={`absolute -inset-1 rounded-full blur-md opacity-30 transition-all duration-700 ${
                    interviewState === "SPEAKING" ? "bg-[#39D9FF] scale-110" :
                    interviewState === "LISTENING" ? "bg-[#35D07F] scale-100" :
                    "bg-[#FFB03A] animate-pulse"
                  }`} />
                  <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-[#1C2027] bg-[#12151A]">
                    <Image
                      src="/images/feature-ai-interview.png"
                      alt="AI Interviewer Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F5F7FA]">AI-Recruit360 Interviewer</h3>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono">
                    {interviewState === "CONNECTING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFB03A]" /> <span className="text-[#FFB03A]">Connecting...</span></>}
                    {interviewState === "THINKING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFB03A]" /> <span className="text-[#FFB03A]">Processing...</span></>}
                    {interviewState === "SPEAKING" && <><PlayCircle className="h-3.5 w-3.5 text-[#39D9FF]" /> <span className="text-[#39D9FF]">Speaking...</span></>}
                    {interviewState === "LISTENING" && <><Mic className="h-3.5 w-3.5 text-[#35D07F] animate-pulse" /> <span className="text-[#35D07F]">Listening...</span></>}
                    {interviewState === "ERROR" && <><AlertCircle className="h-3.5 w-3.5 text-[#FF5C67]" /> <span className="text-[#FF5C67]">Error Encountered</span></>}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Transcript & Controls Column */}
          <Card className="flex flex-col p-6 bg-[#0D0F12] border-[#242932] shadow-2xl rounded-2xl min-h-[400px]">
            {/* Transcript Area */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {questionText && interviewState !== "COMPLETED" && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#39D9FF] uppercase tracking-wider">AI Question</span>
                  <div className="p-4 rounded-xl bg-[#12151A] border border-[#1C2027] text-sm text-[#F5F7FA] leading-relaxed">
                    {questionText}
                  </div>
                </div>
              )}

              {transcript && interviewState !== "COMPLETED" && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#35D07F] uppercase tracking-wider">Your Transcript</span>
                  <div className="p-4 rounded-xl bg-[#12151A] border border-[#1C2027] text-sm text-[#A7AFBC] leading-relaxed italic">
                    &quot;{transcript}&quot;
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#FF5C67] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#FF5C67] leading-relaxed">{errorMsg}</p>
                </div>
              )}
            </div>

            {/* Microphone Controls */}
            {interviewState !== "COMPLETED" && (
              <div className="pt-6 mt-4 border-t border-[#242932] flex items-center justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="text-xs"
                >
                  End Interview
                </Button>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button 
                      variant="ai"
                      onClick={handleStartRecording}
                      disabled={interviewState !== "LISTENING" && interviewState !== "ERROR"}
                      className="gap-2"
                    >
                      <Mic className="h-4 w-4" /> Start Speaking
                    </Button>
                  ) : (
                    <Button 
                      variant="danger"
                      onClick={handleStopRecording}
                      className="gap-2 animate-pulse"
                    >
                      <Square className="h-4 w-4" /> Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </ApplicationShell>
  );
}
