"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UsageLimit, UsageService } from "@/lib/usage/usageTracker";
import {
  getDefaultLimits,
  saveUsageLimits,
  loadUsageLimits,
} from "@/lib/usage/usageTracker";

type SettingsPayload = {
  mistralApiKey?: string;
  elevenlabsApiKey?: string;
  usageLimits: Record<UsageService, UsageLimit>;
};

export default function SettingsPage() {
  const [payload, setPayload] = useState<SettingsPayload>({
    usageLimits: getDefaultLimits(),
  });
  const [status, setStatus] = useState<{ type: "ok" | "error" | "info"; text: string } | null>(null);
  const [testingProvider, setTestingProvider] = useState<UsageService | "elevenlabs-key" | "mistral-key" | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) return;
      const data = (await response.json()) as SettingsPayload;
      setPayload({
        ...data,
        usageLimits: {
          ...data.usageLimits,
          ...loadUsageLimits(),
        },
      });
    })();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasInvalidLimit = (Object.keys(payload.usageLimits) as UsageService[]).some(
      (service) => payload.usageLimits[service].limit < 1,
    );
    if (hasInvalidLimit) {
      setStatus({ type: "error", text: "Usage limits must be at least 1." });
      return;
    }

    setStatus({ type: "info", text: "Saving..." });
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    saveUsageLimits(payload.usageLimits);
    setStatus(
      response.ok
        ? { type: "ok", text: "Saved settings successfully." }
        : { type: "error", text: "Could not save settings." },
    );
  };

  const testKey = async (provider: "mistral" | "elevenlabs") => {
    const apiKey =
      provider === "mistral" ? payload.mistralApiKey : payload.elevenlabsApiKey;
    setTestingProvider(provider === "mistral" ? "mistral-key" : "elevenlabs-key");
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test",
        provider,
        apiKey,
      }),
    });
    const data = (await response.json()) as { ok: boolean; message: string };
    setTestingProvider(null);
    setStatus({
      type: data.ok ? "ok" : "error",
      text: data.message,
    });
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Configure API keys and per-service usage limits.
      </p>
      <div className="mt-3 rounded border border-dashed p-3 text-xs text-zinc-500">
        Keys are stored server-side for this app runtime. Usage limits are stored in
        your browser to control local warnings and indicators.
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <section className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">API keys</h2>
          <label className="block text-sm">
            <span>Mistral API key</span>
            <input
              type="password"
              value={payload.mistralApiKey ?? ""}
              onChange={(event) =>
                setPayload((prev) => ({
                  ...prev,
                  mistralApiKey: event.target.value,
                }))
              }
              className={`mt-1 w-full rounded border p-2 ${payload.mistralApiKey && payload.mistralApiKey.length < 10 ? "border-red-500" : ""}`}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Must be at least 10 chars.</span>
              <button
                type="button"
                onClick={() => void testKey("mistral")}
                className="rounded border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                disabled={testingProvider === "mistral-key"}
              >
                {testingProvider === "mistral-key" ? "Testing..." : "Test key"}
              </button>
            </div>
          </label>
          <label className="block text-sm">
            <span>ElevenLabs API key</span>
            <input
              type="password"
              value={payload.elevenlabsApiKey ?? ""}
              onChange={(event) =>
                setPayload((prev) => ({
                  ...prev,
                  elevenlabsApiKey: event.target.value,
                }))
              }
              className={`mt-1 w-full rounded border p-2 ${payload.elevenlabsApiKey && payload.elevenlabsApiKey.length < 10 ? "border-red-500" : ""}`}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Must be at least 10 chars.</span>
              <button
                type="button"
                onClick={() => void testKey("elevenlabs")}
                className="rounded border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                disabled={testingProvider === "elevenlabs-key"}
              >
                {testingProvider === "elevenlabs-key" ? "Testing..." : "Test key"}
              </button>
            </div>
          </label>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Usage limits</h2>
          {(Object.keys(payload.usageLimits) as UsageService[]).map((service) => (
            <label key={service} className="block text-sm">
              <span className="uppercase">{service}</span>
              <input
                type="number"
                min={1}
                value={payload.usageLimits[service].limit}
                onChange={(event) =>
                  setPayload((prev) => ({
                    ...prev,
                    usageLimits: {
                      ...prev.usageLimits,
                      [service]: {
                        ...prev.usageLimits[service],
                        limit: Number(event.target.value),
                      },
                    },
                  }))
                }
                className="mt-1 w-full rounded border p-2"
              />
              <select
                value={payload.usageLimits[service].period}
                onChange={(event) =>
                  setPayload((prev) => ({
                    ...prev,
                    usageLimits: {
                      ...prev.usageLimits,
                      [service]: {
                        ...prev.usageLimits[service],
                        period: event.target.value as UsageLimit["period"],
                      },
                    },
                  }))
                }
                className="mt-1 w-full rounded border p-2"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          ))}
        </section>

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              status?.type === "error"
                ? "text-red-500"
                : status?.type === "ok"
                  ? "text-emerald-600"
                  : "text-zinc-500"
            }`}
          >
            {status?.text}
          </span>
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Save settings
          </button>
        </div>
      </form>
    </main>
  );
}

