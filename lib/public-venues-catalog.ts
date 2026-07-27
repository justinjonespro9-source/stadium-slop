/**
 * Public `/venues` catalog cache policy (no Prisma / server-only imports).
 * Kept separate so production browse never silently caches the ~32-row sample list.
 */

/** Versioned Data Cache key — bump the second segment to invalidate poisoned entries. */
export const PUBLIC_VENUES_CACHE_KEY_PARTS = [
  "public-venues",
  "v7-acc"
] as const;

export type PublicVenuesCacheKeyPart = (typeof PUBLIC_VENUES_CACHE_KEY_PARTS)[number];

/**
 * Opt-in only. Production must never set this.
 * When `"1"`, catalog loaders may return static sample venues (local/demo/tests).
 */
export const SAMPLE_VENUE_CATALOG_FALLBACK_ENV = "STADIUM_SLOP_PUBLIC_VENUES_SAMPLE_FALLBACK";

export type EnvLike = Record<string, string | undefined>;

export function allowSampleVenueCatalogFallback(
  env: EnvLike = process.env
): boolean {
  return env[SAMPLE_VENUE_CATALOG_FALLBACK_ENV] === "1";
}

/**
 * Decide what a failed production catalog query should do.
 * - opt-in sample → return `"sample"`
 * - otherwise → `"rethrow"` (do not treat sample as a valid cached catalog)
 */
export function resolvePublicVenueCatalogFailureAction(
  env: EnvLike = process.env
): "sample" | "rethrow" {
  return allowSampleVenueCatalogFallback(env) ? "sample" : "rethrow";
}

export function formatPublicVenueCatalogFailureLog(error: unknown): {
  message: string;
  cacheKey: readonly string[];
  sampleFallbackAllowed: boolean;
} {
  return {
    message: error instanceof Error ? error.message : String(error),
    cacheKey: [...PUBLIC_VENUES_CACHE_KEY_PARTS],
    sampleFallbackAllowed: allowSampleVenueCatalogFallback()
  };
}
