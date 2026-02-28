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
  const [status, setStatus] = useState<string | null>(null);

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
    setStatus("Saving...");
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    saveUsageLimits(payload.usageLimits);
    setStatus(response.ok ? "Saved." : "Could not save settings.");
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Configure API keys and per-service usage limits.
      </p>

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
              className="mt-1 w-full rounded border p-2"
            />
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
              className="mt-1 w-full rounded border p-2"
            />
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
            </label>
          ))}
        </section>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">{status}</span>
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

