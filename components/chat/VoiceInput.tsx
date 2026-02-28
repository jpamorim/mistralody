"use client";

import { useRef, useState } from "react";
import {
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
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
      onError("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopTimer();
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > MAX_RECORDING_BYTES) {
          onError(getRecordingLimitMessage());
          return;
        }

        const formData = new FormData();
        formData.append("audio", blob, "voice-command.webm");

        try {
          setCurrentStep("transcribe");
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Could not transcribe audio. Please try again.");
          }

          const data = (await response.json()) as { text?: string };
          const usage = loadUsage();
          incrementUsage(usage, "voxtral", 1);
          onTranscript(data.text ?? "");
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : "Could not transcribe audio. Please try again.",
          );
        } finally {
          setCurrentStep("idle");
        }
      };

      recorder.start();
      setRecording(true);
      startTimer();
    } catch {
      onError("Microphone permission is required to record voice commands.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    if (recorderRef.current.state !== "inactive") recorderRef.current.stop();
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
          className="rounded-md border border-error px-3 py-1 text-sm text-error hover:bg-error-hover"
          onClick={stopRecording}
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
          Press record, speak, then stop to transcribe.
        </span>
      )}
    </div>
  );
}

