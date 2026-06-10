/**
 * Structured NCAA venue + menu import payload.
 *
 * Versioned JSON for `scripts/import-ncaa.ts`. Venues carry college metadata;
 * items are flat rows keyed by venueSlug (official athletics/concessions sources).
 *
 * For spreadsheet-style bulk rows, the flat league CSV also supports optional
 * NCAA columns — see `lib/league-import-shape.ts`.
 */

export const NCAA_IMPORT_VERSION = 1 as const;

export type NcaaSport = "Football" | "Basketball" | "Multi-Sport";

export type NcaaVenueImportRow = {
  slug: string;
  name: string;
  /** Official institution name */
  school: string;
  /** Primary tenant display name, e.g. "Michigan Wolverines" */
  team: string;
  sport: NcaaSport;
  /** Athletic conference, e.g. SEC, Big Ten */
  conference?: string;
  /** FBS, FBS, Division I, etc. */
  subdivision?: string;
  city: string;
  state: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters?: number;
  timeZone: string;
  /** Prisma enum string — defaults to COLLEGE_STADIUM */
  venueType?: string;
  /** When set, merge into an existing pro/shared venue slug instead of creating new */
  mergeIntoVenueSlug?: string;
  /** Official athletics food & beverage / gameday concessions page */
  sourceUrl?: string;
  reviewNotes?: string;
};

export type NcaaItemImportRow = {
  venueSlug: string;
  vendor: string;
  stand_name?: string;
  section?: string;
  item_name: string;
  description?: string;
  price?: number;
  category?: string;
  source_url?: string;
  season?: string;
  tags?: string[];
};

export type NcaaImportPayload = {
  version: typeof NCAA_IMPORT_VERSION;
  venues: NcaaVenueImportRow[];
  items: NcaaItemImportRow[];
};

export function parseNcaaImportPayload(raw: unknown): NcaaImportPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("NCAA import file must be a JSON object.");
  }
  const o = raw as Record<string, unknown>;
  if (o.version !== NCAA_IMPORT_VERSION) {
    throw new Error(`Expected version ${NCAA_IMPORT_VERSION}, got ${String(o.version)}`);
  }
  if (!Array.isArray(o.venues)) {
    throw new Error("NCAA import must include venues[] array.");
  }
  if (!Array.isArray(o.items)) {
    throw new Error("NCAA import must include items[] array.");
  }
  return {
    version: NCAA_IMPORT_VERSION,
    venues: o.venues as NcaaVenueImportRow[],
    items: o.items as NcaaItemImportRow[]
  };
}
