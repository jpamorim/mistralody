"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadUsage,
  loadUsageLimits,
  type UsageService,
  type UsageStats,
  usagePercent,
} from "@/lib/usage/usageTracker";

function statusColor(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-yellow-500";
  return "bg-emerald-500";
}

function ServiceRow({
  service,
  stats,
}: {
  service: UsageService;
  stats: UsageStats;
}) {
  const percent = usagePercent(stats);
  const resetAt = new Date(stats.resetAt).toLocaleString();
  const warning =
    percent >= 100
      ? "Limit reached. New requests may be blocked."
      : percent >= 95
        ? "Critical: almost at limit."
        : percent >= 80
          ? "Warning: approaching limit."
          : null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="uppercase">{service}</span>
        <span>
          {stats.used}/{stats.limit} ({percent}%)
        </span>
      </div>
      <div className="h-2 rounded bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-2 rounded ${statusColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-[10px] text-zinc-500">Resets: {resetAt}</div>
      {warning ? <div className="text-[10px] text-amber-600">{warning}</div> : null}
    </div>
  );
}

export function UsageIndicator() {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState(() => loadUsage(loadUsageLimits()));

  useEffect(() => {
    const onFocus = () => setStats(loadUsage(loadUsageLimits()));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const overallPercent = useMemo(() => {
    const values = Object.values(stats).map((value) => usagePercent(value));
    return Math.max(...values, 0);
  }, [stats]);

  return (
    <div className="w-full shrink-0 rounded-lg border bg-background p-2">
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm"
        onClick={() => setExpanded((value) => !value)}
      >
        <span>API Usage</span>
        <span>{overallPercent}%</span>
      </button>
      {expanded ? (
        <div className="mt-3 space-y-3">
          <ServiceRow service="mistral" stats={stats.mistral} />
          <ServiceRow service="voxtral" stats={stats.voxtral} />
          <ServiceRow service="elevenlabs" stats={stats.elevenlabs} />
          <div className="rounded border border-dashed p-2 text-[10px] text-zinc-500">
            Usage is tracked from successful API calls (transcription, edits, lyrics,
            singing).
          </div>
        </div>
      ) : null}
    </div>
  );
}

