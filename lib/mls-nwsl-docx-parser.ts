/**
 * Parse SS_MLS_NWSL_VENUE_ITEMS.docx into flat league-import rows.
 * Output only — use `lib/apply-mls-nwsl-import.ts` for database upserts.
 */

import type { LeagueImportRow } from "./league-import-shape";
import {
  looksLikeMlsNwslVenueName,
  normalizeMlsNwslVenueName,
  resolveMlsNwslVenueSlug,
  venueMetaForSlug,
  type MlsNwslVenueMeta
} from "./mls-nwsl-venue-registry";
import { extractDocxParagraphs } from "./nfl-stadium-docx-parser";

export type MlsNwslDocxParseRow = LeagueImportRow & {
  venue_slug: string;
  reviewFlags: string[];
  teams: Array<{ name: string; league: string }>;
};

export type MlsNwslVenueBlock = {
  teams: Array<{ name: string; league: string }>;
  venueNames: string[];
  venueSlugs: string[];
  teamOnly: boolean;
  reviewNotes?: string;
  inferVenueFromIntro?: boolean;
};

export type MlsNwslDocxParseResult = {
  rows: MlsNwslDocxParseRow[];
  venueBlocks: MlsNwslVenueBlock[];
  reviewRows: MlsNwslDocxParseRow[];
  skippedLines: string[];
};

const DEFAULT_SEASON = "2026";
const MAX_DESCRIPTION = 220;

const ITEM_LINE_RE = /^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/;
const PRICED_ITEM_RE = /^(.+?)\s*\(\$[\d.]+\s*-\s*([^)]+)\)\s*:\s*(.+)$/;
const SUB_ITEM_RE = /^([^:]{3,100}):\s*(.+)$/;

const SKIP_PREFIXES = [
  "Welcome to",
  "Marching into",
  "Stepping into",
  "We are heading",
  "Here is your",
  "For the 2026",
  "In a massive",
  "The 2026",
  "Instead, they",
  "Given the",
  "To battle",
  "If you are",
  "Additionally,",
  "Important 2026",
  "When Lionel",
  "First off,",
  "To go along",
  "The culinary",
  "The stadium",
  "Major stands",
  "The Red Bulls",
  "The current",
  "The goal for",
  "You cannot",
  "Reflecting the",
  "Pro-Tip",
  "⚡",
  "👑",
  "🍨",
  "🥟",
  "🌭"
];

const PRICE_MENU_RE = /^\$\d+(?:\.\d{2})?:\s/;
const VENDOR_SECTION_RE = /^(.+?)\s*-\s*((?:Section|Sections|Near|Concourse|Stand|Club).+)$/i;
const SECTION_ONLY_RE = /^(?:Section|Sections|Stand|Concourse)\s+/i;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isMlsNwslAnchor(line: string): boolean {
  return /\((MLS|NWSL)\)/i.test(line) && line.includes(":");
}

function normalizeTeamName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  const fixes: Record<string, string> = {
    "Atlanta FC": "Atlanta United FC",
    "Boston Legacy FL": "Boston Legacy FC",
    "D.C United": "D.C. United",
    "Los Ángeles FC": "LAFC",
    "Los Angeles FC": "LAFC",
    "CF Montreal": "CF Montréal",
    "St, Louis City SC": "St. Louis City SC",
    "NJ/NY Gotham FC": "NJ/NY Gotham FC",
    "Chicago Stars FC": "Chicago Stars FC"
  };
  return fixes[name] ?? name;
}

export function parseMlsNwslAnchorLine(line: string): MlsNwslVenueBlock | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;

  const teamsPart = line.slice(0, colon).trim();
  let venuesPart = line.slice(colon + 1).trim();

  const teamOnly =
    /already imported/i.test(venuesPart) ||
    /just need to add/i.test(venuesPart) ||
    /both are already built/i.test(venuesPart);

  const reviewNotes = teamOnly ? venuesPart : undefined;

  venuesPart = venuesPart
    .replace(/\s*\(.*already imported.*\)\s*/gi, "")
    .replace(/\s*\(.*just need.*\)\s*/gi, "")
    .replace(/\s*\(.*both are already.*\)\s*/gi, "")
    .replace(/\.\./g, " ")
    .trim();

  const teams: Array<{ name: string; league: string }> = [];
  for (const chunk of teamsPart.split(/\s*&\s*/)) {
    const m = /(.+?)\s*\((MLS|NWSL)\)\s*$/i.exec(chunk.trim());
    if (m) {
      teams.push({
        name: normalizeTeamName(m[1]!),
        league: m[2]!.toUpperCase()
      });
    }
  }

  const venueNames: string[] = [];
  const venueParts = venuesPart
    .replace(/\s*\([^)]*(?:already imported|already in the system|just need|same as)[^)]*\)\s*/gi, "")
    .split(/\s*&\s*/);

  for (const part of venueParts) {
    const trimmed = part
      .replace(/\.\./g, ".")
      .split(/\.\s*(?:both|just|already)|\bboth are already\b/i)[0]!
      .trim();
    const cleaned = normalizeMlsNwslVenueName(trimmed);
    if (cleaned && !/^both are/i.test(cleaned) && looksLikeMlsNwslVenueName(cleaned)) {
      venueNames.push(cleaned);
    }
  }

  const inferVenueFromIntro = venueNames.length === 0 && !teamOnly;

  const venueSlugs = venueNames.map((name) => resolveMlsNwslVenueSlug(name));

  if (teams.length === 0) {
    return null;
  }

  return {
    teams,
    venueNames,
    venueSlugs,
    teamOnly,
    reviewNotes,
    inferVenueFromIntro
  };
}

