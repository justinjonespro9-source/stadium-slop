import { VenueType } from "@prisma/client";

import { isFairVenueSlug } from "@/lib/fair-import/venues";

/** Human labels for public UI and admin (sports-first wording) */
const VENUE_TYPE_LABEL: Record<VenueType, string> = {
  BALLPARK: "Ballpark",
  STADIUM: "Stadium",
  COLLEGE_STADIUM: "College stadium",
  ARENA: "Arena",
  TENNIS_CENTER: "Tennis center",
  RACETRACK: "Raceway",
  HORSE_TRACK: "Horse track",
  GOLF_COURSE: "Golf course",
  FAIRGROUNDS: "Fairgrounds",
  OTHER: "Other"
};

/** Stable order for admin selects */
export const VENUE_TYPE_OPTIONS: { value: VenueType; label: string }[] = [
  { value: "BALLPARK", label: VENUE_TYPE_LABEL.BALLPARK },
  { value: "STADIUM", label: VENUE_TYPE_LABEL.STADIUM },
  { value: "COLLEGE_STADIUM", label: VENUE_TYPE_LABEL.COLLEGE_STADIUM },
  { value: "ARENA", label: VENUE_TYPE_LABEL.ARENA },
  { value: "TENNIS_CENTER", label: VENUE_TYPE_LABEL.TENNIS_CENTER },
  { value: "RACETRACK", label: VENUE_TYPE_LABEL.RACETRACK },
  { value: "HORSE_TRACK", label: VENUE_TYPE_LABEL.HORSE_TRACK },
  { value: "GOLF_COURSE", label: VENUE_TYPE_LABEL.GOLF_COURSE },
  { value: "FAIRGROUNDS", label: VENUE_TYPE_LABEL.FAIRGROUNDS },
  { value: "OTHER", label: VENUE_TYPE_LABEL.OTHER }
];

/** Optional small chip glyph — sports context, not generic “business” icons */
const VENUE_TYPE_GLYPH: Partial<Record<VenueType, string>> = {
  BALLPARK: "⚾",
  STADIUM: "🏟",
  COLLEGE_STADIUM: "🏈",
  ARENA: "🥅",
  TENNIS_CENTER: "🎾",
  RACETRACK: "🏎",
  HORSE_TRACK: "🏇",
  GOLF_COURSE: "⛳",
  FAIRGROUNDS: "🎡",
  OTHER: "📍"
};

export type VenueTypeDisplayInput = {
  venueType: string;
  slug?: string | null;
  primarySport?: string | null;
  sports?: string[] | null;
  recurringEvents?: string[] | null;
};

function looksLikeStateFairSport(value: string | null | undefined): boolean {
  const text = value?.trim().toLowerCase() ?? "";
  return text === "state fair" || text.includes("state fair");
}

/**
 * Shared fairgrounds detection from venue type + existing fair metadata.
 * Prefer `VenueType.FAIRGROUNDS`; also recognize catalog fair slugs and
 * `primarySport` / sports / recurring-event fair signals so OTHER legacy
 * rows still badge correctly without per-slug UI branches.
 */
export function isFairgroundsVenue(venue: VenueTypeDisplayInput): boolean {
  if (venue.venueType === VenueType.FAIRGROUNDS || venue.venueType === "FAIRGROUNDS") {
    return true;
  }

  if (venue.slug && isFairVenueSlug(venue.slug.trim().toLowerCase())) {
    return true;
  }

  if (looksLikeStateFairSport(venue.primarySport)) {
    return true;
  }

  if (venue.sports?.some((s) => looksLikeStateFairSport(s))) {
    return true;
  }

  if (
    venue.recurringEvents?.some((event) => {
      const text = event.trim().toLowerCase();
      return text.includes("state fair") || text === "the big e";
    })
  ) {
    return true;
  }

  return false;
}

/** Canonical type key for badges / search (never invents types for ordinary OTHER venues). */
export function resolveVenueTypeKey(venue: VenueTypeDisplayInput): string {
  if (isFairgroundsVenue(venue)) {
    return VenueType.FAIRGROUNDS;
  }
  return venue.venueType;
}

export function venueTypeLabel(type: VenueType | string): string {
  if (type in VENUE_TYPE_LABEL) {
    return VENUE_TYPE_LABEL[type as VenueType];
  }
  return type
    .toString()
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function venueTypeGlyph(type: VenueType | string): string | undefined {
  return VENUE_TYPE_GLYPH[type as VenueType];
}

/** Short line for tournament / race / major-event venues */
export function eventVenueHint(recurringEvents: string[]): string | null {
  if (!recurringEvents.length) {
    return null;
  }
  return `Signature events: ${recurringEvents.slice(0, 4).join(" · ")}${
    recurringEvents.length > 4 ? " · …" : ""
  }`;
}
