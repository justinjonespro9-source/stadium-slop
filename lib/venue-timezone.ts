import { getMlbBallparkSeedRows } from "@/lib/mlb-ballpark-seed-data";

/** US state / territory → IANA timezone for MLB ballparks. */
const US_STATE_IANA: Record<string, string> = {
  AL: "America/Chicago",
  AR: "America/Chicago",
  AZ: "America/Phoenix",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DC: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  IA: "America/Chicago",
  IL: "America/Chicago",
  IN: "America/New_York",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  MA: "America/New_York",
  MD: "America/New_York",
  MI: "America/Detroit",
  MN: "America/Chicago",
  MO: "America/Chicago",
  MS: "America/Chicago",
  NC: "America/New_York",
  NE: "America/Chicago",
  NJ: "America/New_York",
  NV: "America/Los_Angeles",
  NY: "America/New_York",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VA: "America/New_York",
  WA: "America/Los_Angeles",
  WI: "America/Chicago"
};

const CANADA_PROVINCE_IANA: Record<string, string> = {
  AB: "America/Edmonton",
  BC: "America/Vancouver",
  MB: "America/Winnipeg",
  NB: "America/Moncton",
  NL: "America/St_Johns",
  NS: "America/Halifax",
  ON: "America/Toronto",
  QC: "America/Toronto",
  SK: "America/Regina"
};

/** Fan-facing short labels for common zones. */
const IANA_ZONE_ABBREV: Record<string, string> = {
  "America/New_York": "ET",
  "America/Detroit": "ET",
  "America/Toronto": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Phoenix": "AZ",
  "America/Los_Angeles": "PT",
  "America/Vancouver": "PT"
};

/** Flagship parks — explicit overrides (also covered by state map). */
const VENUE_SLUG_TIMEZONE_OVERRIDES: Record<string, string> = {
  "target-field": "America/Chicago",
  "wrigley-field": "America/Chicago",
  "yankee-stadium": "America/New_York",
  "dodger-stadium": "America/Los_Angeles"
};

const MLB_SLUG_TIMEZONE: Record<string, string> = {};

for (const row of getMlbBallparkSeedRows()) {
  const slug = row.slug;
  if (VENUE_SLUG_TIMEZONE_OVERRIDES[slug]) {
    MLB_SLUG_TIMEZONE[slug] = VENUE_SLUG_TIMEZONE_OVERRIDES[slug];
    continue;
  }
  const state = row.state?.trim().toUpperCase();
  if (!state) continue;
  if (state === "ON" || row.country?.toUpperCase() === "CANADA") {
    MLB_SLUG_TIMEZONE[slug] =
      CANADA_PROVINCE_IANA[state] ?? "America/Toronto";
  } else {
    MLB_SLUG_TIMEZONE[slug] =
      US_STATE_IANA[state] ?? "America/New_York";
  }
}

export type VenueTimeZoneInput = {
  slug: string;
  state?: string | null;
  country?: string | null;
};

const DEFAULT_VENUE_TIMEZONE = "America/New_York";

/** Resolve IANA timezone for a venue (slug map, then state/country). */
export function getVenueTimeZone(venue: VenueTimeZoneInput): string {
  const fromSlug =
    MLB_SLUG_TIMEZONE[venue.slug] ?? VENUE_SLUG_TIMEZONE_OVERRIDES[venue.slug];
  if (fromSlug) return fromSlug;

  const state = venue.state?.trim().toUpperCase();
  if (!state) return DEFAULT_VENUE_TIMEZONE;

  const country = venue.country?.trim().toUpperCase();
  if (country === "CANADA" || CANADA_PROVINCE_IANA[state]) {
    return CANADA_PROVINCE_IANA[state] ?? "America/Toronto";
  }

  return US_STATE_IANA[state] ?? DEFAULT_VENUE_TIMEZONE;
}

export function formatVenueTimeZoneAbbrev(
  timeZone: string,
  date: Date = new Date()
): string {
  const mapped = IANA_ZONE_ABBREV[timeZone];
  if (mapped) return mapped;

  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;

  return part ?? timeZone;
}

function zonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