function inferVenueNameFromIntroParagraphs(paragraphs: string[], start: number): string | null {
  const window = paragraphs.slice(start + 1, start + 6);
  for (const line of window) {
    const into = /(?:into|at)\s+([A-Z0-9][^.!?\n]{2,60}?(?:Stadium|Field|Park|Arena|Place|Centre|Center|Bowl|Garden|Grounds|CITYPARK))/i.exec(
      line
    );
    if (into?.[1]) {
      return normalizeMlsNwslVenueName(into[1].trim());
    }
  }
  return null;
}

function splitVenueTargets(block: MlsNwslVenueBlock): Array<{
  venueName: string;
  venueSlug: string;
  team: { name: string; league: string };
  meta: MlsNwslVenueMeta;
}> {
  const targets: Array<{
    venueName: string;
    venueSlug: string;
    team: { name: string; league: string };
    meta: MlsNwslVenueMeta;
  }> = [];

  if (block.venueSlugs.length === 0) {
    return targets;
  }

  if (block.venueSlugs.length === 1) {
    const slug = block.venueSlugs[0]!;
    const name = block.venueNames[0] ?? venueMetaForSlug(slug, slug).name;
    const meta = venueMetaForSlug(slug, name);
    for (const team of block.teams) {
      targets.push({ venueName: meta.name, venueSlug: slug, team, meta });
    }
    return targets;
  }

  // NYCFC: same team, multiple venues
  for (let i = 0; i < block.venueSlugs.length; i++) {
    const slug = block.venueSlugs[i]!;
    const name = block.venueNames[i] ?? venueMetaForSlug(slug, slug).name;
    const meta = venueMetaForSlug(slug, name);
    for (const team of block.teams) {
      targets.push({ venueName: meta.name, venueSlug: slug, team, meta });
    }
  }

  return targets;
}

function shouldSkipLine(line: string): boolean {
  if (PRICE_MENU_RE.test(line)) return true;
  if (SKIP_PREFIXES.some((p) => line.startsWith(p))) return true;
  if (/^Pro-Tip/i.test(line)) return true;
  if (/^🌭|^🥟|^🍨|^👑|^⚡/.test(line)) return true;
  if (line.length < 4) return true;
  if (/^MLS Stadiums$/i.test(line)) return true;
  return false;
}

function categoryFromHeader(line: string): string | null {
  const lower = line.toLowerCase();
  if (/headliner|showstopper|cowboy hat|community first|burgundy bites|\$4\.99|\$5\b/.test(lower)) {
    return "Headline Item";
  }
  if (/local|michelin|icon|chef|james beard|h-town|district staple/.test(lower)) {
    return "Local Partner";
  }
  if (/bar|lounge|club|sip|pour|cantina|margarita|brewery|social/.test(lower) && line.length < 90) {
    return "Drinks/Social";
  }
  if (/vegan|plant|value|budget|dietary|gluten|clean eating/.test(lower)) {
    return "Dietary/Value";
  }
  return null;
}

function isCategoryHeader(line: string): boolean {
  if (ITEM_LINE_RE.test(line) || PRICED_ITEM_RE.test(line)) return false;
  return Boolean(categoryFromHeader(line)) || (line.length < 72 && !line.includes("Section"));
}

