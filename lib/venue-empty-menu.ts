/**
 * Big Ten / NCAA venues intentionally seeded without a starter menu
 * (thin or unpublished concession sources). Venue pages should show a
 * clean "Menu coming soon" empty state — not a filter miss.
 *
 * Note: `acrisure-stadium` is pending for *Pitt/college-verified* dishes only.
 * Existing Steelers/NFL rows remain ACTIVE for general stadium visits; college
 * context filtering lives in `lib/shared-venue-menu-scope.ts`.
 */
export const NCAA_MENU_PENDING_VENUE_SLUGS = new Set([
  "ryan-field",
  "ross-ade-stadium",
  "shi-stadium",
  // SEC — thin or unpublished item-level sources (venues still ACTIVE)
  "donald-w-reynolds-razorback-stadium",
  "ben-hill-griffin-stadium",
  "davis-wade-stadium",
  "williams-brice-stadium",
  // Big 12 — thin or unpublished item-level sources
  "lavell-edwards-stadium",
  "jack-trice-stadium",
  "boone-pickens-stadium",
  "galaxy-stadium",
  "rice-eccles-stadium",
  "milan-puskar-stadium",
  "tdecu-stadium",
  // ACC — thin or unpublished college item-level sources
  "california-memorial-stadium",
  "wallace-wade-stadium",
  "acrisure-stadium",
  "allegacy-federal-credit-union-stadium"
]);

export function isNcaaMenuPendingVenue(slug: string): boolean {
  return NCAA_MENU_PENDING_VENUE_SLUGS.has(slug.trim().toLowerCase());
}

/** Empty standings copy when a venue has zero ACTIVE food items. */
export function venueEmptyMenuMessage(venueSlug: string): string {
  if (isNcaaMenuPendingVenue(venueSlug)) {
    return "Menu coming soon. Concessions for this stadium are still being verified — suggest an item below or check back after the season food guide is published.";
  }
  return "Menu coming soon. No active concession items are listed for this venue yet — suggest one below or check back later.";
}
