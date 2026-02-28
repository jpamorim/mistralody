export const MAX_RECORDING_SECONDS = 60;
export const MAX_RECORDING_BYTES = 10 * 1024 * 1024;

export function getRecordingLimitMessage(): string {
  return `Voice recording is limited to ${MAX_RECORDING_SECONDS} seconds and 10 MB.`;
}
