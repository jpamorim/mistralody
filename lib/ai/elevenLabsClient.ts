import { resolveElevenLabsApiKey } from "@/lib/settings/resolvedKeys";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function elevenLabsFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${ELEVENLABS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "xi-api-key": resolveElevenLabsApiKey(),
      ...(init?.headers ?? {}),
    },
  });
}
