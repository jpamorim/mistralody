"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  } = useWorkspaceStore();
  const [text, setText] = useState("");

  const placeholder = useMemo(() => {
    if (currentStep === "transcribe") return "Transcribing...";
    if (currentStep === "agent-edit") return "Applying changes...";
    if (currentStep === "lyrics") return "Generating lyrics...";
    if (currentStep === "singing") return "Creating vocal...";
    return "Tell the agent how to change the music";
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
    if (!instruction.trim()) return;

    addMessage({ role: "user", content: instruction });
    setCurrentStep("agent-edit");
    setError(null);

    try {
      const response = await fetch("/api/agent-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, code }),
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
    await submitInstruction(instruction);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chat + Voice</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${inputMode === "text" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : ""}`}
            onClick={() => setInputMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${inputMode === "voice" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : ""}`}
            onClick={() => setInputMode("voice")}
          >
            Voice
          </button>
        </div>
      </div>

      <div className="mb-3 flex-1 space-y-2 overflow-auto rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
        {chatMessages.length === 0 ? (
          <p className="text-zinc-500">No messages yet.</p>
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
        <VoiceInput
          onTranscript={(transcript) => {
            setText(transcript);
            void submitInstruction(transcript);
          }}
          onError={(message) => setError(message)}
        />
      ) : null}

      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          className="min-h-24 w-full rounded-md border bg-zinc-50 p-3 text-sm dark:bg-zinc-900"
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">{requestCostHint}</span>
            <span className="text-xs text-red-500">{lastError}</span>
          </div>
          <button
            type="submit"
            disabled={currentStep !== "idle"}
            className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

