const vocalStore = new Map<
  string,
  { buffer: Buffer; mimeType: string }
>();

export function storeVocalAudio(
  audioBase64: string,
  mimeType: string,
): string {
  const id = crypto.randomUUID();
  const buffer = Buffer.from(audioBase64, "base64");
  vocalStore.set(id, { buffer, mimeType });
  return id;
}

export function getVocalAudio(id: string): { buffer: Buffer; mimeType: string } | null {
  return vocalStore.get(id) ?? null;
}
