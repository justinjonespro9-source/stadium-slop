import "server-only";

import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** In-memory sliding window — per server instance; still blunts bursts and bots. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    };
  }

  existing.count += 1;
  return { ok: true };
}

export async function getRequestClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function buildRateLimitKey(
  scope: string,
  identity: { userId?: string | null; ip?: string | null }
): string {
  const userId = identity.userId?.trim();
  if (userId) {
    return `${scope}:user:${userId}`;
  }

  const ip = identity.ip?.trim() || "unknown";
  return `${scope}:ip:${ip}`;
}

export type RateLimitScope =
  | "review-submit"
  | "photo-upload"
  | "price-report"
  | "suggest-item"
  | "review-helpful";

const RATE_LIMITS: Record<
  RateLimitScope,
  { limit: number; windowMs: number }
> = {
  "review-submit": { limit: 12, windowMs: 60 * 60 * 1000 },
  "photo-upload": { limit: 20, windowMs: 60 * 60 * 1000 },
  "price-report": { limit: 24, windowMs: 60 * 60 * 1000 },
  "suggest-item": { limit: 12, windowMs: 60 * 60 * 1000 },
  "review-helpful": { limit: 120, windowMs: 60 * 60 * 1000 }
};

export async function enforceRateLimit(
  scope: RateLimitScope,
  identity: { userId?: string | null }
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const ip = await getRequestClientIp();
  const key = buildRateLimitKey(scope, { userId: identity.userId, ip });
  const { limit, windowMs } = RATE_LIMITS[scope];
  return checkRateLimit(key, limit, windowMs);
}
