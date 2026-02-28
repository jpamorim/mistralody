"use client";

import { useState } from "react";

const STORAGE_KEY = "mistralody-onboarding-dismissed";

const starterCommands = [
  "increase tempo by 10%",
  "add light reverb",
  "transpose melody up 2 semitones",
];

export function FirstRunGuide() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  if (dismissed) return null;

  return (
    <section className="mx-auto mb-4 max-w-6xl rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Quick start</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <li>Write or edit Strudel code in the left pane.</li>
            <li>Use text or voice commands in the right pane.</li>
            <li>Open suggestions to discover useful command patterns.</li>
            <li>Configure API keys and limits in Settings.</li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            {starterCommands.map((command) => (
              <span
                key={command}
                className="rounded border bg-background px-2 py-1 text-[11px]"
              >
                {command}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

