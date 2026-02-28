"use client";

import { useWorkspaceStore } from "@/lib/state/workspaceStore";

export function SplitWorkspace() {
  const { code, inputMode, isPlaying } = useWorkspaceStore();

  return (
    <section className="grid min-h-[70vh] gap-4 p-4 lg:grid-cols-2">
      <article className="rounded-md border p-4">
        <h2 className="text-lg font-semibold">Strudel Editor</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          First bootstrap milestone: dependencies and app boundaries are in
          place.
        </p>
        <pre className="mt-4 overflow-auto rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
          {code}
        </pre>
      </article>

      <article className="rounded-md border p-4">
        <h2 className="text-lg font-semibold">Chat + Voice</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Input mode: {inputMode} | Playback: {isPlaying ? "playing" : "stopped"}
        </p>
      </article>

      <article className="rounded-md border p-4 lg:col-span-2">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Suggestions pane scaffolding will be implemented in the next todo.
        </p>
      </article>
    </section>
  );
}
