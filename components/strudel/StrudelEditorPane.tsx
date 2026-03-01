"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Download } from "lucide-react";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { StrudelVisualizerPane } from "@/components/visualizers/StrudelVisualizerPane";
import { playStrudelCode, stopStrudelPlayback } from "@/lib/strudel/playback";

export function StrudelEditorPane() {
  const {
    code,
    setCode,
    setIsPlaying,
    isPlaying,
    currentStep,
    lastAgentUpdate,
    resetCode,
  } = useWorkspaceStore();
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

  const handleReset = useCallback(() => {
    stopStrudelPlayback();
    setIsPlaying(false);
    setPlayError(null);
    resetCode();
  }, [setIsPlaying, resetCode]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mistralody-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Strudel Editor</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50 ${isPlaying ? "bg-primary text-white hover:bg-primary-hover" : "hover:bg-surface-hover"}`}
            onClick={() => void handlePlay()}
            disabled={disablePlayback}
          >
            Play
          </button>
          <button
            type="button"
            className={`rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50 ${!isPlaying ? "bg-foreground text-background hover:opacity-90" : "hover:bg-surface-hover"}`}
            onClick={handleStop}
            disabled={disablePlayback}
          >
            Stop
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface-hover disabled:opacity-50"
            onClick={handleReset}
            disabled={disablePlayback}
            title="Reset to default pattern"
          >
            <RotateCcw className="inline h-3.5 w-3.5" /> Reset
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface-hover disabled:opacity-50"
            onClick={handleDownload}
            title="Download code as .js file"
          >
            <Download className="inline h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>
      {playError ? (
        <div className="text-xs text-error">{playError}</div>
      ) : null}
      <div className="text-xs text-muted">
        {lastAgentUpdate
          ? `Last agent update: ${lastAgentUpdate}`
          : "No agent updates yet."}
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="min-h-[180px] w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm"
      />

      <StrudelVisualizerPane />
    </div>
  );
}

