"use client";

import { getContextualSuggestions } from "@/lib/commands/suggestionEngine";
import {
  getSuggestionById,
  getSuggestionReason,
} from "@/lib/commands/suggestionEngine";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";

export function SuggestionsPane() {
  const { code, inputMode, setSuggestions, pushRecentSuggestion, recentSuggestionIds } =
    useWorkspaceStore();
  const suggestions = getContextualSuggestions({ code });
  const recentSuggestions = recentSuggestionIds
    .map((id) => getSuggestionById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 3);

  const selectSuggestion = (prompt: string, id: string) => {
    setSuggestions([prompt]);
    pushRecentSuggestion(id);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">Suggestions</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Mode: {inputMode === "voice" ? "voice template" : "text command"} | Click
        to preview in chat before sending.
      </p>
      {recentSuggestions.length > 0 ? (
        <div className="mt-3 rounded-md border border-dashed p-2">
          <p className="text-xs font-medium text-zinc-500">Recent</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentSuggestions.map((suggestion) => (
              <button
                key={`recent-${suggestion.id}`}
                type="button"
                className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => selectSuggestion(suggestion.prompt, suggestion.id)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="group relative">
            <button
              type="button"
              className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => selectSuggestion(suggestion.prompt, suggestion.id)}
              title={suggestion.prompt}
            >
              {suggestion.label}
            </button>
            <span className="ml-1 rounded border px-1 py-0.5 text-[10px] uppercase text-zinc-500">
              {suggestion.category}
            </span>
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-56 rounded border bg-background p-2 text-[10px] text-zinc-600 shadow group-hover:block dark:text-zinc-300">
              {getSuggestionReason(suggestion, code)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

