"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { UsageLimit, UsageService } from "@/lib/usage/usageTracker";

function maskKey(key: string): string {
  if (!key || key.length <= 3) return "•••";
  return "•".repeat(key.length - 3) + key.slice(-3);
}

function ApiKeyInput({
  value,
  onChange,
  hasError,
  label,
  testLabel,
  onTest,
  testing,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
  label: string;
  testLabel: string;
  onTest: () => void;
  testing: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <span className="text-sm font-medium">{label}</span>
        <input
          type="password"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          autoFocus
          className={`mt-1 w-full rounded border p-2 font-mono ${hasError ? "border-error" : "border-border"}`}
          placeholder="Enter API key"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted">Must be at least 10 chars.</span>
          <button
            type="button"
            onClick={handleBlur}
            className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <div
          className={`min-h-[2.25rem] flex-1 rounded border px-3 py-2 font-mono text-sm ${hasError ? "border-error" : "border-border"} bg-surface`}
        >
          {value ? maskKey(value) : <span className="text-muted">Not set</span>}
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded border border-border p-2 hover:bg-surface-hover"
          aria-label="Edit key"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onTest}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover"
          disabled={testing}
        >
          {testing ? "Testing..." : "Test key"}
        </button>
      </div>
    </div>
  );
}
import {
  getDefaultLimits,
  saveUsageLimits,
  loadUsageLimits,
} from "@/lib/usage/usageTracker";

type SettingsPayload = {
  mistralApiKey?: string;
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
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
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Configure API keys and per-service usage limits.
      </p>
      <div className="mt-3 rounded border border-dashed border-border p-3 text-xs text-muted">
        Keys are stored server-side for this app runtime. Usage limits are stored in
        your browser to control local warnings and indicators.
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <section className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="font-semibold">API keys</h2>
          <ApiKeyInput
            value={payload.mistralApiKey ?? ""}
            onChange={(v) =>
              setPayload((prev) => ({ ...prev, mistralApiKey: v }))
            }
            hasError={
              Boolean(payload.mistralApiKey) &&
              payload.mistralApiKey!.length < 10
            }
            label="Mistral API key"
            testLabel="Test key"
            onTest={() => void testKey("mistral")}
            testing={testingProvider === "mistral-key"}
          />
          <ApiKeyInput
            value={payload.elevenlabsApiKey ?? ""}
            onChange={(v) =>
              setPayload((prev) => ({ ...prev, elevenlabsApiKey: v }))
            }
            hasError={
              Boolean(payload.elevenlabsApiKey) &&
              payload.elevenlabsApiKey!.length < 10
            }
            label="ElevenLabs API key"
            testLabel="Test key"
            onTest={() => void testKey("elevenlabs")}
            testing={testingProvider === "elevenlabs-key"}
          />
          <div className="space-y-1">
            <span className="text-sm font-medium">
              ElevenLabs voice ID (optional)
            </span>
            <input
              type="text"
              value={payload.elevenlabsVoiceId ?? ""}
              onChange={(e) =>
                setPayload((prev) => ({
                  ...prev,
                  elevenlabsVoiceId: e.target.value || undefined,
                }))
              }
              placeholder="e.g. 21m00Tcm4TlvDq8ikWAM (Rachel)"
              className="mt-1 w-full rounded border border-border p-2 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted">
              Override the default singing voice. Leave empty to use the built-in
              default.
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-border p-4">
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
                className="mt-1 w-full rounded border border-border p-2"
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
                className="mt-1 w-full rounded border border-border p-2"
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
                ? "text-error"
                : status?.type === "ok"
                  ? "text-success"
                  : "text-muted"
            }`}
          >
            {status?.text}
          </span>
          <button
            type="submit"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Save settings
          </button>
        </div>
      </form>
    </main>
  );
}

