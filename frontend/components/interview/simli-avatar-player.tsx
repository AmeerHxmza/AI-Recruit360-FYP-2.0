"use client";

import * as React from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";

interface SimliAvatarPlayerProps {
  isSpeaking: boolean;
  currentText?: string;
  onAudioEnded?: () => void;
  apiKey?: string;
  faceId?: string;
}

export function SimliAvatarPlayer({
  isSpeaking,
  currentText,
  apiKey = process.env.NEXT_PUBLIC_SIMLI_API_KEY || "",
  faceId = process.env.NEXT_PUBLIC_SIMLI_FACE_ID || "",
}: SimliAvatarPlayerProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [simliConnected] = React.useState<boolean>(Boolean(apiKey && faceId));
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative w-full aspect-video max-h-[380px] rounded-2xl border border-[#242932] bg-[#0D0F12] overflow-hidden shadow-[0_0_30px_rgba(57,217,255,0.12)] flex flex-col justify-between p-4 selection:bg-transparent">
      {/* Top Status Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151A]/80 border border-[#242932] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeaking ? "bg-[#35D07F]" : "bg-[#39D9FF]"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSpeaking ? "bg-[#35D07F]" : "bg-[#39D9FF]"}`} />
          </span>
          <span className="text-[11px] font-mono font-medium text-[#F5F7FA] tracking-wide">
            {simliConnected ? "Simli Live Avatar" : "AI Recruiter Avatar"}
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-[#12151A]/80 border border-[#242932] text-[#A7AFBC] hover:text-[#F5F7FA] transition-colors"
          title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-[#FF5C67]" /> : <Volume2 className="h-4 w-4 text-[#39D9FF]" />}
        </button>
      </div>

      {/* Main Avatar Center Renderer */}
      <div className="relative flex-1 flex items-center justify-center py-4">
        {simliConnected ? (
          /* Live Simli AI WebRTC Video Stream */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover rounded-xl border border-[#242932]"
            />
          </div>
        ) : (
          /* Animated AI Female Recruiter Video Player with Lip-Sync Waveforms */
          <div className="relative flex flex-col items-center justify-center space-y-4">
            {/* Glowing Avatar Portrait */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-[#39D9FF] via-[#63E3FF] to-[#00E5A3] opacity-40 blur-md ${isSpeaking ? "animate-pulse" : ""}`} />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#1E232D] to-[#0D0F12] border-2 border-[#39D9FF]/40 p-1 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full rounded-full bg-[#12151A] overflow-hidden flex items-center justify-center relative">
                  {/* Styled AI Female Avatar Vector Graphic */}
                  <svg className="w-20 h-20 text-[#39D9FF] opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>

                  {/* Lip-Sync Animated Waves when speaking */}
                  {isSpeaking && (
                    <div className="absolute bottom-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#08090B]/80 backdrop-blur-sm border border-[#39D9FF]/30">
                      <span className="w-0.5 h-3 bg-[#39D9FF] animate-pulse" />
                      <span className="w-0.5 h-4 bg-[#35D07F] animate-bounce" />
                      <span className="w-0.5 h-2 bg-[#F5B942] animate-pulse" />
                      <span className="w-0.5 h-4 bg-[#39D9FF] animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Speaking State Label */}
            <div className="text-center space-y-1">
              <h4 className="text-xs font-mono font-semibold text-[#F5F7FA] flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#39D9FF]" />
                Female Technical AI Interviewer
              </h4>
              <p className="text-[11px] text-[#A7AFBC] font-mono">
                {isSpeaking ? "Speaking Question Aloud..." : "Listening to Candidate..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Caption Overlay */}
      {currentText && (
        <div className="relative z-10 p-3 rounded-xl bg-[#08090B]/80 backdrop-blur-md border border-[#242932] text-xs text-[#F5F7FA] font-sans leading-relaxed text-center shadow-lg">
          <p className="line-clamp-2 italic text-[#63E3FF]">
            &ldquo;{currentText}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
