import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InputMode = "text" | "voice";
export type AsyncStep =
  | "transcribe"
  | "agent-edit"
  | "lyrics"
  | "singing"
  | "idle";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
};

export type WorkspaceState = {
  code: string;
  isPlaying: boolean;
  cps: number;
  inputMode: InputMode;
  suggestions: string[];
  recentSuggestionIds: string[];
  chatMessages: ChatMessage[];
  currentStep: AsyncStep;
  lastError: string | null;
  lastSuccess: string | null;
  lastAgentUpdate: string | null;
  lastInstruction: string | null;
  previousCodeSnapshot: string | null;
  autoSendTranscript: boolean;
  setCode: (code: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCps: (cps: number) => void;
  setInputMode: (inputMode: InputMode) => void;
  setSuggestions: (suggestions: string[]) => void;
  pushRecentSuggestion: (id: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  setCurrentStep: (step: AsyncStep) => void;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
  setLastInstruction: (instruction: string | null) => void;
  setPreviousCodeSnapshot: (code: string | null) => void;
  setLastAgentUpdate: (summary: string | null) => void;
  setAutoSendTranscript: (enabled: boolean) => void;
  restorePreviousCodeSnapshot: () => void;
  resetCode: () => void;
  clearMessages: () => void;
};

export const DEFAULT_CODE = [
  "setcps(1)",
  "stack(",
  "  s(\"bd sd hh*2\").gain(0.9),",
  "  note(\"c3 e3 g3\").s(\"sawtooth\").room(0.2)",
  ").play()",
].join("\n");

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      code: DEFAULT_CODE,
      isPlaying: false,
      cps: 1,
      inputMode: "text",
      suggestions: [],
      recentSuggestionIds: [],
      chatMessages: [],
      currentStep: "idle",
      lastError: null,
      lastSuccess: null,
      lastAgentUpdate: null,
      lastInstruction: null,
      previousCodeSnapshot: null,
      autoSendTranscript: true,
      setCode: (code) => set({ code }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCps: (cps) => set({ cps }),
      setInputMode: (inputMode) => set({ inputMode }),
      setSuggestions: (suggestions) => set({ suggestions }),
      pushRecentSuggestion: (id) =>
        set((state) => ({
          recentSuggestionIds: [
            id,
            ...state.recentSuggestionIds.filter((current) => current !== id),
          ].slice(0, 6),
        })),
      addMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              ...message,
            },
          ],
        })),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setError: (lastError) => set({ lastError }),
      setSuccess: (lastSuccess) => set({ lastSuccess }),
      setLastInstruction: (lastInstruction) => set({ lastInstruction }),
      setPreviousCodeSnapshot: (previousCodeSnapshot) =>
        set({ previousCodeSnapshot }),
      setLastAgentUpdate: (lastAgentUpdate) => set({ lastAgentUpdate }),
      setAutoSendTranscript: (autoSendTranscript) => set({ autoSendTranscript }),
      restorePreviousCodeSnapshot: () =>
        set((state) =>
          state.previousCodeSnapshot
            ? { code: state.previousCodeSnapshot, previousCodeSnapshot: null }
            : state,
        ),
      resetCode: () => set({ code: DEFAULT_CODE }),
      clearMessages: () => set({ chatMessages: [] }),
    }),
    {
      name: "mistralody-workspace-state",
      partialize: (state) => ({
        code: state.code,
        inputMode: state.inputMode,
        cps: state.cps,
        isPlaying: state.isPlaying,
        autoSendTranscript: state.autoSendTranscript,
        recentSuggestionIds: state.recentSuggestionIds,
      }),
    },
  ),
);
