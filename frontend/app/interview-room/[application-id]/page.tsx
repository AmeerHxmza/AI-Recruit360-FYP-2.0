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
  ArrowRight,
  Video,
  ShieldCheck,
  RotateCcw,
  Bot,
  Radio,
  Clock,
  Code2,
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
import { SimliClient, LogLevel } from "simli-client";

type InterviewState = "CONNECTING" | "LISTENING" | "THINKING" | "SPEAKING" | "COMPLETED" | "ERROR";

export default function CandidateInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.["application-id"] as string;

  // Lobby & Room State
  const [hasEnteredRoom, setHasEnteredRoom] = React.useState<boolean>(false);
  const [interviewState, setInterviewState] = React.useState<InterviewState>("CONNECTING");
  const [interviewId, setInterviewId] = React.useState<string | null>(null);
  const [questionId, setQuestionId] = React.useState<string | null>(null);
  
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState<number>(1);
  const [totalQuestions, setTotalQuestions] = React.useState<number>(5);
  const [questionText, setQuestionText] = React.useState<string>("");
  const [skillCategory, setSkillCategory] = React.useState<string>("Technical Core");
  
  const [transcript, setTranscript] = React.useState<string>("");
  const [manualText, setManualText] = React.useState<string>("");
  const [showManualInput, setShowManualInput] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  
  // Refs
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioContextRef = React.useRef<HTMLAudioElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const simliClientRef = React.useRef<SimliClient | null>(null);
  const isSimliActiveRef = React.useRef<boolean>(false);
  const [isSimliActive, setIsSimliActive] = React.useState<boolean>(false);

  const updateSimliActive = (active: boolean) => {
    isSimliActiveRef.current = active;
    setIsSimliActive(active);
  };

  // Recording Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleCompletion = React.useCallback(async () => {
    setInterviewState("COMPLETED");
    if (simliClientRef.current) {
      simliClientRef.current.stop().catch(console.error);
      simliClientRef.current = null;
      updateSimliActive(false);
    }
    if (applicationId) {
      finalizeEvaluationAction(applicationId).catch((err) => console.error("Final eval error", err));
    }
  }, [applicationId]);

  const playTTSAudio = React.useCallback(async (text: string) => {
    if (!text) return;
    setInterviewState("THINKING");

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
      
      // Synchronize question text display at the exact moment audio is ready
      setQuestionText(text);
      setInterviewState("SPEAKING");
      setIsPlayingAudio(true);

      if (simliClientRef.current && isSimliActiveRef.current) {
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
      // Even if audio fails, reveal text so candidate can read
      setQuestionText(text);
      setIsPlayingAudio(false);
      setInterviewState("LISTENING");
    }
  }, [applicationId]);

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
      setSkillCategory(q.skill_category || "Technical Problem Solving");
      setQuestionId(q.id || `q-${q.question_number}`);
      
      // Dispatch ultra-low-latency TTS narration (reveals text on audio start)
      playTTSAudio(q.question_text);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error fetching interview question.";
      setErrorMsg(msg);
      setInterviewState("ERROR");
    }
  }, [handleCompletion, playTTSAudio]);

  // Start Session after candidate clicks Enter
  const handleEnterRoom = async () => {
    setHasEnteredRoom(true);
    setInterviewState("CONNECTING");
    setErrorMsg(null);

    try {
      const initRes = await initializeInterviewAction(applicationId);
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

      // Initialize Simli LiveKit WebRTC
      try {
        const tokenRes = await getSimliTokenAction();
        if (tokenRes.success && tokenRes.data?.session_token && videoRef.current && audioRef.current) {
          const simliClient = new SimliClient(
            tokenRes.data.session_token,
            videoRef.current,
            audioRef.current,
            null,
            LogLevel.INFO,
            "livekit"
          );
          simliClientRef.current = simliClient;
          
          simliClient.on("start", () => {
            updateSimliActive(true);
          });

          simliClient.on("video_info", () => {
            updateSimliActive(true);
          });

          simliClient.on("error", (err) => {
            console.warn("[Simli] WebRTC error:", err);
            updateSimliActive(false);
            degradeAvatarAction(resolvedId).catch(() => {});
          });

          simliClient.on("startup_error", (err) => {
            console.warn("[Simli] Startup error:", err);
            updateSimliActive(false);
          });

          await simliClient.start();
          updateSimliActive(true);
        } else {
          updateSimliActive(false);
        }
      } catch (simliErr) {
        console.warn("[Simli] Avatar initialization fallback:", simliErr);
        updateSimliActive(false);
      }

      // Fetch first question
      await fetchNextQuestion(resolvedId);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not start interview session.";
      setErrorMsg(msg);
      setInterviewState("ERROR");
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
      if (simliClientRef.current) {
        simliClientRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Audio Recording Handlers
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
      await fetchNextQuestion(interviewId);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Stage descriptions for the 5-step roadmap
  const stagesRoadmap = [
    { num: 1, label: "Project Deep Dive", desc: "Experience & CV Projects" },
    { num: 2, label: "Core Skills", desc: "Key Technologies & Concepts" },
    { num: 3, label: "Problem Solving", desc: "Scenario & Edge Cases" },
    { num: 4, label: "Adaptive Follow-Up", desc: "Deep Dive into Answers" },
    { num: 5, label: "System Architecture", desc: "Design & Scalability" },
  ];

  // Lobby / Welcome Screen before User Enters (Enables browser audio unlocking)
  if (!hasEnteredRoom) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
        {/* Hidden persistent DOM video/audio nodes */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <audio ref={audioRef} autoPlay className="hidden" />

        <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl border border-[#242932] bg-[#12151A] space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39D9FF] via-[#35D07F] to-[#8957FF]" />
          
          <div className="flex items-center justify-between border-b border-[#242932] pb-4">
            <BrandLogo variant="full" size="md" href="#" />
            <span className="text-xs font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 flex items-center gap-1.5 font-bold">
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#35D07F]" /> Live AI Studio
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F7FA]">Adaptive AI Voice Interview</h1>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Experience an intelligent, interactive technical interview powered by the Simli Visual Avatar and GPT-4o Mini. Your questions adapt in real time to your responses.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#0D0F12] border border-[#242932] flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#39D9FF]/10 border border-[#39D9FF]/20 text-[#39D9FF] shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-[#F5F7FA] block font-semibold text-sm">Visual AI Avatar (Simli WebRTC)</strong>
                <span className="text-[#A7AFBC] leading-relaxed">Large high-resolution visual avatar with real-time lip-synchronization and adaptive conversational expressions.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0F12] border border-[#242932] flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F] shrink-0">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-[#F5F7FA] block font-semibold text-sm">Voice AI Recording &amp; Speech-to-Text</strong>
                <span className="text-[#A7AFBC] leading-relaxed">Speak naturally into your microphone or seamlessly toggle to the code/text editor at any time.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0F12] border border-[#242932] flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#8957FF]/10 border border-[#8957FF]/20 text-[#8957FF] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-[#F5F7FA] block font-semibold text-sm">5-Stage Dynamic Evaluation</strong>
                <span className="text-[#A7AFBC] leading-relaxed">Tailored questions evaluating CV project authenticity, core technical frameworks, and architectural reasoning.</span>
              </div>
            </div>
          </div>

          <Button
            variant="ai"
            size="lg"
            className="w-full gap-2 shadow-[0_0_24px_rgba(57,217,255,0.25)] text-sm font-semibold h-12 rounded-xl"
            onClick={handleEnterRoom}
          >
            <span>Enter AI Interview Room</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (interviewState === "COMPLETED") {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full border border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center shadow-[0_0_24px_rgba(53,208,127,0.2)]">
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
            className="w-full gap-2 h-11"
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
      <header className="border-b border-[#242932] bg-[#0D0F12] py-3.5 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" size="md" href="#" />
            <span className="hidden sm:inline-block h-4 w-px bg-[#242932]" />
            <span className="hidden sm:inline-block text-xs font-mono text-[#A7AFBC]">Adaptive Voice Studio</span>
          </div>

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
                  <span className="text-[#39D9FF] font-semibold">AI Interviewer Speaking</span>
                </>
              )}
              {interviewState === "LISTENING" && (
                <>
                  <Mic className="h-3.5 w-3.5 text-[#35D07F] animate-pulse" />
                  <span className="text-[#35D07F] font-semibold">{isRecording ? "Recording Answer" : "Ready for Answer"}</span>
                </>
              )}
              {interviewState === "THINKING" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8957FF]" />
                  <span className="text-[#8957FF] font-semibold">AI Evaluating Answer...</span>
                </>
              )}
              {interviewState === "ERROR" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[#FF5C67]" />
                  <span className="text-[#FF5C67]">Attention</span>
                </>
              )}
            </div>

            {/* Question Counter Pill */}
            <div className="px-3.5 py-1.5 rounded-full bg-[#39D9FF]/10 border border-[#39D9FF]/20 text-xs font-mono text-[#39D9FF] font-bold">
              Question {currentQuestionNumber} of {totalQuestions}
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Split Screen Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-start">
        
        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#FF5C67] shrink-0 mt-0.5" />
            <div className="text-xs text-[#FF5C67] leading-relaxed flex-1">
              {errorMsg}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ════════════ LEFT PORTION: Large AI Avatar Theater + Active Question ════════════ */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Large Avatar Studio Frame */}
            <div className="relative rounded-3xl border border-[#242932] bg-[#12151A] overflow-hidden shadow-2xl p-4 sm:p-5 space-y-4">
              
              {/* Top Studio Bar */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#242932]/60 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#39D9FF]" />
                  <span className="font-bold text-[#F5F7FA]">AI Recruiter Avatar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimliActive ? "bg-[#35D07F]" : "bg-[#39D9FF]"} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimliActive ? "bg-[#35D07F]" : "bg-[#39D9FF]"}`} />
                  </span>
                  <span className="text-[11px] text-[#A7AFBC]">{isSimliActive ? "Live WebRTC HD" : "Audio Reactive"}</span>
                </div>
              </div>

              {/* Main Avatar Viewport (Generous large screen area) */}
              <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[16/11] max-h-[440px] rounded-2xl overflow-hidden border border-[#242932] bg-[#08090B] flex items-center justify-center shadow-inner group">
                
                {/* Ambient glow behind avatar */}
                <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                  interviewState === "SPEAKING" ? "bg-radial-gradient from-[#39D9FF]/20 via-transparent to-transparent opacity-100" :
                  isRecording ? "bg-radial-gradient from-[#FF5C67]/20 via-transparent to-transparent opacity-100" :
                  "opacity-30"
                }`} />

                {/* Live Simli Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover object-center transition-opacity duration-500 ${isSimliActive ? "opacity-100 block" : "opacity-0 hidden"}`}
                />
                <audio ref={audioRef} autoPlay className="hidden" />

                {/* Animated Holographic AI Avatar Graphic Fallback */}
                {!isSimliActive && (
                  <div className="relative flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="relative">
                      <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-700 ${
                        interviewState === "SPEAKING" ? "bg-[#39D9FF]/40 scale-125 animate-pulse" :
                        isRecording ? "bg-[#FF5C67]/40 scale-125 animate-pulse" :
                        "bg-[#39D9FF]/20 scale-100"
                      }`} />

                      <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border-2 border-[#39D9FF]/60 bg-gradient-to-b from-[#171B21] to-[#0D0F12] p-1 flex items-center justify-center shadow-2xl">
                        <div className="w-full h-full rounded-full bg-[#12151A] flex items-center justify-center relative overflow-hidden border border-[#242932]">
                          <svg className="w-20 h-20 text-[#39D9FF] opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>

                          {/* Lip-Sync Animated Equalizer Waves when speaking */}
                          {interviewState === "SPEAKING" && (
                            <div className="absolute bottom-2 flex items-center gap-1 px-3 py-1 rounded-full bg-[#08090B]/90 backdrop-blur-sm border border-[#39D9FF]/40 shadow-lg">
                              <span className="w-1 h-3 bg-[#39D9FF] rounded-full animate-pulse" />
                              <span className="w-1 h-6 bg-[#35D07F] rounded-full animate-bounce" />
                              <span className="w-1 h-4 bg-[#F5B942] rounded-full animate-pulse" />
                              <span className="w-1 h-6 bg-[#39D9FF] rounded-full animate-bounce" />
                              <span className="w-1 h-3 bg-[#35D07F] rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-xs font-mono font-bold text-[#F5F7FA] block">
                        {interviewState === "SPEAKING" ? "🔊 AI Interviewer Speaking Question..." : "🎙️ AI Interviewer Listening..."}
                      </span>
                      <span className="text-[11px] text-[#A7AFBC] font-mono">Live Audio Equalizer Channel</span>
                    </div>
                  </div>
                )}

                {/* Floating Waveform Pill overlay when speaking on top of video */}
                {isSimliActive && interviewState === "SPEAKING" && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#08090B]/85 backdrop-blur-md border border-[#39D9FF]/30 shadow-lg">
                    <Volume2 className="h-3.5 w-3.5 text-[#39D9FF] animate-pulse" />
                    <span className="text-[11px] font-mono text-[#39D9FF] font-semibold">Voice Streaming</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Technical Question Card */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#39D9FF]/30 bg-[#12151A] shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#39D9FF] px-2.5 py-1 rounded bg-[#39D9FF]/10 border border-[#39D9FF]/20 font-mono">
                    Question {currentQuestionNumber} of {totalQuestions}
                  </span>
                  <span className="text-[10px] font-mono text-[#A7AFBC] bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932] hidden sm:inline">
                    {skillCategory}
                  </span>
                </div>

                {questionText && (
                  <button
                    type="button"
                    onClick={() => playTTSAudio(questionText)}
                    disabled={isPlayingAudio}
                    className="text-xs text-[#A7AFBC] hover:text-[#39D9FF] flex items-center gap-1.5 transition-colors disabled:opacity-50 font-mono"
                    title="Replay question audio"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Replay Audio</span>
                  </button>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-medium text-[#F5F7FA] leading-relaxed font-sans">
                {questionText || (interviewState === "CONNECTING" ? "Initializing AI Interview Session..." : "Generating dynamic question from your CV...")}
              </h2>
            </div>
          </div>

          {/* ════════════ RIGHT PORTION: Candidate Response Console + Progress ════════════ */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Candidate Response Studio Card */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#242932] bg-[#12151A] shadow-xl space-y-5">
              
              {/* Response Mode Selector Header */}
              <div className="flex items-center justify-between border-b border-[#242932] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                    <Mic className="h-4 w-4 text-[#39D9FF]" /> Candidate Response
                  </h3>
                  <p className="text-[11px] text-[#A7AFBC]">Answer clearly via voice or text</p>
                </div>

                <div className="flex items-center bg-[#0D0F12] p-1 rounded-xl border border-[#242932]">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !showManualInput 
                        ? "bg-[#39D9FF] text-[#08090B] shadow" 
                        : "text-[#A7AFBC] hover:text-[#F5F7FA]"
                    }`}
                  >
                    Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      showManualInput 
                        ? "bg-[#39D9FF] text-[#08090B] shadow" 
                        : "text-[#A7AFBC] hover:text-[#F5F7FA]"
                    }`}
                  >
                    Text / Code
                  </button>
                </div>
              </div>

              {/* ── Voice Recording Interface ── */}
              {!showManualInput ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                  
                  {/* Big Interactive Recording Button */}
                  <div className="relative">
                    {isRecording && (
                      <>
                        <span className="absolute -inset-4 rounded-full bg-[#FF5C67]/20 animate-ping" />
                        <span className="absolute -inset-8 rounded-full bg-[#FF5C67]/10 animate-pulse" />
                      </>
                    )}
                    
                    <button
                      type="button"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={interviewState === "THINKING" || interviewState === "SPEAKING"}
                      className={`relative h-24 w-24 sm:h-28 sm:w-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
                        isRecording 
                          ? "bg-[#FF5C67] hover:bg-[#FF4552] text-white shadow-[0_0_40px_rgba(255,92,103,0.5)] scale-105" 
                          : "bg-[#39D9FF] hover:bg-[#20C5EE] text-[#08090B] shadow-[0_0_40px_rgba(57,217,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-8 w-8 fill-current" />
                          <span className="text-[10px] font-mono font-bold mt-1 uppercase">Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-9 w-9" />
                          <span className="text-[10px] font-mono font-bold mt-1 uppercase">Speak</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recording Status & Live Timer */}
                  <div className="text-center space-y-1.5">
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-2 text-sm font-mono font-bold text-[#FF5C67]">
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Recording: {formatTime(recordingSeconds)}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#F5F7FA] block">
                        {interviewState === "SPEAKING" 
                          ? "Listening to interviewer question..." 
                          : interviewState === "THINKING" 
                            ? "AI analyzing and scoring your response..." 
                            : "Click the microphone button when you're ready to answer"}
                      </span>
                    )}
                    <p className="text-[11px] text-[#A7AFBC]">
                      {isRecording ? "Click the red button above when you're finished speaking." : "You can review, re-record, or switch to text anytime."}
                    </p>
                  </div>

                  {/* Live Transcription Box */}
                  {transcript && (
                    <div className="w-full p-4 rounded-2xl bg-[#0D0F12] border border-[#242932] text-xs text-[#CBD5E1] space-y-1.5 shadow-inner">
                      <span className="text-[10px] font-mono uppercase text-[#39D9FF] font-bold flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> Transcribed Voice Input
                      </span>
                      <p className="italic leading-relaxed text-[#F5F7FA]">&ldquo;{transcript}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Manual Text / Code Input Interface ── */
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between text-xs text-[#A7AFBC]">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Code2 className="h-3.5 w-3.5 text-[#39D9FF]" /> Technical Explanation
                    </span>
                    <span className="font-mono text-[11px]">{manualText.length} characters</span>
                  </div>

                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Type your structured explanation, code snippet, or algorithmic approach here..."
                    rows={7}
                    className="w-full p-4 rounded-2xl bg-[#0D0F12] border border-[#242932] text-xs sm:text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF] resize-none leading-relaxed font-sans"
                  />
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowManualInput(false);
                        setManualText("");
                      }}
                      className="text-xs text-[#A7AFBC]"
                    >
                      Back to Voice
                    </Button>
                    <Button
                      variant="ai"
                      size="sm"
                      disabled={!manualText.trim() || interviewState === "THINKING"}
                      onClick={() => submitAnswer(manualText)}
                      className="gap-2 h-9 px-4 font-semibold"
                    >
                      <span>Submit Answer</span>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Interview Progression Roadmap Card */}
            <div className="p-5 rounded-3xl border border-[#242932] bg-[#12151A] shadow-lg space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#242932] pb-2.5">
                <span className="text-xs font-bold text-[#F5F7FA] font-display uppercase tracking-wider">
                  Adaptive Interview Flow
                </span>
                <span className="text-[11px] font-mono text-[#39D9FF]">
                  Stage {currentQuestionNumber} / 5
                </span>
              </div>

              <div className="space-y-2">
                {stagesRoadmap.map((st) => {
                  const isDone = st.num < currentQuestionNumber;
                  const isCurrent = st.num === currentQuestionNumber;

                  return (
                    <div
                      key={st.num}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? "bg-[#39D9FF]/10 border-[#39D9FF]/40 text-[#F5F7FA]"
                          : isDone
                            ? "bg-[#35D07F]/5 border-[#35D07F]/20 text-[#A7AFBC]"
                            : "bg-[#0D0F12] border-[#242932]/60 text-[#68717E]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          isDone 
                            ? "bg-[#35D07F] text-black" 
                            : isCurrent 
                              ? "bg-[#39D9FF] text-black" 
                              : "bg-[#1C2027] text-[#68717E]"
                        }`}>
                          {isDone ? "✓" : st.num}
                        </span>
                        <div>
                          <strong className={`block text-xs ${isCurrent ? "text-[#F5F7FA]" : ""}`}>{st.label}</strong>
                          <span className="text-[10px] text-[#68717E] hidden sm:inline">{st.desc}</span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] font-mono text-[#39D9FF] font-bold uppercase animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
