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
  chatMessages: ChatMessage[];
  currentStep: AsyncStep;
  lastError: string | null;
  setCode: (code: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCps: (cps: number) => void;
  setInputMode: (inputMode: InputMode) => void;
  setSuggestions: (suggestions: string[]) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  setCurrentStep: (step: AsyncStep) => void;
  setError: (message: string | null) => void;
  clearMessages: () => void;
};

const defaultCode = [
  "setcps(1)",
  "stack(",
  "  s(\"bd sd hh*2\").gain(0.9),",
  "  note(\"c3 e3 g3\").s(\"sawtooth\").room(0.2)",
  ").play()",
].join("\n");

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      code: defaultCode,
      isPlaying: false,
      cps: 1,
      inputMode: "text",
      suggestions: [],
      chatMessages: [],
      currentStep: "idle",
      lastError: null,
      setCode: (code) => set({ code }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCps: (cps) => set({ cps }),
      setInputMode: (inputMode) => set({ inputMode }),
      setSuggestions: (suggestions) => set({ suggestions }),
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
      clearMessages: () => set({ chatMessages: [] }),
    }),
    {
      name: "mistralody-workspace-state",
      partialize: (state) => ({
        code: state.code,
        inputMode: state.inputMode,
        cps: state.cps,
        isPlaying: state.isPlaying,
      }),
    },
  ),
);
