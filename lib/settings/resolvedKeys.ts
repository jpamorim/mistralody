import { getServerEnv } from "@/lib/env";
import { getSettings } from "@/lib/settings/serverSettingsStore";

export function resolveMistralApiKey(): string {
  const settings = getSettings();
  if (settings.mistralApiKey) return settings.mistralApiKey;
  return getServerEnv().MISTRAL_API_KEY;
}

export function resolveElevenLabsApiKey(): string {
  const settings = getSettings();
  if (settings.elevenlabsApiKey) return settings.elevenlabsApiKey;
  return getServerEnv().ELEVENLABS_API_KEY;
}

