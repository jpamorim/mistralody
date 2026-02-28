"use client";

import { useCallback, useEffect, useState } from "react";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { StrudelVisualizerPane } from "@/components/visualizers/StrudelVisualizerPane";
import { playStrudelCode, stopStrudelPlayback } from "@/lib/strudel/playback";

export function StrudelEditorPane() {
  const { code, setCode, setIsPlaying, isPlaying, currentStep, lastAgentUpdate } =
    useWorkspaceStore();
  const [playError, setPlayError] = useState<string | null>(null);
  const disablePlayback = currentStep === "agent-edit" || currentStep === "singing";

  useEffect(() => {
    void import("@strudel/repl");
  }, []);

  const handlePlay = useCallback(async () => {
    setPlayError(null);
    setIsPlaying(true);
    try {
      await playStrudelCode(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Playback failed";
      setPlayError(msg);
      setIsPlaying(false);
    }
  }, [code, setIsPlaying]);

  const handleStop = useCallback(() => {
    stopStrudelPlayback();
    setIsPlaying(false);
    setPlayError(null);
  }, [setIsPlaying]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Strudel Editor</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800 ${isPlaying ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : ""}`}
            onClick={() => void handlePlay()}
            disabled={disablePlayback}
          >
            Play
          </button>
          <button
            type="button"
            className={`rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800 ${!isPlaying ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : ""}`}
            onClick={handleStop}
            disabled={disablePlayback}
          >
            Stop
          </button>
        </div>
      </div>
      {playError ? (
        <div className="text-xs text-red-500">{playError}</div>
      ) : null}
      <div className="text-xs text-zinc-500">
        {lastAgentUpdate
          ? `Last agent update: ${lastAgentUpdate}`
          : "No agent updates yet."}
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

