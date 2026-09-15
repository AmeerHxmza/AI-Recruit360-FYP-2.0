"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SimliClient } from "simli-client";
import {
  createAvatarSessionAction,
  getInterviewSpeechAction,
} from "@/app/actions/interview-avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Volume2,
  VolumeX,
  Video,
  Square,
  PhoneOff,
} from "lucide-react";

type Props = {
  interviewId: string;
  questionId: string;
  paused: boolean;
  recording?: boolean;
};

export function SimliAvatarPlayer({
  interviewId,
  questionId,
  paused,
  recording = false,
}: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const client = useRef<SimliClient | null>(null);
  const mounted = useRef(true);
  const connecting = useRef(false);
  const generation = useRef(0);
  const played = useRef("");
  const cache = useRef(new Map<string, Uint8Array>());
  const [status, setStatus] = useState<"off" | "connecting" | "ready">("off");
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void client.current?.stop();
      client.current = null;
    };
  }, []);

  useEffect(() => {
    generation.current++;
    client.current?.ClearBuffer();
  }, [paused, questionId]);

  const speak = useCallback(async () => {
    const active = client.current;
    if (!active || paused) return;
    const version = ++generation.current;
    active.ClearBuffer();
    setPreparing(true);
    setError("");
    try {
      let pcm = cache.current.get(questionId);
      if (!pcm) {
        const result = await getInterviewSpeechAction(interviewId, questionId);
        if (!result.success) throw new Error(result.error);
        const bytes = Uint8Array.from(atob(result.data.audio), (c) =>
          c.charCodeAt(0),
        );
        // Decode the provider WAV, then resample to Simli's mono 16 kHz PCM16.
        const decoder = new OfflineAudioContext(1, 1, 16000);
        const decoded = await decoder.decodeAudioData(bytes.buffer);
        const render = new OfflineAudioContext(
          1,
          Math.ceil(decoded.duration * 16000),
          16000,
        );
        const source = render.createBufferSource();
        source.buffer = decoded;
        source.connect(render.destination);
        source.start();
        const samples = (await render.startRendering()).getChannelData(0);
        pcm = new Uint8Array(samples.length * 2);
        const view = new DataView(pcm.buffer);
        samples.forEach((sample, i) =>
          view.setInt16(
            i * 2,
            Math.round(Math.max(-1, Math.min(1, sample)) * 32767),
            true,
          ),
        );
        cache.current.set(questionId, pcm);
      }
      if (
        !mounted.current ||
        generation.current !== version ||
        client.current !== active
      )
        return;
      for (let offset = 0; offset < pcm.length; offset += 6000)
        active.sendAudioData(pcm.subarray(offset, offset + 6000));
      await audio.current?.play();
    } catch (e) {
      if (mounted.current && generation.current === version)
        setError(
          e instanceof Error
            ? e.message
            : "Interviewer audio could not play. Try again.",
        );
    } finally {
      if (mounted.current) setPreparing(false);
    }
  }, [interviewId, questionId, paused]);

  useEffect(() => {
    if (status === "ready" && !paused && played.current !== questionId) {
      played.current = questionId;
      void speak();
    }
  }, [status, paused, questionId, speak]);

  async function connect() {
    if (connecting.current) return;
    connecting.current = true;
    setStatus("connecting");
    setError("");
    try {
      await client.current?.stop();
      client.current = null;
      const token = await createAvatarSessionAction(interviewId);
      if (!token.success) throw new Error(token.error);
      if (!mounted.current || !video.current || !audio.current) return;
      const { SimliClient, LogLevel } = await import("simli-client");
      if (!mounted.current) return;
      const next = new SimliClient(
        token.token,
        video.current!,
        audio.current!,
        null,
        LogLevel.ERROR,
        "livekit",
      );
      client.current = next;
      const failed = () => {
        if (!mounted.current || client.current !== next) return;
        generation.current++;
        setStatus("off");
        setSpeaking(false);
        setError(
          "The avatar disconnected. Reconnect, or continue answering below.",
        );
      };
      next.on("error", failed);
      next.on("startup_error", failed);
      next.on("stop", failed);
      next.on("speaking", () => {
        if (mounted.current && client.current === next) setSpeaking(true);
      });
      next.on("silent", () => {
        if (mounted.current && client.current === next) setSpeaking(false);
      });
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          next.start(),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () =>
                reject(
                  new Error("Avatar connection timed out. Please reconnect."),
                ),
              30000,
            );
          }),
        ]);
      } finally {
        if (timeout) clearTimeout(timeout);
      }
      if (!mounted.current || client.current !== next) {
        await next.stop();
        return;
      }
      played.current = "";
      setStatus("ready");
    } catch (e) {
      const current = client.current;
      client.current = null;
      void current?.stop();
      if (mounted.current) {
        setStatus("off");
        setError(
          e instanceof Error
            ? e.message
            : "Avatar could not connect. Please retry.",
        );
      }
    } finally {
      connecting.current = false;
    }
  }

  const talking = status === "ready" && speaking && !paused;
  const activity =
    status === "connecting"
      ? "Connecting"
      : status !== "ready"
        ? "Not connected"
        : recording
          ? "Recording your answer"
          : paused
            ? "Updating interview"
            : preparing
              ? "Preparing audio"
              : talking
                ? "Speaking"
                : "Ready";

  return (
    <div className="interviewer-avatar overflow-hidden rounded-xl border border-border">
      <div className="interviewer-call-header">
        <span className="font-semibold">AI interviewer</span>
        <span className="interviewer-connection" role="status">
          <span
            className={
              status === "ready" ? "connection-dot connected" : "connection-dot"
            }
          />
          {status === "ready"
            ? "Connected"
            : status === "connecting"
              ? "Connecting"
              : "Offline"}
        </span>
      </div>
      <div
        className={`interviewer-video relative bg-[#172b4d] ${talking ? "is-speaking" : ""}`}
      >
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          aria-label="AI interviewer avatar"
          className="block h-full w-full object-contain"
        />
        <audio ref={audio} autoPlay muted={muted} />
        {status === "ready" && (
          <div className="interviewer-nameplate">
            <span
              className="interviewer-wave"
              data-speaking={talking}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <i />
            </span>
            <span role="status">{activity}</span>
            {muted && (
              <VolumeX aria-label="Interviewer muted" className="size-4" />
            )}
          </div>
        )}
        {status !== "ready" && (
          <div className="absolute inset-0 grid place-items-center bg-[#172b4d] text-white">
            <div className="text-center">
              <Video className="mx-auto mb-3 size-8" />
              <p>
                {status === "connecting"
                  ? "Connecting your interviewer…"
                  : "Meet your AI interviewer"}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="interviewer-controls space-y-3 bg-surface p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            AI-generated video &amp; voice
          </p>
          {status !== "ready" ? (
            <Button
              variant="secondary"
              disabled={status === "connecting" || paused}
              onClick={() => void connect()}
            >
              {status === "connecting" && <Loader2 className="animate-spin" />}{" "}
              Connect interviewer
            </Button>
          ) : (
            <div className="flex flex-wrap gap-1">
              <Button
                variant="ghost"
                disabled={paused || preparing}
                onClick={() => void speak()}
              >
                {preparing ? <Loader2 className="animate-spin" /> : <Volume2 />}{" "}
                Repeat question
              </Button>
              <Button
                variant="ghost"
                aria-label="Stop interviewer audio"
                onClick={() => {
                  generation.current++;
                  client.current?.ClearBuffer();
                  setSpeaking(false);
                }}
              >
                <Square />
              </Button>
              <Button
                variant="ghost"
                aria-label={muted ? "Unmute interviewer" : "Mute interviewer"}
                aria-pressed={muted}
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX /> : <Volume2 />}
              </Button>
              <Button
                variant="ghost"
                aria-label="Disconnect avatar"
                className="text-danger"
                onClick={() => {
                  generation.current++;
                  const current = client.current;
                  client.current = null;
                  setStatus("off");
                  setSpeaking(false);
                  setError("");
                  void current?.stop();
                }}
              >
                <PhoneOff />
              </Button>
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