function conciseDescription(raw: string): string {
  const one = raw.replace(/\s+/g, " ").trim();
  if (one.length <= MAX_DESCRIPTION) return one;
  const cut = one.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function parseLocation(locationRaw: string): {
  vendorHint: string;
  section: string;
  standName: string;
} {
  const location = locationRaw.trim();
  const vendorSection = VENDOR_SECTION_RE.exec(location);
  if (vendorSection) {
    return {
      vendorHint: vendorSection[1]!.trim(),
      section: vendorSection[2]!.trim(),
      standName: ""
    };
  }
  if (SECTION_ONLY_RE.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  if (/^(multiple sections|various|concourse|club level|upper level)/i.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  return { vendorHint: "", section: location || "Concourse", standName: "" };
}

function looksLikeVendorName(name: string): boolean {
  return /(?:grill|bar|lounge|stand|cantina|taco|bbq|kitchen|market|brew|cart|tavern|pub|club|salsa|pizza|burger|cantina|field|haus|pit)/i.test(
    name
  );
}

function buildRow(
  target: {
    venueName: string;
    venueSlug: string;
    team: { name: string; league: string };
    meta: MlsNwslVenueMeta;
  },
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  reviewFlags: string[]
): MlsNwslDocxParseRow {
  return {
    league: target.team.league,
    team: target.team.name,
    venue: target.venueName,
    venue_slug: target.venueSlug,
    city: target.meta.city,
    state: target.meta.state,
    vendor: vendor || itemName,
    stand_name: standName,
    section,
    item_name: itemName,
    description: conciseDescription(description),
    category: category ?? "",
    season: DEFAULT_SEASON,
    reviewFlags,
    teams: [{ name: target.team.name, league: target.team.league }]
  };
}

type VendorContext = { vendor: string; section: string; standName: string };

export function parseMlsNwslDocxParagraphs(paragraphs: string[]): MlsNwslDocxParseResult {
  const anchors: { index: number; block: MlsNwslVenueBlock }[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const line = paragraphs[i]!;
    if (isMlsNwslAnchor(line)) {
      const block = parseMlsNwslAnchorLine(line);
      if (block) {
        anchors.push({ index: i, block });
      }
    }
  }

  const rows: MlsNwslDocxParseRow[] = [];
  const skippedLines: string[] = [];

  for (let a = 0; a < anchors.length; a++) {
    let { block } = anchors[a]!;
    const anchorIndex = anchors[a]!.index;

    if (block.inferVenueFromIntro || block.venueSlugs.length === 0) {
      const inferred = inferVenueNameFromIntroParagraphs(paragraphs, anchorIndex);
      if (inferred) {
        block = {
          ...block,
          venueNames: [inferred],
          venueSlugs: [resolveMlsNwslVenueSlug(inferred)],
          inferVenueFromIntro: false
        };
      }
    }

    const end = anchors[a + 1]?.index ?? paragraphs.length;
    const targets = splitVenueTargets(block);

    if (targets.length === 0) {
      skippedLines.push(`No venue resolved: ${paragraphs[anchors[a]!.index]}`);
      continue;
    }

    if (block.teamOnly) {
      continue;
    }

    let category: string | null = null;
    let vendorCtx: VendorContext | null = null;

    for (let i = anchors[a]!.index + 1; i < end; i++) {
      const line = paragraphs[i]!;
      if (shouldSkipLine(line)) continue;

      const headerCategory = categoryFromHeader(line);
      if (headerCategory || isCategoryHeader(line)) {
        category = headerCategory ?? category;
        vendorCtx = null;
        continue;
      }

      const priced = PRICED_ITEM_RE.exec(line);
      const standard = priced ? null : ITEM_LINE_RE.exec(line);
      const itemMatch = priced ?? standard;

      if (itemMatch) {
        const itemName = itemMatch[1]!.trim();
        const locationRaw = priced ? priced[2]! : itemMatch[2]!;
        const description = itemMatch[3]!.trim();
        const { vendorHint, section, standName } = parseLocation(locationRaw);
        const flags: string[] = [];

        let vendor = vendorHint;
        if (!vendor && looksLikeVendorName(itemName)) {
          vendor = itemName;
        }
        if (!vendor) vendor = itemName;

        const resolvedSection = section || vendorCtx?.section || "Concourse";
        if (!section && !vendorHint) flags.push("missing-section");

        if (looksLikeVendorName(itemName) && !vendorHint && description.length > 30) {
          vendorCtx = { vendor: itemName, section: resolvedSection, standName };
          for (const target of targets) {
            rows.push(
              buildRow(
                target,
                category,
                itemName,
                vendor,
                resolvedSection,
                standName,
                description,
                flags
              )
            );
          }
          continue;
        }

        vendorCtx = { vendor, section: resolvedSection, standName };
        for (const target of targets) {
          rows.push(
            buildRow(
              target,
              category,
              itemName,
              vendor,
              resolvedSection,
              standName,
              description,
              flags
            )
          );
        }
        continue;
      }

      const subMatch = SUB_ITEM_RE.exec(line);
      if (subMatch && vendorCtx) {
        const itemName = subMatch[1]!.trim();
        const description = subMatch[2]!.trim();
        if (itemName.length > 80 || /^The /i.test(itemName) && description.length > 120) {
          continue;
        }
        for (const target of targets) {
          rows.push(
            buildRow(
              target,
              category,
              itemName,
              vendorCtx.vendor,
              vendorCtx.section,
              vendorCtx.standName,
              description,
              ["sub-line"]
            )
          );
        }
      }
    }
  }

  const reviewRows = rows.filter((r) => r.reviewFlags.length > 0);

  return {
    rows,
    venueBlocks: anchors.map((a) => a.block),
    reviewRows,
    skippedLines
  };
}

export function parseMlsNwslDocx(docxPath: string): MlsNwslDocxParseResult {
  const paragraphs = extractDocxParagraphs(docxPath);
  return parseMlsNwslDocxParagraphs(paragraphs);
}

export function rowsToCsv(rows: LeagueImportRow[]): string {
  const headers = [
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
    "category",
    "season",
    "venue_slug"
  ];
  const escape = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    const extended = row as LeagueImportRow & { venue_slug?: string };
    lines.push(
      headers
        .map((h) => {
          const val =
            h === "venue_slug"
              ? (extended.venue_slug ?? "")
              : String((row as Record<string, unknown>)[h] ?? "");
          return escape(val);
        })
        .join(",")
    );
  }
  return lines.join("\n");
}
