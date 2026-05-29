import "server-only";

const DEFAULT_SLOW_MS = 750;

/** Allowlisted public routes — only these emit slow-route timing logs. */
export const PUBLIC_ROUTE_LABELS = [
  "homepage",
  "venues-browse",
  "venue-page",
  "food-item-page",
  "vendor-page",
  "world-cup-guide",
  "world-cup-guide-es"
] as const;

export type PublicRouteLabel = (typeof PUBLIC_ROUTE_LABELS)[number];

const PUBLIC_ROUTE_LABEL_SET = new Set<string>(PUBLIC_ROUTE_LABELS);

function slowThresholdMs(): number {
  const raw = process.env.ROUTE_TIMING_SLOW_MS;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed >= 100 && parsed <= 60_000) {
    return parsed;
  }
  return DEFAULT_SLOW_MS;
}

function shouldLogRouteTiming(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ROUTE_TIMING === "1" ||
    process.env.ROUTE_TIMING === "true"
  );
}

function logSlowPublicRoute(label: PublicRouteLabel, ms: number): void {
  console.info(`[route-timing] route=${label} durationMs=${ms} slow=true`);
}

/**
 * Times allowlisted public routes only. Logs when duration exceeds
 * ROUTE_TIMING_SLOW_MS (default 750ms) in production or when ROUTE_TIMING=1.
 */
export async function withPublicRouteTiming<T>(
  label: PublicRouteLabel,
  fn: () => Promise<T>
): Promise<T> {
  if (!shouldLogRouteTiming()) {
    return fn();
  }

  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - start);
    if (ms >= slowThresholdMs()) {
      logSlowPublicRoute(label, ms);
    }
  }
}

/** @deprecated Prefer withPublicRouteTiming for typed public route labels. */
export async function withRouteTiming<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!PUBLIC_ROUTE_LABEL_SET.has(label)) {
    return fn();
  }
  return withPublicRouteTiming(label as PublicRouteLabel, fn);
}
