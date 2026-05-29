import "server-only";

import { KNOWN_DUPLICATE_GROUPS } from "@/lib/venue-cleanup";

/** Legacy public URL slugs → canonical venue slug (permanent redirect). */
export const PUBLIC_VENUE_SLUG_REDIRECTS: Record<string, string> =
  Object.fromEntries(
    KNOWN_DUPLICATE_GROUPS.flatMap((group) =>
      group.aliasSlugs.map((alias) => [alias, group.canonicalSlug] as const)
    )
  );

const DEPRECATED_PUBLIC_VENUE_SLUGS = new Set(
  Object.keys(PUBLIC_VENUE_SLUG_REDIRECTS)
);

export function isDeprecatedPublicVenueSlug(slug: string): boolean {
  return DEPRECATED_PUBLIC_VENUE_SLUGS.has(slug.trim().toLowerCase());
}

/** Resolves legacy slugs; returns input unchanged when already canonical. */
export function resolveCanonicalPublicVenueSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return PUBLIC_VENUE_SLUG_REDIRECTS[normalized] ?? slug.trim();
}

export function canonicalVenuePath(slug: string): string {
  return `/venues/${resolveCanonicalPublicVenueSlug(slug)}`;
}
