import type { Venue } from "@/lib/sample-data";

export const VENUE_SEARCH_EMPTY_MESSAGE =
  "No venue found yet. Suggest a venue coming soon.";

function normSegment(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** All text we match against (substring, case-insensitive). */
export function venueSearchHaystack(venue: Venue): string {
  const parts: string[] = [
    venue.name,
    venue.slug.replace(/-/g, " "),
    venue.city,
    venue.state,
    venue.country,
    venue.region,
    venue.venueType,
    venue.venueTypeKey?.replace(/_/g, " ") ?? "",
    venue.primarySport ?? "",
    venue.surfaceType ?? "",
    ...venue.teams,
    ...venue.leagues,
    ...venue.sports,
    ...(venue.recurringEvents ?? [])
  ];
  return parts.join("\n").toLowerCase();
}

/**
 * AND-match on whitespace-separated tokens (e.g. "minneapolis twins").
 * Empty query returns all venues unchanged.
 */
export function filterVenuesBySearch(venues: Venue[], rawQuery: string): Venue[] {
  const q = normSegment(rawQuery);
  if (!q) {
    return venues;
  }
  const tokens = q.split(" ").filter(Boolean);
  return venues.filter((venue) => {
    const hay = venueSearchHaystack(venue);
    return tokens.every((t) => hay.includes(t));
  });
}
