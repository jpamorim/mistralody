"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { StrudelVisualizerPane } from "@/components/visualizers/StrudelVisualizerPane";

export function StrudelEditorPane() {
  const { code, setCode, setIsPlaying } = useWorkspaceStore();

  useEffect(() => {
    void import("@strudel/repl");
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Strudel Editor</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setIsPlaying(true)}
          >
            Play
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setIsPlaying(false)}
          >
            Stop
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="min-h-[180px] w-full resize-y rounded-md border bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900"
      />

      <StrudelVisualizerPane />
    </div>
  );
}

