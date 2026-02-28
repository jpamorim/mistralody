"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { VoiceInput } from "@/components/chat/VoiceInput";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { incrementUsage, loadUsage } from "@/lib/usage/usageTracker";

type AgentResponse = {
  message?: string;
  code?: string;
  error?: string;
};

export function ChatPane() {
  const {
    chatMessages,
    addMessage,
    code,
    setCode,
    currentStep,
    setCurrentStep,
    lastError,
    setError,
    inputMode,
    setInputMode,
    suggestions,
    setSuggestions,
    lastSuccess,
    setSuccess,
    setLastInstruction,
    lastInstruction,
    previousCodeSnapshot,
    setPreviousCodeSnapshot,
    restorePreviousCodeSnapshot,
    autoSendTranscript,
    setAutoSendTranscript,
    setLastAgentUpdate,
  } = useWorkspaceStore();
  const [text, setText] = useState("");
  const [transcriptDraft, setTranscriptDraft] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const placeholder = useMemo(() => {
    if (currentStep === "transcribe") return "Transcribing voice command...";
    if (currentStep === "agent-edit") return "Applying code changes...";
    if (currentStep === "lyrics") return "Generating lyrics...";
    if (currentStep === "singing") return "Creating vocal sample...";
    return "Tell the agent how to change the music";
  }, [currentStep]);

  const stepLabel = useMemo(() => {
    if (currentStep === "idle") return "Idle";
    if (currentStep === "transcribe") return "Transcribing voice";
    if (currentStep === "agent-edit") return "Applying code edit";
    if (currentStep === "lyrics") return "Generating lyrics";
    return "Synthesizing singing voice";
  }, [currentStep]);

  const requestCostHint = useMemo(() => {
    const lower = text.toLowerCase();
    if (lower.includes("voice sample") || lower.includes("vocal")) {
      return "This request may use ~2 Mistral calls + 1 ElevenLabs synthesis.";
    }
    return "This request uses ~1 Mistral call.";
  }, [text]);

  useEffect(() => {
    if (suggestions.length > 0) {
      setText(suggestions[0]);
      setSuggestions([]);
    }
  }, [setSuggestions, suggestions]);

  const submitInstruction = async (instruction: string) => {
    const normalized = instruction.trim();
    if (!normalized) return;
    if (currentStep !== "idle") return;

    addMessage({ role: "user", content: normalized });
    setLastInstruction(normalized);
    setPreviousCodeSnapshot(code);
    setCurrentStep("agent-edit");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/agent-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: normalized, code }),
      });

      const data = (await response.json()) as AgentResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Agent could not process the command.");
      }

      if (data.code) setCode(data.code);
      addMessage({
        role: "assistant",
        content: data.message ?? "Updated the pattern.",
      });
      setLastAgentUpdate(data.message ?? "Applied requested change");
      setSuccess("Code updated successfully.");

      const usage = loadUsage();
      incrementUsage(usage, "mistral", 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not process your instruction.";
      setError(message);
      addMessage({ role: "system", content: message });
    } finally {
      setCurrentStep("idle");
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const instruction = text;
    setText("");
    setTranscriptDraft(null);
    await submitInstruction(instruction);
  };

  const starterCommands = [
    "increase tempo by 10%",
    "add light reverb",
    "transpose melody up 2 semitones",
  ];

  const retryLastAction = async () => {
    if (currentStep !== "idle") return;
    if (lastInstruction) {
      await submitInstruction(lastInstruction);
      return;
    }
    if (text.trim()) {
      await submitInstruction(text);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background p-3">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h2 className="text-base font-semibold">Chat + Voice</h2>
        <div className="flex gap-1">
          <button
            type="button"
            className={`rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover ${inputMode === "text" ? "bg-foreground text-background" : ""}`}
            onClick={() => setInputMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={`rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover ${inputMode === "voice" ? "bg-foreground text-background" : ""}`}
            onClick={() => setInputMode("voice")}
          >
            Voice
          </button>
        </div>
      </div>

      {(lastError || lastSuccess || currentStep !== "idle") ? (
        <div className="mb-2 shrink-0 rounded border border-border bg-surface px-2 py-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{stepLabel}</span>
            {currentStep !== "idle" ? (
              <span className="animate-pulse text-muted">In progress</span>
            ) : null}
          </div>
          {lastSuccess ? <div className="mt-0.5 text-success">{lastSuccess}</div> : null}
          {lastError ? <div className="mt-0.5 text-error">{lastError}</div> : null}
          {lastError ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                className="rounded border border-border px-2 py-0.5 hover:bg-surface-hover"
                onClick={() => void retryLastAction()}
              >
                Retry
              </button>
              {previousCodeSnapshot ? (
                <button
                  type="button"
                  className="rounded border border-border px-2 py-0.5 hover:bg-surface-hover"
                  onClick={restorePreviousCodeSnapshot}
                >
                  Restore
                </button>
              ) : null}
              <button
                type="button"
                className="rounded border border-border px-2 py-0.5 hover:bg-surface-hover"
                onClick={() => setInputMode("text")}
              >
                Switch to text
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-2 overflow-auto rounded bg-surface p-2 text-sm">
        {chatMessages.length === 0 ? (
          <div className="space-y-2 text-muted">
            <p>No messages yet. Try one of these starter commands:</p>
            <div className="flex flex-wrap gap-2">
              {starterCommands.map((command) => (
                <button
                  key={command}
                  type="button"
                  onClick={() => setText(command)}
                  className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover"
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div key={message.id}>
              <span className="font-semibold capitalize">{message.role}: </span>
              {message.content}
            </div>
          ))
        )}
      </div>

      {inputMode === "voice" ? (
        <div className="shrink-0 space-y-1.5">
          <VoiceInput
            onTranscript={(transcript) => {
              setText(transcript);
              if (autoSendTranscript) {
                void submitInstruction(transcript);
              } else {
                setTranscriptDraft(transcript);
                setSuccess("Transcription received. Review and send when ready.");
              }
            }}
            onError={(message) => setError(message)}
          />
          <label className="flex items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoSendTranscript}
              onChange={(event) => setAutoSendTranscript(event.target.checked)}
            />
            Auto-send after transcription
          </label>
          {transcriptDraft ? (
            <div className="rounded border border-success bg-surface p-1.5 text-xs text-success">
              Transcript ready — press Send to apply.
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="shrink-0 space-y-1.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            textareaRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          className="min-h-[4.5rem] w-full resize-none rounded border border-border bg-surface p-2 text-sm"
          rows={3}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted">{requestCostHint}</span>
          <button
            type="submit"
            disabled={currentStep !== "idle"}
            className="rounded border border-border px-3 py-1 text-sm bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

