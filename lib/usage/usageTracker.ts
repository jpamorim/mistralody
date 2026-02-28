"use client";

export type UsageService = "mistral" | "voxtral" | "elevenlabs";
export type UsagePeriod = "daily" | "monthly";

export type UsageLimit = {
  limit: number;
  period: UsagePeriod;
};

export type UsageStats = {
  used: number;
  limit: number;
  period: UsagePeriod;
  resetAt: number;
};

const STORAGE_KEY = "mistralody-usage-stats";
const LIMITS_STORAGE_KEY = "mistralody-usage-limits";

type StoredUsage = Record<UsageService, UsageStats>;

const defaultLimits: Record<UsageService, UsageLimit> = {
  mistral: { limit: 100, period: "daily" },
  voxtral: { limit: 100, period: "daily" },
  elevenlabs: { limit: 600, period: "monthly" },
};

export function getDefaultLimits(): Record<UsageService, UsageLimit> {
  return {
    mistral: { ...defaultLimits.mistral },
    voxtral: { ...defaultLimits.voxtral },
    elevenlabs: { ...defaultLimits.elevenlabs },
  };
}

function getResetAt(period: UsagePeriod): number {
  const date = new Date();
  if (period === "daily") {
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }
  date.setMonth(date.getMonth() + 1, 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function initUsage(limits = defaultLimits): StoredUsage {
  const initial: Partial<StoredUsage> = {};

  (Object.keys(limits) as UsageService[]).forEach((service) => {
    initial[service] = {
      used: 0,
      limit: limits[service].limit,
      period: limits[service].period,
      resetAt: getResetAt(limits[service].period),
    };
  });

  return initial as StoredUsage;
}

export function loadUsage(limits = defaultLimits): StoredUsage {
  if (typeof window === "undefined") return initUsage(limits);

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initUsage(limits);

  try {
    const parsed = JSON.parse(raw) as StoredUsage;
    const now = Date.now();
    const normalized = { ...parsed };

    (Object.keys(limits) as UsageService[]).forEach((service) => {
      const existing = normalized[service];
      if (!existing || now > existing.resetAt) {
        normalized[service] = {
          used: 0,
          limit: limits[service].limit,
          period: limits[service].period,
          resetAt: getResetAt(limits[service].period),
        };
      }
    });

    return normalized;
  } catch {
    return initUsage(limits);
  }
}

export function loadUsageLimits(): Record<UsageService, UsageLimit> {
  if (typeof window === "undefined") return getDefaultLimits();
  const raw = localStorage.getItem(LIMITS_STORAGE_KEY);
  if (!raw) return getDefaultLimits();
  try {
    return JSON.parse(raw) as Record<UsageService, UsageLimit>;
  } catch {
    return getDefaultLimits();
  }
}

export function saveUsageLimits(limits: Record<UsageService, UsageLimit>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(limits));
}

export function saveUsage(usage: StoredUsage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function incrementUsage(
  usage: StoredUsage,
  service: UsageService,
  delta = 1,
): StoredUsage {
  const updated = {
    ...usage,
    [service]: {
      ...usage[service],
      used: usage[service].used + delta,
    },
  };

  saveUsage(updated);
  return updated;
}

export function usagePercent(stats: UsageStats): number {
  if (stats.limit <= 0) return 0;
  return Math.min(100, Math.round((stats.used / stats.limit) * 100));
}

