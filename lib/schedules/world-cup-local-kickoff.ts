import { parseDatetimeLocalInTimeZone } from "@/lib/venue-timezone";

import { getWorldCupVenueTimeZone } from "@/lib/schedules/world-cup-fixture-timezone";
import type { WorldCupVenueSlug } from "@/lib/schedules/world-cup-venue-map";

/** Convert venue-local civil date + HH:mm to UTC ISO string. */
export function worldCupLocalKickoffToUtc(
  localDate: string,
  localTime: string,
  venueSlug: WorldCupVenueSlug
): string {
  const timeZone = getWorldCupVenueTimeZone(venueSlug);
  const value = `${localDate}T${localTime}`;
  const utc = parseDatetimeLocalInTimeZone(value, timeZone);
  if (!utc) {
    throw new Error(
      `Invalid local kickoff ${value} for ${venueSlug} (${timeZone})`
    );
  }
  return utc.toISOString();
}

/** Format local kickoff for audit display in venue timezone. */
export function formatWorldCupLocalKickoff(
  startsAtUtc: string,
  venueSlug: WorldCupVenueSlug
): string {
  const timeZone = getWorldCupVenueTimeZone(venueSlug);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false
  }).format(new Date(startsAtUtc));
}
