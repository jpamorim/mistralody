import type { Suggestion } from "@/lib/commands/commandSchema";

const seedSuggestions: Suggestion[] = [
  {
    id: "transport-play",
    label: "Play",
    prompt: "play",
    category: "transport",
  },
  {
    id: "transport-stop",
    label: "Stop",
    prompt: "stop",
    category: "transport",
  },
  {
    id: "tempo-faster",
    label: "Faster",
    prompt: "increase tempo by 10%",
    category: "tempo",
  },
  {
    id: "tempo-slower",
    label: "Slower",
    prompt: "decrease tempo by 10%",
    category: "tempo",
  },
  {
    id: "rhythm-hihat",
    label: "Add hi-hats",
    prompt: "add hi-hats",
    category: "rhythm",
  },
  {
    id: "melody-transpose-up",
    label: "Transpose +2",
    prompt: "transpose melody up 2 semitones",
    category: "melody",
  },
  {
    id: "fx-reverb",
    label: "Add reverb",
    prompt: "add light reverb",
    category: "fx",
  },
  {
    id: "arrangement-layer",
    label: "Add layer",
    prompt: "add second layer",
    category: "arrangement",
  },
  {
    id: "voice-sample",
    label: "Add voice sample",
    prompt: "add a voice sample that fits this groove",
    category: "voice",
  },
];

type SuggestionContext = {
  code: string;
};

export function getContextualSuggestions(context: SuggestionContext): Suggestion[] {
  const hasReverb = /\.room\(/.test(context.code);
  const hasVoice = /voice|vocal|sing/.test(context.code.toLowerCase());

  return seedSuggestions.filter((suggestion) => {
    if (suggestion.id === "fx-reverb" && hasReverb) return false;
    if (suggestion.id === "voice-sample" && hasVoice) return false;
    return true;
  });
}

