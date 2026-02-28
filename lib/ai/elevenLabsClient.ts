import { getServerEnv } from "@/lib/env";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function elevenLabsFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const env = getServerEnv();

  return fetch(`${ELEVENLABS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "xi-api-key": env.ELEVENLABS_API_KEY,
      ...(init?.headers ?? {}),
    },
  });
}
