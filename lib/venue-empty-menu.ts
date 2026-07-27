/**
 * Big Ten / NCAA venues intentionally seeded without a starter menu
 * (thin or unpublished concession sources). Venue pages should show a
 * clean "Menu coming soon" empty state — not a filter miss.
 */
export const NCAA_MENU_PENDING_VENUE_SLUGS = new Set([
  "ryan-field",
  "ross-ade-stadium",
  "shi-stadium"
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
