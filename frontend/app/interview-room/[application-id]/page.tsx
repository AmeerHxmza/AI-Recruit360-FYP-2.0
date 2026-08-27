"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Square, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  Send, 
  Edit3, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  initializeInterviewAction, 
  getNextInterviewQuestionAction, 
  submitInterviewResponseAction,
  transcribeAudioAction,
  finalizeEvaluationAction,
  getSimliTokenAction,
  degradeAvatarAction
} from "@/app/actions/interview";
import { SimliClient } from "simli-client/dist/client";

type InterviewState = "CONNECTING" | "LISTENING" | "THINKING" | "SPEAKING" | "COMPLETED" | "ERROR";

export default function CandidateInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.["application-id"] as string;

  const [interviewState, setInterviewState] = React.useState<InterviewState>("CONNECTING");
  const [interviewId, setInterviewId] = React.useState<string | null>(null);
  const [questionId, setQuestionId] = React.useState<string | null>(null);
  
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState<number>(1);
  const [totalQuestions, setTotalQuestions] = React.useState<number>(5);
  const [questionText, setQuestionText] = React.useState<string>("");
  
  const [transcript, setTranscript] = React.useState<string>("");
  const [manualText, setManualText] = React.useState<string>("");
  const [showManualInput, setShowManualInput] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioContextRef = React.useRef<HTMLAudioElement | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const simliClientRef = React.useRef<SimliClient | null>(null);
  const [isSimliActive, setIsSimliActive] = React.useState<boolean>(false);

  const handleCompletion = React.useCallback(async () => {
    setInterviewState("COMPLETED");
    if (simliClientRef.current) {
      simliClientRef.current.stop().catch(console.error);
      simliClientRef.current = null;
    }
    if (applicationId) {
      finalizeEvaluationAction(applicationId).catch((err) => console.error("Final eval error", err));
    }
  }, [applicationId]);

  const playTTSAudio = React.useCallback(async (text: string) => {
    if (!text) return;
    setInterviewState("SPEAKING");
    setIsPlayingAudio(true);

    try {
      const res = await fetch(`/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, applicationId })
      });
      
      if (!res.ok) {
        throw new Error("TTS streaming failed");
      }
      
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      if (simliClientRef.current && isSimliActive) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass({ sampleRate: 16000 });
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
        const pcmFloat32 = decodedData.getChannelData(0);
        const pcmInt16 = new Int16Array(pcmFloat32.length);
        for (let i = 0; i < pcmFloat32.length; i++) {
          pcmInt16[i] = Math.max(-1, Math.min(1, pcmFloat32[i])) * 0x7FFF;
        }
        const uint8Array = new Uint8Array(pcmInt16.buffer);
        simliClientRef.current.sendAudioData(uint8Array);
        
        const durationSeconds = uint8Array.length / 32000;
        setTimeout(() => {
          setIsPlayingAudio(false);
          setInterviewState("LISTENING");
        }, (durationSeconds * 1000) + 400);
      } else {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioContextRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          setInterviewState("LISTENING");
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setInterviewState("LISTENING");
        };

        await audio.play();
      }
      
    } catch (err) {
      console.warn("TTS Playback fallback to text:", err);
      setIsPlayingAudio(false);
      setInterviewState("LISTENING");
    }
  }, [applicationId, isSimliActive]);

  const fetchNextQuestion = React.useCallback(async (targetInterviewId: string) => {
    if (!targetInterviewId) return;
    setInterviewState("THINKING");
    setErrorMsg(null);
    setTranscript("");
    setManualText("");

    try {
      const qRes = await getNextInterviewQuestionAction(targetInterviewId);
      if (!qRes.success || !qRes.data) {
        setErrorMsg(qRes.error || "Failed to fetch question.");
        setInterviewState("ERROR");
        return;
      }
      
      const qData = qRes.data as {
        completed?: boolean;
        current_question?: {
          id?: string;
          question_number: number;
          question_text: string;
          question_type: string;
          skill_category: string;
        } | null;
        questions_answered?: number;
        total_questions?: number;
      };

      if (qData.completed || !qData.current_question) {
        await handleCompletion();
        return;
      }

      const q = qData.current_question;
      setCurrentQuestionNumber(q.question_number || ((qData.questions_answered || 0) + 1));
      setTotalQuestions(qData.total_questions || 5);
      setQuestionText(q.question_text);
      setQuestionId(q.id || `q-${q.question_number}`);
      
      // Play TTS narration
      playTTSAudio(q.question_text);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error fetching interview question.";
      setErrorMsg(msg);
      setInterviewState("ERROR");
    }
  }, [handleCompletion, playTTSAudio]);

  // Initial Connect
  React.useEffect(() => {
    if (!applicationId) return;
    let isMounted = true;

    const init = async () => {
      try {
        setInterviewState("CONNECTING");
        const initRes = await initializeInterviewAction(applicationId);
        if (!isMounted) return;

        if (!initRes.success || !initRes.data) {
          setErrorMsg(initRes.error || "Failed to initialize interview.");
          setInterviewState("ERROR");
          return;
        }

        const data = initRes.data as {
          id?: string;
          interview_id?: string;
          total_questions?: number;
        };

        const resolvedId = (data.interview_id || data.id) as string;
        if (!resolvedId) {
          throw new Error("Missing interview identifier from server response.");
        }

        setInterviewId(resolvedId);
        setTotalQuestions(data.total_questions || 5);

        // Try initializing Simli Avatar if available
        try {
          const tokenRes = await getSimliTokenAction();
          if (tokenRes.success && tokenRes.data?.session_token && videoRef.current && audioRef.current) {
            const simliClient = new SimliClient(
              tokenRes.data.session_token,
              videoRef.current,
              audioRef.current,
              null
            );
            simliClientRef.current = simliClient;
            
            simliClient.on("start", () => {
              setIsSimliActive(true);
            });

            simliClient.on("error", (err) => {
              console.warn("Simli avatar stream error:", err);
              setIsSimliActive(false);
              degradeAvatarAction(resolvedId).catch(() => {});
            });

            simliClient.on("startup_error", (err) => {
              console.warn("Simli avatar startup error:", err);
              setIsSimliActive(false);
            });

            await simliClient.start();
            setIsSimliActive(true);
          }
        } catch (simliErr) {
          console.warn("Simli avatar initialization failed:", simliErr);
          setIsSimliActive(false);
        }

        // Fetch First / Active Question
        await fetchNextQuestion(resolvedId);

      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Could not start interview session.";
        setErrorMsg(msg);
        setInterviewState("ERROR");
      }
    };

    init();

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
      if (simliClientRef.current) {
        simliClientRef.current.stop().catch(console.error);
      }
    };
  }, [applicationId, fetchNextQuestion]);

  // Audio Recording
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Microphone access is not supported on this browser. You can type your response below.");
      setShowManualInput(true);
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
        stream.getTracks().forEach((t) => t.stop());
        await processAndSubmitAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg(null);
    } catch (err) {
      console.warn("Microphone access error:", err);
      setErrorMsg("Microphone permission denied. Please allow microphone access or type your answer below.");
      setShowManualInput(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInterviewState("THINKING");
    }
  };

  const processAndSubmitAudio = async (blob: Blob) => {
    setInterviewState("THINKING");
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("audio", blob, "response.webm");

    try {
      const sttRes = await transcribeAudioAction(formData);
      if (!sttRes.success || !sttRes.data || !sttRes.data.transcript) {
        setErrorMsg("Could not clearly transcribe audio. Please review and type or retry speaking.");
        setShowManualInput(true);
        setInterviewState("LISTENING");
        return;
      }

      const text = sttRes.data.transcript;
      setTranscript(text);
      await submitAnswer(text);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing voice response.";
      setErrorMsg(msg);
      setShowManualInput(true);
      setInterviewState("LISTENING");
    }
  };

  const submitAnswer = async (responseText: string) => {
    if (!responseText.trim()) {
      setErrorMsg("Response cannot be empty.");
      setInterviewState("LISTENING");
      return;
    }

    if (!interviewId) {
      setErrorMsg("Missing interview session ID. Please refresh.");
      setInterviewState("ERROR");
      return;
    }

    setInterviewState("THINKING");
    setErrorMsg(null);

    try {
      await submitInterviewResponseAction(interviewId, questionId || "current-q", responseText);
      await fetchNextQuestion(interviewId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record response.";
      setErrorMsg(msg);
      // Fetch next question anyway so candidate is not stuck
      await fetchNextQuestion(interviewId);
    }
  };

  // Completed Screen
  if (interviewState === "COMPLETED") {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full border border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-[#F5F7FA]">Interview Completed</h1>
            <p className="text-[#A7AFBC] text-sm leading-relaxed">
              Thank you for completing your technical AI interview. Your responses, explanations, and communication scores have been submitted.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#39D9FF]/20 bg-[#39D9FF]/5 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#39D9FF]">
              <Sparkles className="h-4 w-4" />
              <span>Next Steps</span>
            </div>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Our automated hiring intelligence engine is generating your consolidated hiring scorecard. You will receive an update from the hiring team shortly.
            </p>
          </div>

          <Button 
            variant="ai"
            className="w-full gap-2"
            onClick={() => router.push("/")}
          >
            <span>Return to AI-Recruit360</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Top Header */}
      <header className="border-b border-[#242932] bg-[#0D0F12] py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="#" />

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12151A] border border-[#242932] text-xs font-mono">
              {interviewState === "CONNECTING" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFB03A]" />
                  <span className="text-[#FFB03A]">Connecting...</span>
                </>
              )}
              {interviewState === "SPEAKING" && (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#39D9FF] animate-pulse" />
                  <span className="text-[#39D9FF]">AI Speaking</span>
                </>
              )}
              {interviewState === "LISTENING" && (
                <>
                  <Mic className="h-3.5 w-3.5 text-[#35D07F] animate-pulse" />
                  <span className="text-[#35D07F]">Listening</span>
                </>
              )}
              {interviewState === "THINKING" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#39D9FF]" />
                  <span className="text-[#39D9FF]">Evaluating...</span>
                </>
              )}
              {interviewState === "ERROR" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[#FF5C67]" />
                  <span className="text-[#FF5C67]">Attention</span>
                </>
              )}
            </div>

            {/* Question Counter */}
            <div className="px-3 py-1.5 rounded-full bg-[#12151A] border border-[#242932] text-xs font-mono text-[#A7AFBC]">
              Question <strong className="text-[#F5F7FA]">{currentQuestionNumber}</strong> of {totalQuestions}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center gap-8">
        
        {/* Top AI Interviewer Persona Card */}
        <div className="p-8 rounded-2xl border border-[#242932] bg-[#12151A] shadow-xl flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar / Audio Pulse Orb */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Ambient Animated Glow Aura */}
            <div className={`absolute -inset-2 rounded-full blur-xl opacity-40 transition-all duration-700 ${
              interviewState === "SPEAKING" ? "bg-[#39D9FF] scale-125" :
              isRecording ? "bg-[#FF5C67] scale-125 animate-pulse" :
              interviewState === "LISTENING" ? "bg-[#35D07F] scale-110" :
              "bg-[#FFB03A] scale-100"
            }`} />

            <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-[#242932] bg-[#0D0F12] flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover transition-opacity duration-300 ${isSimliActive ? "opacity-100 block" : "opacity-0 hidden"}`}
              />
              <audio ref={audioRef} autoPlay className="hidden" />

              {!isSimliActive && (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 rounded-full bg-[#39D9FF] transition-all duration-300 ${interviewState === "SPEAKING" ? "h-8 animate-pulse" : "h-3"}`} />
                    <span className={`w-1.5 rounded-full bg-[#39D9FF] transition-all duration-300 ${interviewState === "SPEAKING" ? "h-12 animate-pulse delay-75" : "h-5"}`} />
                    <span className={`w-1.5 rounded-full bg-[#39D9FF] transition-all duration-300 ${interviewState === "SPEAKING" ? "h-10 animate-pulse delay-150" : "h-4"}`} />
                    <span className={`w-1.5 rounded-full bg-[#39D9FF] transition-all duration-300 ${interviewState === "SPEAKING" ? "h-6 animate-pulse delay-100" : "h-2"}`} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Text & Controls */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#39D9FF] px-2 py-0.5 rounded bg-[#39D9FF]/10 border border-[#39D9FF]/20">
                Technical Question {currentQuestionNumber}
              </span>
              {questionText && (
                <button
                  type="button"
                  onClick={() => playTTSAudio(questionText)}
                  disabled={isPlayingAudio}
                  className="text-xs text-[#A7AFBC] hover:text-[#39D9FF] flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Replay question audio"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Replay</span>
                </button>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-medium text-[#F5F7FA] leading-relaxed">
              {questionText || (interviewState === "CONNECTING" ? "Initializing AI Interview Session..." : "Generating question...")}
            </h2>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#FF5C67] shrink-0 mt-0.5" />
            <div className="text-xs text-[#FF5C67] leading-relaxed flex-1">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Candidate Response Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#242932] bg-[#12151A] shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A7AFBC]">
              Your Response
            </span>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs text-[#A7AFBC] hover:text-[#39D9FF] flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{showManualInput ? "Use Microphone" : "Type Response"}</span>
            </button>
          </div>

          {/* Voice Interface Mode */}
          {!showManualInput ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              {transcript ? (
                <div className="w-full p-4 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#A7AFBC] italic leading-relaxed">
                  &ldquo;{transcript}&rdquo;
                </div>
              ) : (
                <p className="text-xs text-[#A7AFBC] text-center max-w-md">
                  {isRecording 
                    ? "Listening to your answer... Speak clearly into your microphone."
                    : "Click the button below when you are ready to answer."}
                </p>
              )}

              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button
                    variant="ai"
                    size="lg"
                    onClick={handleStartRecording}
                    disabled={interviewState !== "LISTENING" && interviewState !== "ERROR"}
                    className="gap-2 px-8 h-12 shadow-lg"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Start Speaking</span>
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={handleStopRecording}
                    className="gap-2 px-8 h-12 animate-pulse shadow-lg"
                  >
                    <Square className="h-5 w-5" />
                    <span>Stop &amp; Submit Answer</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Manual Text Fallback Mode */
            <div className="space-y-4">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type your technical response in detail here..."
                rows={5}
                disabled={interviewState === "THINKING"}
                className="w-full p-4 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#A7AFBC]/50 focus:outline-none focus:border-[#39D9FF] resize-none transition-colors"
              />

              <div className="flex justify-end">
                <Button
                  variant="ai"
                  onClick={() => submitAnswer(manualText)}
                  disabled={!manualText.trim() || interviewState === "THINKING"}
                  className="gap-2 px-6"
                >
                  {interviewState === "THINKING" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
