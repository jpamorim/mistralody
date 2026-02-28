export type LyricTimingContext = {
  cps: number;
  bpm: number;
  barCount: number;
  targetDurationSeconds: number;
  targetSyllables?: number;
};

export function extractTimingContext(
  code: string,
  fallbackBars = 8,
): LyricTimingContext {
  const cpsMatch = code.match(/setcps\(([\d.]+)\)/);
  const bpmMatch = code.match(/(?:^|[.\s])bpm\(([\d.]+)\)/);

  const cps = cpsMatch ? Number(cpsMatch[1]) : 1;
  const bpm = bpmMatch ? Number(bpmMatch[1]) : cps * 60;
  const barCount = fallbackBars;
  const targetDurationSeconds = (barCount * 4) / cps;
  const targetSyllables = Math.round(targetDurationSeconds * 2.5);

  return { cps, bpm, barCount, targetDurationSeconds, targetSyllables };
}

