import { create } from "zustand";

type InputMode = "text" | "voice";

type WorkspaceState = {
  code: string;
  isPlaying: boolean;
  inputMode: InputMode;
  suggestions: string[];
  setCode: (code: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setInputMode: (inputMode: InputMode) => void;
  setSuggestions: (suggestions: string[]) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  code: "s(\"bd sd\")",
  isPlaying: false,
  inputMode: "text",
  suggestions: [],
  setCode: (code) => set({ code }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setInputMode: (inputMode) => set({ inputMode }),
  setSuggestions: (suggestions) => set({ suggestions }),
}));
