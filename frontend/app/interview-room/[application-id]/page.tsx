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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-lg w-full p-8 rounded-2xl border bg-card space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <BrandLogo variant="full" size="md" href="#" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Technical Interview</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience an intelligent, interactive technical interview. Your questions adapt in real time to your responses.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-4 rounded-xl bg-muted border flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <strong className="block font-semibold">Voice & Text Options</strong>
                <span className="text-muted-foreground">Speak naturally into your microphone or seamlessly type your answers.</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="w-full gap-2 font-semibold h-12" onClick={handleEnterRoom}>
            <span>Start Interview</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (interviewState === "COMPLETED") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border bg-card text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Interview Completed</h1>
            <p className="text-muted-foreground text-sm">
              Thank you. Your responses have been securely submitted for evaluation.
            </p>
          </div>
          <Button className="w-full gap-2 h-11" onClick={() => router.push("/")}>
            <span>Return Home</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b bg-card py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="sm" href="#" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border text-xs font-medium">
              {interviewState === "CONNECTING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> Connecting...</>}
              {interviewState === "SPEAKING" && <><Volume2 className="h-3.5 w-3.5 text-primary" /> AI Speaking</>}
              {interviewState === "LISTENING" && <><Mic className="h-3.5 w-3.5 text-green-500" /> {isRecording ? "Recording..." : "Ready"}</>}
              {interviewState === "THINKING" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Evaluating...</>}
              {interviewState === "ERROR" && <><AlertCircle className="h-3.5 w-3.5 text-red-500" /> Error</>}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              Question {currentQuestionNumber} / {totalQuestions}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* AI Question Section */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Bot className="h-4 w-4" /> AI Interviewer
            </div>
          </div>
          <h2 className="text-lg font-medium leading-relaxed">
            {questionText || (interviewState === "CONNECTING" ? "Initializing..." : "Generating question...")}
          </h2>
        </div>

        {/* Candidate Response Section */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b pb-3">
            <Mic className="h-4 w-4 text-muted-foreground" /> Your Response
          </div>
          
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isRecording || interviewState === "THINKING" || interviewState === "CONNECTING"}
            placeholder="Type your answer here or use the microphone to speak..."
            className="w-full min-h-[120px] p-4 rounded-xl bg-muted border text-sm resize-y focus:outline-none focus:border-primary disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-2">
            {isRecording ? (
              <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
                <Square className="h-4 w-4 fill-current" /> Stop Recording
              </Button>
            ) : (
              <Button 
                onClick={handleStartRecording} 
                variant="outline" 
                className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                disabled={interviewState === "THINKING" || interviewState === "CONNECTING"}
              >
                <Mic className="h-4 w-4" /> Start Voice Recording
              </Button>
            )}

            <Button 
              onClick={() => submitAnswer(manualText)}
              disabled={!manualText.trim() || isRecording || interviewState === "THINKING"}
              className="gap-2"
            >
              Submit Answer <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