/** Offset of `timeZone` from UTC at `date` (ms to add to UTC to get zoned wall clock as UTC ms). */
function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const zonedDate = new Date(date.toLocaleString("en-US", { timeZone }));
  return zonedDate.getTime() - utcDate.getTime();
}

/** Format instant for display at the venue (optional short zone label). */
export function formatGameDateTimeForVenue(
  date: Date,
  timeZone: string,
  options?: { includeZone?: boolean }
) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

  if (options?.includeZone) {
    return `${formatted} ${formatVenueTimeZoneAbbrev(timeZone, date)}`;
  }
  return formatted;
}

export function formatGameTimeForVenue(
  date: Date,
  timeZone: string,
  options?: { includeZone?: boolean }
) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

  if (options?.includeZone) {
    return `${formatted} ${formatVenueTimeZoneAbbrev(timeZone, date)}`;
  }
  return formatted;
}

export function formatGameDayPollingWindowRangeForVenue(
  pollingOpensAt: Date,
  pollingClosesAt: Date,
  timeZone: string
) {
  return `${formatGameTimeForVenue(pollingOpensAt, timeZone)} – ${formatGameTimeForVenue(pollingClosesAt, timeZone, { includeZone: true })}`;
}

/** `datetime-local` value for an instant in the venue zone. */
export function toDatetimeLocalValueForTimeZone(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  const y = String(p.year);
  const m = String(p.month).padStart(2, "0");
  const d = String(p.day).padStart(2, "0");
  const h = String(p.hour).padStart(2, "0");
  const min = String(p.minute).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

/** Parse `datetime-local` wall time in `timeZone` → UTC `Date`. */
export function parseDatetimeLocalInTimeZone(
  value: string,
  timeZone: string
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const h = Number(match[4]);
  const mi = Number(match[5]);

  const pretendUtc = new Date(Date.UTC(y, mo - 1, d, h, mi, 0, 0));
  const offset = getTimeZoneOffsetMs(timeZone, pretendUtc);
  const utcMs = pretendUtc.getTime() - offset;
  const parsed = new Date(utcMs);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** End of civil day (23:59:59.999) for the venue date containing `instant`. */
export function endOfVenueLocalDay(instant: Date, timeZone: string): Date {
  const local = toDatetimeLocalValueForTimeZone(instant, timeZone);
  const datePart = local.slice(0, 10);
  const end = parseDatetimeLocalInTimeZone(`${datePart}T23:59`, timeZone);
  if (!end) return instant;
  return new Date(end.getTime() + 59_999);
}

/** Sanity-check samples for CLI verification (Yankees ET, Twins CT, Dodgers PT). */
export function verifyVenueTimezoneSamples() {
  const samples = [
    {
      label: "Yankees 7:05 PM ET",
      slug: "yankee-stadium",
      utc: "2026-05-20T23:05:00.000Z",
      expect: { hour12: 7, minute: 5, dayPeriod: "PM", abbrev: "ET" }
    },
    {
      label: "Twins evening CT",
      slug: "target-field",
      utc: "2026-05-20T22:40:00.000Z",
      expect: { hour12: 5, minute: 40, dayPeriod: "PM", abbrev: "CT" }
    },
    {
      label: "Dodgers 7:10 PM PT",
      slug: "dodger-stadium",
      utc: "2026-05-22T02:10:00.000Z",
      expect: { hour12: 7, minute: 10, dayPeriod: "PM", abbrev: "PT" }
    }
  ] as const;

  return samples.map((sample) => {
    const tz = getVenueTimeZone({ slug: sample.slug });
    const date = new Date(sample.utc);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).formatToParts(date);
    const hour = Number(parts.find((p) => p.type === "hour")?.value);
    const minute = Number(parts.find((p) => p.type === "minute")?.value);
    const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value;
    const abbrev = formatVenueTimeZoneAbbrev(tz, date);
    const ok =
      hour === sample.expect.hour12 &&
      minute === sample.expect.minute &&
      dayPeriod === sample.expect.dayPeriod &&
      abbrev === sample.expect.abbrev;
    return {
      ...sample,
      timeZone: tz,
      display: formatGameDateTimeForVenue(date, tz, { includeZone: true }),
      ok
    };
  });
}
