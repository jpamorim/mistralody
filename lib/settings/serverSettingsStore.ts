import type { UsageLimit, UsageService } from "@/lib/usage/usageTracker";

export type AppSettings = {
  mistralApiKey?: string;
  elevenlabsApiKey?: string;
  usageLimits: Record<UsageService, UsageLimit>;
};

let settings: AppSettings = {
  usageLimits: {
    mistral: { limit: 100, period: "daily" },
    voxtral: { limit: 100, period: "daily" },
    elevenlabs: { limit: 600, period: "monthly" },
  },
};

export function getSettings(): AppSettings {
  return settings;
}

export function updateSettings(next: Partial<AppSettings>): AppSettings {
  settings = {
    ...settings,
    ...next,
    usageLimits: {
      ...settings.usageLimits,
      ...(next.usageLimits ?? {}),
    },
  };
  return settings;
}

