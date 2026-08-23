"use client";

import * as React from "react";

export function useVoiceInterview() {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<unknown | null>(null);

  // Initialize Web Speech Recognition
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const globalWin = window as unknown as Record<string, unknown>;
      const SpeechRecognition =
        globalWin.SpeechRecognition || globalWin.webkitSpeechRecognition;

      if (SpeechRecognition && typeof SpeechRecognition === "function") {
        const SpeechRec = SpeechRecognition as unknown as new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
          onerror: (e: { error: string }) => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        };
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Pre-load Web Speech Synthesis Voices asynchronously
      if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  const startListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try {
        setTranscript("");
        (recognitionRef.current as { start: () => void }).start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
      }
    } else {
      setError("Speech recognition is not supported in this browser. Please type your response.");
    }
  }, []);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, [isListening]);

  // Speak AI question using Female Voice TTS
  const speakText = React.useCallback((text: string) => {
    if (!text) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.name.includes("Zira") ||
          v.name.includes("Female") ||
          v.name.includes("Google US English") ||
          (v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
          v.lang.startsWith("en")
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const cancelSpeech = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    cancelSpeech,
    error,
  };
}
