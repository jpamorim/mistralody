import { NextResponse } from "next/server";
import {
  getSettings,
  updateSettings,
} from "@/lib/settings/serverSettingsStore";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action?: "save" | "test";
    provider?: "mistral" | "elevenlabs";
    apiKey?: string;
    mistralApiKey?: string;
    elevenlabsApiKey?: string;
    elevenlabsVoiceId?: string;
    usageLimits?: Record<string, { limit: number; period: "daily" | "monthly" }>;
  };
  if (payload.action === "test") {
    const isValid = Boolean(payload.apiKey && payload.apiKey.trim().length >= 10);
    return NextResponse.json({
      ok: isValid,
      message: isValid
        ? `${payload.provider ?? "Provider"} key format looks valid.`
        : `${payload.provider ?? "Provider"} key seems invalid.`,
    });
  }

  const next = updateSettings({
    mistralApiKey: payload.mistralApiKey || undefined,
    elevenlabsApiKey: payload.elevenlabsApiKey || undefined,
    elevenlabsVoiceId: payload.elevenlabsVoiceId || undefined,
    usageLimits: payload.usageLimits as
      | ReturnType<typeof getSettings>["usageLimits"]
      | undefined,
  });

  return NextResponse.json(next);
}

