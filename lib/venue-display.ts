import { VenueType } from "@prisma/client";

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
  OTHER: "📍"
};

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
