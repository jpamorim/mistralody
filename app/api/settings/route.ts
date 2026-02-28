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
    mistralApiKey?: string;
    elevenlabsApiKey?: string;
    usageLimits?: Record<string, { limit: number; period: "daily" | "monthly" }>;
  };

  const next = updateSettings({
    mistralApiKey: payload.mistralApiKey || undefined,
    elevenlabsApiKey: payload.elevenlabsApiKey || undefined,
    usageLimits: payload.usageLimits as
      | ReturnType<typeof getSettings>["usageLimits"]
      | undefined,
  });

  return NextResponse.json(next);
}

