"use client";

import { StrudelVisualizer } from "@strudel-studio/visualizer";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";

export function StrudelVisualizerPane() {
  const { code, isPlaying, cps } = useWorkspaceStore();

  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <StrudelVisualizer
        code={code}
        isPlaying={isPlaying}
        cps={cps}
        width="100%"
        height="180px"
        barCount={72}
      />
    </div>
  );
}

