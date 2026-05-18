/**
 * Flat league menu import — one row per food item (venue/vendor/stand inferred per row).
 *
 * ## Expected CSV columns (header row required)
 *
 * | Column       | Required | Notes |
 * |--------------|----------|-------|
 * | league       | yes      | e.g. MLB, NFL — merged into Venue.leagues[] |
 * | team         | yes      | Primary tenant — merged into Venue.teams[] |
 * | venue        | yes      | Ballpark/stadium name — drives venue slug |
 * | city         | yes      | |
 * | state        | yes      | |
 * | vendor       | yes      | Brand or concessionaire name |
 * | stand_name   | no       | Physical stand; composes vendor slug `{vendor}--{stand}` |
 * | section      | no       | Seating section / concourse label → Vendor.section |
 * | item_name    | yes      | Menu item display name |
 * | description  | no       | FoodItem.description |
 * | price        | no       | Decimal; empty → basePrice null |
 * | category     | no       | Maps to ItemCategory / customCategoryLabel |
 * | source_url   | no       | Stored in tags until optional DB column exists |
 * | season       | no       | FoodItem.seasonIntroduced when set |
 *
 * Optional extra columns (not in minimal template): venue_slug, latitude, longitude
 *
 * ## Future import path
 *
 * 1. Prepare CSV from league spreadsheet (see `data/league-import/league-import.example.csv`).
 * 2. Run: `npm run import:league -- ./data/league-import/your-file.csv`
 *    Or JSON: `npm run import:league -- ./data/league-import/your-file.json`
 * 3. Script upserts via Prisma (idempotent) — does not delete missing rows.
 *
 * ## Schema notes (no migration in this pass)
 *
 * - **Stand** — not a separate table; encoded in vendor slug + display name.
 * - **Team** — not a separate table; deduped on Venue.teams[] by normalized slug.
 *   Shared venues (SoFi, MetLife, future NBA/NHL arenas) also merge tenants via `lib/venue-teams.ts`.
 * - **source_url** — optional tag `import-source:<url>` on FoodItem.tags.
 * - **season** — FoodItem.seasonIntroduced.
 *
 * Proposed later (comment only): `FoodItem.importSourceUrl`, `Stand` model, `Team` model.
 */

export const LEAGUE_IMPORT_VERSION = 1 as const;

/** Canonical CSV header keys (snake_case). */
export const LEAGUE_IMPORT_CSV_COLUMNS = [
  "league",
  "team",
  "venue",
  "city",
  "state",
  "vendor",
  "stand_name",
  "section",
  "item_name",
  "description",
  "price",
  "category",
  "source_url",
  "season"
] as const;

export type LeagueImportCsvColumn = (typeof LEAGUE_IMPORT_CSV_COLUMNS)[number];

/** One flat spreadsheet row before slug normalization. */
export type LeagueImportRow = {
  league: string;
  team: string;
  venue: string;
  city: string;
  state: string;
  vendor: string;
  stand_name?: string;
  section?: string;
  item_name: string;
  description?: string;
  price?: number;
  category?: string;
  source_url?: string;
  season?: string;
  /** Override auto slug from venue name */
  venue_slug?: string;
  latitude?: number;
  longitude?: number;
};

export type LeagueImportPayload = {
  version: typeof LEAGUE_IMPORT_VERSION;
  rows: LeagueImportRow[];
};

function pickString(record: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = record[key]?.trim();
    if (v) {
      return v;
    }
  }
  return undefined;
}

function parseOptionalNumber(raw: string | undefined): number | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  const n = Number(raw.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Map a CSV/JSON record (snake or camelCase keys) to LeagueImportRow. */
export function leagueImportRowFromRecord(
  record: Record<string, string>
): LeagueImportRow | null {
  const league = pickString(record, "league", "League");
  const team = pickString(record, "team", "Team");
  const venue = pickString(record, "venue", "Venue");
  const city = pickString(record, "city", "City");
  const state = pickString(record, "state", "State");
  const vendor = pickString(record, "vendor", "Vendor");
  const item_name = pickString(record, "item_name", "itemName", "Item Name", "item");

  if (!league || !team || !venue || !city || !state || !vendor || !item_name) {
    return null;
  }

  return {
    league,
    team,
    venue,
    city,
    state,
    vendor,
    stand_name: pickString(record, "stand_name", "standName", "Stand Name"),
    section: pickString(record, "section", "Section"),
    item_name,
    description: pickString(record, "description", "Description"),
    price: parseOptionalNumber(pickString(record, "price", "Price")),
    category: pickString(record, "category", "Category"),
    source_url: pickString(record, "source_url", "sourceUrl", "Source URL"),
    season: pickString(record, "season", "Season"),
    venue_slug: pickString(record, "venue_slug", "venueSlug"),
    latitude: parseOptionalNumber(pickString(record, "latitude", "lat", "Latitude")),
    longitude: parseOptionalNumber(pickString(record, "longitude", "lng", "lon", "Longitude"))
  };
}

/** Minimal RFC-style CSV parse (quoted fields supported). */
export function parseCsvToRecords(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length < 2) {
    return [];
  }

  const headers = parseCsvLine(nonEmpty[0]!).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const line = nonEmpty[i]!;
    if (line.trim().startsWith("#")) {
      continue;
    }
    const cells = parseCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = cells[idx] ?? "";
    });
    rows.push(record);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseLeagueImportRowsFromCsv(text: string): LeagueImportRow[] {
  const records = parseCsvToRecords(text);
  const rows: LeagueImportRow[] = [];
  for (const record of records) {
    const row = leagueImportRowFromRecord(record);
    if (row) {
      rows.push(row);
    }
  }
  return rows;
}

export function parseLeagueImportPayload(raw: unknown): LeagueImportPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("League import file must be a JSON object.");
  }
  const o = raw as Record<string, unknown>;
  if (o.version !== LEAGUE_IMPORT_VERSION) {
    throw new Error(`Expected version ${LEAGUE_IMPORT_VERSION}, got ${String(o.version)}`);
  }
  if (!Array.isArray(o.rows)) {
    throw new Error("League import JSON must include rows[] array.");
  }

  const rows: LeagueImportRow[] = [];
  for (const entry of o.rows) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const record: Record<string, string> = {};
    for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
      record[k] = v == null ? "" : String(v);
    }
    const row = leagueImportRowFromRecord(record);
    if (row) {
      rows.push(row);
    }
  }

  return { version: LEAGUE_IMPORT_VERSION, rows };
}
