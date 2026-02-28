"use client";

import { getContextualSuggestions } from "@/lib/commands/suggestionEngine";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";

export function SuggestionsPane() {
  const { code, inputMode, setSuggestions } = useWorkspaceStore();
  const suggestions = getContextualSuggestions({ code });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">Suggestions</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Mode: {inputMode === "voice" ? "voice template" : "text command"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setSuggestions([suggestion.prompt])}
            title={suggestion.prompt}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

