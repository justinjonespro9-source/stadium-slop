import "server-only";

import { KNOWN_DUPLICATE_GROUPS } from "@/lib/venue-cleanup";

/**
 * Former / sponsored-name public URL slugs → canonical venue slug.
 * These are redirects only (no duplicate venue rows). Used for Big 12 renames
 * and similar naming-rights changes where the physical stadium is unchanged.
 */
export const SPONSORED_NAME_PUBLIC_REDIRECTS: Record<string, string> = {
  "arizona-stadium": "casino-del-sol-stadium",
  "sun-devil-stadium": "mountain-america-stadium",
  "jones-at-t-stadium": "galaxy-stadium",
  "jones-att-stadium": "galaxy-stadium",
  "jones-stadium": "galaxy-stadium",
  "fbc-mortgage-stadium": "acrisure-bounce-house",
  "bounce-house": "acrisure-bounce-house",
  "spectrum-stadium": "acrisure-bounce-house",
  "bright-house-networks-stadium": "acrisure-bounce-house"
};

/** Legacy public URL slugs → canonical venue slug (permanent redirect). */
export const PUBLIC_VENUE_SLUG_REDIRECTS: Record<string, string> = {
  ...Object.fromEntries(
    KNOWN_DUPLICATE_GROUPS.flatMap((group) =>
      group.aliasSlugs.map((alias) => [alias, group.canonicalSlug] as const)
    )
  ),
  ...SPONSORED_NAME_PUBLIC_REDIRECTS
};

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
