export const MAX_RECORDING_SECONDS = 60;
export const MIN_RECORDING_SECONDS = 2;
export const MAX_RECORDING_BYTES = 10 * 1024 * 1024;
export const MIN_RECORDING_BYTES = 4 * 1024; // ~4KB min for usable audio

export function getRecordingLimitMessage(): string {
  return `Voice recording is limited to ${MAX_RECORDING_SECONDS} seconds and 10 MB.`;
}
