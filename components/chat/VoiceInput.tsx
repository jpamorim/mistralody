"use client";

import { useRef, useState } from "react";

const DEBUG = true;
const log = (...args: unknown[]) => DEBUG && console.log("[VoiceInput]", ...args);
import {
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  MIN_RECORDING_BYTES,
  MIN_RECORDING_SECONDS,
  getRecordingLimitMessage,
} from "@/lib/audio/recording";
import { incrementUsage, loadUsage } from "@/lib/usage/usageTracker";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
};

export function VoiceInput({ onTranscript, onError }: VoiceInputProps) {
  const { setCurrentStep } = useWorkspaceStore();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_RECORDING_SECONDS);
  const [isSupported] = useState(
    typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined",
  );
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    setCountdown(MAX_RECORDING_SECONDS);
    timerRef.current = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          stopRecording();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (!isSupported) {
      log("MediaRecorder not supported");
      onError("Voice recording is not supported in this browser.");
      return;
    }
    log("Starting recording...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      log("Got microphone stream");
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          log("Chunk received:", event.data.size, "bytes, total chunks:", chunksRef.current.length);
        }
      };

      recorder.onstop = async () => {
        log("Recording stopped");
        stopTimer();
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("webm") ? "webm" : "mp4";
        const fileName = `voice-command.${ext}`;

        log("Blob:", {
          size: blob.size,
          type: mimeType,
          chunks: chunksRef.current.length,
          fileName,
        });

        if (blob.size === 0) {
          log("ERROR: Empty blob, no audio captured");
          onError("No audio captured. Try speaking closer to the microphone.");
          return;
        }
        if (blob.size < MIN_RECORDING_BYTES) {
          log("ERROR: Blob too small, possible low volume or very short recording");
          onError(
            "Recording too quiet or short. Speak for at least 2 seconds, closer to the mic.",
          );
          return;
        }
        if (blob.size > MAX_RECORDING_BYTES) {
          onError(getRecordingLimitMessage());
          return;
        }

        const formData = new FormData();
        formData.append("audio", blob, fileName);

        try {
          setCurrentStep("transcribe");
          log("POST /api/transcribe, blob size:", blob.size);
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          log("Response:", response.status, response.statusText);

          const data = (await response.json()) as {
            text?: string;
            error?: string;
          };

          log("Response data:", data);

          if (!response.ok) {
            log("ERROR: API returned", response.status, data);
            throw new Error(
              data.error ?? "Could not transcribe audio. Please try again.",
            );
          }

          const transcript = (data.text ?? "").trim();
          log("Success, transcript:", transcript || "(empty)");
          if (!transcript) {
            log("Empty transcript - treating as no speech detected");
            onError(
              "No speech detected. Try speaking longer and clearer, and check your microphone.",
            );
            return;
          }
          const usage = loadUsage();
          incrementUsage(usage, "voxtral", 1);
          onTranscript(transcript);
        } catch (error) {
          log("Caught error:", error);
          onError(
            error instanceof Error
              ? error.message
              : "Could not transcribe audio. Please try again.",
          );
        } finally {
          setCurrentStep("idle");
        }
      };

      recordingStartRef.current = Date.now();
      recorder.start(250);
      setRecording(true);
      startTimer();
    } catch (err) {
      log("Start recording failed:", err);
      onError("Microphone permission is required to record voice commands.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    const elapsed = (Date.now() - recordingStartRef.current) / 1000;
    if (elapsed < MIN_RECORDING_SECONDS) {
      onError(
        `Record at least ${MIN_RECORDING_SECONDS} seconds. You recorded ${elapsed.toFixed(1)}s.`,
      );
      return;
    }
    if (recorderRef.current.state !== "inactive")
      recorderRef.current.stop();
    setRecording(false);
    stopTimer();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!recording ? (
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface-hover"
          onClick={startRecording}
        >
          Hold to speak
        </button>
      ) : (
        <button
          type="button"
          className="rounded-md border border-error px-3 py-1 text-sm text-error hover:bg-error-hover disabled:opacity-50"
          onClick={stopRecording}
          disabled={countdown > MAX_RECORDING_SECONDS - MIN_RECORDING_SECONDS}
        >
          Stop ({countdown}s)
        </button>
      )}
      {recording ? (
        <span className="animate-pulse text-xs font-medium text-error">
          Recording...
        </span>
      ) : null}
      {recording && countdown <= 10 ? (
        <span className="text-xs text-warning">10s warning: wrapping soon</span>
      ) : null}
      <span className="text-xs text-muted">{getRecordingLimitMessage()}</span>
      {!isSupported ? (
        <span className="text-xs text-error">
          Browser does not support MediaRecorder.
        </span>
      ) : (
        <span className="text-xs text-muted">
          Hold record, speak for 2+ seconds, then stop.
        </span>
      )}
    </div>
  );
}

