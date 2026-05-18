/**
 * MLB-first import payload (venues → vendors → optional items).
 * Versioned JSON for `scripts/apply-mlb-import.ts` and docs in `data/mlb/`.
 *
 * For flat spreadsheet rows (league, team, venue, vendor, stand_name, item_name, …)
 * use `lib/league-import-shape.ts` and `npm run import:league` instead.
 */

export const MLB_IMPORT_VERSION = 1 as const;

export type MlbVenueImportRow = {
  slug: string;
  name: string;
  city: string;
  state: string;
  /** Primary tenant, e.g. "Chicago Cubs" */
  team: string;
  league?: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters?: number;
  /** Prisma enum string, e.g. BALLPARK */
  venueType?: string;
  primarySport?: string;
  recurringEvents?: string[];
  country?: string;
  region?: string;
  /** Seed/import QA; do not invent facts — flag for manual review */
  reviewNotes?: string;
};

export type MlbVendorImportRow = {
  venueSlug: string;
  slug: string;
  name: string;
  section: string;
  location: string;
  lineIntel?: string;
};

export type MlbItemImportRow = {
  venueSlug: string;
  vendorSlug: string;
  slug: string;
  name: string;
  itemType?: "Food" | "Non-Alcoholic Drink" | "Alcoholic Drink";
  category?: string;
  location?: string;
  description?: string;
  price?: number;
  tags?: string[];
};

export type MlbImportPayload = {
  version: typeof MLB_IMPORT_VERSION;
  venues: MlbVenueImportRow[];
  vendors: MlbVendorImportRow[];
  items?: MlbItemImportRow[];
};

export function parseMlbImportPayload(raw: unknown): MlbImportPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Import file must be a JSON object.");
  }
  const o = raw as Record<string, unknown>;
  if (o.version !== MLB_IMPORT_VERSION) {
    throw new Error(`Expected version ${MLB_IMPORT_VERSION}, got ${String(o.version)}`);
  }
  if (!Array.isArray(o.venues)) {
    throw new Error("Import must include venues[] array.");
  }
  const vendors = Array.isArray(o.vendors) ? o.vendors : [];
  return { ...o, venues: o.venues, vendors } as MlbImportPayload;
}
