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
  ArrowRight,
  ShieldCheck,
  Bot
} from "lucide-react";
import { 
  initializeInterviewAction, 
  getNextInterviewQuestionAction, 
  submitInterviewResponseAction,
  transcribeAudioAction,
  finalizeEvaluationAction,
} from "@/app/actions/interview";

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
  
  const [manualText, setManualText] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  
  // Refs
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioContextRef = React.useRef<HTMLAudioElement | null>(null);

  const handleCompletion = React.useCallback(async () => {
    setInterviewState("COMPLETED");
    if (applicationId) {
      finalizeEvaluationAction(applicationId).catch(console.error);
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
      
      if (!res.ok) throw new Error("TTS failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioContextRef.current = audio;
      
      setQuestionText(text);
      setInterviewState("SPEAKING");
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
        setInterviewState("LISTENING");
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setInterviewState("LISTENING");
      };

      await audio.play();
    } catch (err) {
      console.warn("TTS fallback to text:", err);
      setQuestionText(text);
      setIsPlayingAudio(false);
      setInterviewState("LISTENING");
    }
  }, [applicationId]);

  const fetchNextQuestion = React.useCallback(async (targetInterviewId: string) => {
    if (!targetInterviewId) return;
    setInterviewState("THINKING");
    setErrorMsg(null);
    setManualText("");

    try {
      const qRes = await getNextInterviewQuestionAction(targetInterviewId);
      if (!qRes.success || !qRes.data) {
        throw new Error(qRes.error || "Failed to fetch question.");
      }
      
      const qData = qRes.data as any;

      if (qData.completed || !qData.current_question) {
        await handleCompletion();
        return;
      }

      const q = qData.current_question;
      setCurrentQuestionNumber(q.question_number || ((qData.questions_answered || 0) + 1));
      setTotalQuestions(qData.total_questions || 5);
      setQuestionId(q.id || `q-${q.question_number}`);
      
      playTTSAudio(q.question_text);

    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
      setInterviewState("ERROR");
    }
  }, [handleCompletion, playTTSAudio]);

  const handleEnterRoom = async () => {
    setHasEnteredRoom(true);
    setInterviewState("CONNECTING");
    setErrorMsg(null);

    try {
      const initRes = await initializeInterviewAction(applicationId);
      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.error || "Failed to initialize interview.");
      }

      const data = initRes.data as any;
      const resolvedId = (data.interview_id || data.id) as string;
      if (!resolvedId) throw new Error("Missing interview identifier.");

      setInterviewId(resolvedId);
      setTotalQuestions(data.total_questions || 5);

      await fetchNextQuestion(resolvedId);

    } catch (err: any) {
      setErrorMsg(err.message || "Could not start interview.");
      setInterviewState("ERROR");
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Microphone not supported. Please type your response.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      setErrorMsg("Microphone access denied. Please type your answer.");
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
      if (!sttRes.success || !sttRes.data?.transcript) {
        setErrorMsg("Could not transcribe audio clearly. Please type your answer.");
        setInterviewState("LISTENING");
        return;
      }
      await submitAnswer(sttRes.data.transcript);
    } catch (err: any) {
      setErrorMsg(err.message || "Error processing voice.");
      setInterviewState("LISTENING");
    }
  };

  const submitAnswer = async (responseText: string) => {
    if (!responseText.trim()) {
      setErrorMsg("Response cannot be empty.");
      return;
    }

    if (!interviewId) {
      setErrorMsg("Missing interview session ID. Please refresh.");
      return;
    }

    setInterviewState("THINKING");
    setErrorMsg(null);

    try {
      await submitInterviewResponseAction(interviewId, questionId || "current-q", responseText);
      await fetchNextQuestion(interviewId);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record response.");
      await fetchNextQuestion(interviewId);
    }
  };

  if (!hasEnteredRoom) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-lg w-full p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <BrandLogo variant="full" size="md" href="#" />
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#38BDF8] border border-[#2563EB]/20">
              AI Candidate Session
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Adaptive Technical Interview</h1>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Welcome to your automated AI interview session. Questions adapt in real time to evaluate your technical experience and problem-solving skills.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-4 rounded-xl bg-[#0F1523] border border-[#1E293B] flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-[#F8FAFC]">Voice & Text Modalities</strong>
                <span className="text-[#94A3B8] text-xs">Speak naturally with your microphone or type your responses. Responses are analyzed securely and objectively.</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="w-full gap-2 font-semibold h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/20" onClick={handleEnterRoom}>
            <span>Enter Interview Room</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (interviewState === "COMPLETED") {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center justify-center shadow-lg shadow-[#10B981]/10">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Interview Completed</h1>
            <p className="text-[#94A3B8] text-sm">
              Thank you. Your responses have been securely submitted and are being synthesized into the hiring evaluation matrix.
            </p>
          </div>
          <Button className="w-full gap-2 h-11 bg-[#182236] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B]" onClick={() => router.push("/")}>
            <span>Return to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col font-sans">
      <header className="border-b border-[#1E293B] bg-[#0F1523] py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="sm" href="#" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131B2A] border border-[#1E293B] text-xs font-medium">
              {interviewState === "CONNECTING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#94A3B8]" /> <span className="text-[#94A3B8]">Connecting...</span></>}
              {interviewState === "SPEAKING" && <><Volume2 className="h-3.5 w-3.5 text-[#38BDF8]" /> <span className="text-[#38BDF8]">AI Speaking</span></>}
              {interviewState === "LISTENING" && <><Mic className="h-3.5 w-3.5 text-[#10B981]" /> <span className="text-[#10B981]">{isRecording ? "Recording Audio..." : "Microphone Ready"}</span></>}
              {interviewState === "THINKING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#38BDF8]" /> <span className="text-[#38BDF8]">Evaluating Response...</span></>}
              {interviewState === "ERROR" && <><AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" /> <span className="text-[#EF4444]">Attention Required</span></>}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#2563EB]/10 text-[#38BDF8] border border-[#2563EB]/20 text-xs font-semibold tabular-nums font-mono">
              Question {currentQuestionNumber} / {totalQuestions}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* AI Question Section */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2 text-[#38BDF8] font-semibold text-xs tracking-wider uppercase">
              <Bot className="h-4 w-4" /> AI Interview Intelligence
            </div>
          </div>
          <h2 className="text-xl font-medium leading-relaxed text-[#F8FAFC]">
            {questionText || (interviewState === "CONNECTING" ? "Initializing AI Session..." : "Formulating next adaptive question...")}
          </h2>
        </div>

        {/* Candidate Response Section */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold text-sm border-b border-[#1E293B] pb-3">
            <Mic className="h-4 w-4 text-[#94A3B8]" /> Candidate Response
          </div>
          
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isRecording || interviewState === "THINKING" || interviewState === "CONNECTING"}
            placeholder="Type your response here or click 'Start Voice Recording' to speak..."
            className="w-full min-h-[140px] p-4 rounded-xl bg-[#0F1523] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder-[#64748B] resize-y focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-2">
            {isRecording ? (
              <Button onClick={handleStopRecording} variant="danger" className="gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white">
                <Square className="h-4 w-4 fill-current" /> Finish Recording
              </Button>
            ) : (
              <Button 
                onClick={handleStartRecording} 
                variant="outline" 
                className="gap-2 border-[#1E293B] bg-[#0F1523] hover:bg-[#182236] text-[#38BDF8]"
                disabled={interviewState === "THINKING" || interviewState === "CONNECTING"}
              >
                <Mic className="h-4 w-4" /> Start Voice Recording
              </Button>
            )}

            <Button 
              onClick={() => submitAnswer(manualText)}
              disabled={!manualText.trim() || isRecording || interviewState === "THINKING"}
              className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-50 shadow-md shadow-[#2563EB]/20"
            >
              Submit Answer <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
