/**
 * Parse narrative NFL stadium vendor DOCX into flat league-import CSV rows.
 * Does not touch the database — output only.
 *
 * TODO: season awards (ballot / verified-fan voting)
 * TODO: all-time awards hall-of-fame
 * TODO: vendor award badges when concessionaire-level stats exist
 */

import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  LEAGUE_IMPORT_CSV_COLUMNS,
  type LeagueImportCsvColumn,
  type LeagueImportRow
} from "./league-import-shape";

export type NflDocxParseRow = LeagueImportRow & {
  reviewFlags: string[];
};

export type NflDocxParseResult = {
  rows: NflDocxParseRow[];
  venues: string[];
  reviewRows: NflDocxParseRow[];
  ambiguousVenues: string[];
  ambiguousItems: string[];
};

const LEAGUE = "NFL";
const DEFAULT_SEASON = "2026";
const MAX_DESCRIPTION = 220;

const VENUE_ANCHOR_RE =
  /^(?:U\.S\. Bank Stadium|State Farm Stadium|Mercedes-Benz Stadium|M&T Bank Stadium|The opening of the New Highmark Stadium|Bank of America Stadium|Soldier Field|Paycor Stadium|Huntington Bank Field|AT&T Stadium|Empower Field at Mile High|Ford Field|Lambeau Field|NRG Stadium|Lucas Oil Stadium|EverBank Stadium|GEHA Field at Arrowhead Stadium|Allegiant Stadium|SoFi Stadium|Hard Rock Stadium|Gillette Stadium|Caesars Superdome|MetLife Stadium|Lincoln Financial Field|Acrisure Stadium|Levi['\u2019]s Stadium|Lumen Field|Raymond James Stadium|Northwest Stadium|The New Nissan Stadium)/;

const SKIP_PREFIXES = [
  "Would you",
  "Which ",
  "Where ",
  "Pro-Tip",
  "As a host",
  "The result is",
  "The stadium has brought",
  "The stadium has",
  "The goal for",
  "Stadium Club:",
  "Walk-Thru Bru (Multiple",
  "Homefield Pub",
  "Wynn Field Club (North",
  "Bar 76 (East",
  "The West Stadium Club",
  "Local Craft Hubs:",
  "Local Craft Brews:",
  "Value Beers:",
  '"Fan First" Staples:',
  "Draft Portables:",
  "5th Quarter Deck:",
  "The Tech:",
  "Reverse ATMs:",
  '"Bucs Drop"',
  "The 2026 season marks"
];

/** Known venue → team / city / state when obvious from public NFL mapping. */
const VENUE_META: Record<
  string,
  { team: string; city: string; state: string }
> = {
  "U.S. Bank Stadium": {
    team: "Minnesota Vikings",
    city: "Minneapolis",
    state: "MN"
  },
  "State Farm Stadium": {
    team: "Arizona Cardinals",
    city: "Glendale",
    state: "AZ"
  },
  "Mercedes-Benz Stadium": {
    team: "Atlanta Falcons",
    city: "Atlanta",
    state: "GA"
  },
  "M&T Bank Stadium": {
    team: "Baltimore Ravens",
    city: "Baltimore",
    state: "MD"
  },
  "Highmark Stadium": {
    team: "Buffalo Bills",
    city: "Orchard Park",
    state: "NY"
  },
  "Bank of America Stadium": {
    team: "Carolina Panthers",
    city: "Charlotte",
    state: "NC"
  },
  "Soldier Field": {
    team: "Chicago Bears",
    city: "Chicago",
    state: "IL"
  },
  "Paycor Stadium": {
    team: "Cincinnati Bengals",
    city: "Cincinnati",
    state: "OH"
  },
  "Huntington Bank Field": {
    team: "Cleveland Browns",
    city: "Cleveland",
    state: "OH"
  },
  "AT&T Stadium": {
    team: "Dallas Cowboys",
    city: "Arlington",
    state: "TX"
  },
  "Empower Field at Mile High": {
    team: "Denver Broncos",
    city: "Denver",
    state: "CO"
  },
  "Ford Field": {
    team: "Detroit Lions",
    city: "Detroit",
    state: "MI"
  },
  "Lambeau Field": {
    team: "Green Bay Packers",
    city: "Green Bay",
    state: "WI"
  },
  "NRG Stadium": {
    team: "Houston Texans",
    city: "Houston",
    state: "TX"
  },
  "Lucas Oil Stadium": {
    team: "Indianapolis Colts",
    city: "Indianapolis",
    state: "IN"
  },
  "EverBank Stadium": {
    team: "Jacksonville Jaguars",
    city: "Jacksonville",
    state: "FL"
  },
  "GEHA Field at Arrowhead Stadium": {
    team: "Kansas City Chiefs",
    city: "Kansas City",
    state: "MO"
  },
  "Allegiant Stadium": {
    team: "Las Vegas Raiders",
    city: "Las Vegas",
    state: "NV"
  },
  "SoFi Stadium": {
    team: "Los Angeles Rams",
    city: "Inglewood",
    state: "CA"
  },
  "Hard Rock Stadium": {
    team: "Miami Dolphins",
    city: "Miami Gardens",
    state: "FL"
  },
  "Gillette Stadium": {
    team: "New England Patriots",
    city: "Foxborough",
    state: "MA"
  },
  "Caesars Superdome": {
    team: "New Orleans Saints",
    city: "New Orleans",
    state: "LA"
  },
  "MetLife Stadium": {
    team: "New York Giants",
    city: "East Rutherford",
    state: "NJ"
  },
  "Lincoln Financial Field": {
    team: "Philadelphia Eagles",
    city: "Philadelphia",
    state: "PA"
  },
  "Acrisure Stadium": {
    team: "Pittsburgh Steelers",
    city: "Pittsburgh",
    state: "PA"
  },
  "Levi's Stadium": {
    team: "San Francisco 49ers",
    city: "Santa Clara",
    state: "CA"
  },
  "Lumen Field": {
    team: "Seattle Seahawks",
    city: "Seattle",
    state: "WA"
  },
  "Raymond James Stadium": {
    team: "Tampa Bay Buccaneers",
    city: "Tampa",
    state: "FL"
  },
  "Northwest Stadium": {
    team: "Washington Commanders",
    city: "Landover",
    state: "MD"
  },
  "Nissan Stadium": {
    team: "Tennessee Titans",
    city: "Nashville",
    state: "TN"
  }
};

const ITEM_LINE_RE = /^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/;
const SUB_ITEM_RE = /^([^:]{2,80}):\s*(.+)$/;
const PRICE_MENU_RE = /^\$\d+(?:\.\d{2})?:\s/;
const VENDOR_SECTION_RE = /^(.+?)\s*-\s*((?:Section|Sections)\s+.+)$/i;
const SECTION_ONLY_RE = /^(?:Section|Sections)\s+/i;

export function extractDocxParagraphs(docxPath: string): string[] {
  const dir = mkdtempSync(join(tmpdir(), "nfl-docx-"));
  try {
    execSync(`unzip -q -o ${JSON.stringify(docxPath)} -d ${JSON.stringify(dir)}`, {
      stdio: "pipe"
    });
    const xml = readFileSync(join(dir, "word/document.xml"), "utf8");
    return parseWordXmlParagraphs(xml);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseWordXmlParagraphs(xml: string): string[] {
  const paras: string[] = [];
  const blocks = xml.split(/<w:p[\s>]/);
  for (const block of blocks.slice(1)) {
    const chunk = block.split(/<\/w:p>/)[0] ?? "";
    const texts: string[] = [];
    const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(chunk)) !== null) {
      texts.push(m[1] ?? "");
    }
    const line = decodeXmlEntities(texts.join(""))
      .replace(/\s+/g, " ")
      .trim();
    if (line) {
      paras.push(line);
    }
  }
  return paras;
}

function normalizeVenueName(intro: string): string {
  if (intro.startsWith("The opening of the New Highmark Stadium")) {
    return "Highmark Stadium";
  }
  if (intro.startsWith("The New Nissan Stadium")) {
    return "Nissan Stadium";
  }
  if (/^Levi['\u2019]s Stadium/.test(intro)) {
    return "Levi's Stadium";
  }
  const m = intro.match(VENUE_ANCHOR_RE);
  if (!m) {
    return intro.split(/[,—]/)[0]?.trim() ?? intro.slice(0, 60);
  }
  let name = m[0];
  if (name.startsWith("The opening of the New ")) {
    name = name.replace("The opening of the New ", "");
  }
  if (name.startsWith("Huntington Bank Field")) {
    return "Huntington Bank Field";
  }
  if (name.includes("formerly")) {
    name = name.split("(")[0]?.trim() ?? name;
  }
  return name.trim();
}

function isVenueAnchor(paragraph: string): boolean {
  if (paragraph.length < 70) {
    return false;
  }
  if (!VENUE_ANCHOR_RE.test(paragraph)) {
    return false;
  }
  if (SKIP_PREFIXES.some((p) => paragraph.startsWith(p))) {
    return false;
  }
  if (paragraph.startsWith("Lumen Field")) {
    return (
      paragraph.includes("undergone") ||
      paragraph.includes("Fanovation") ||
      paragraph.includes("massive")
    );
  }
  return true;
}

function categoryFromHeader(line: string): string | null {
  const lower = line.toLowerCase();
  if (/^new for 2026/.test(lower) || /headline|showstopper|evolution/.test(lower)) {
    return "Headline Item";
  }
  if (/local legend|chef partner|signature partner|chef series/.test(lower)) {
    return "Local Partner";
  }
  if (
    /^bars\b/.test(lower) ||
    (/drinks/.test(lower) && /social|bar|lounge|club/.test(lower)) ||
    /^social spaces/.test(lower) ||
    /vegas scene/.test(lower)
  ) {
    return "Drinks/Social";
  }
  if (
    /^dietary/.test(lower) ||
    /healthy option/.test(lower) ||
    /^value\b/.test(lower) ||
    /dietary &/.test(lower)
  ) {
    return "Dietary/Value";
  }
  return null;
}

function isCategoryHeader(line: string): boolean {
  if (ITEM_LINE_RE.test(line)) {
    return false;
  }
  const cat = categoryFromHeader(line);
  if (cat) {
    return true;
  }
  if (
    /^(signature|official |player |the \d{4}|"fan first"|mercedes|burnt ends breakfast)/i.test(
      line
    ) &&
    line.length < 100 &&
    !line.includes("Section")
  ) {
    return true;
  }
  return false;
}

function shouldSkipLine(line: string): boolean {
  if (PRICE_MENU_RE.test(line)) {
    return true;
  }
  if (SKIP_PREFIXES.some((p) => line.startsWith(p))) {
    return true;
  }
  if (/^(Would you|Which |Where )/.test(line)) {
    return true;
  }
  if (/^Pro-Tip/i.test(line)) {
    return true;
  }
  if (line.length < 4) {
    return true;
  }
  return false;
}

function conciseDescription(raw: string): string {
  const one = raw.replace(/\s+/g, " ").trim();
  if (one.length <= MAX_DESCRIPTION) {
    return one;
  }
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
  if (/^(multiple sections|various sections|various locations)/i.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  return { vendorHint: "", section: location, standName: "" };
}

function inferVenueMeta(
  venue: string,
  intro: string
): { team: string; city: string; state: string } {
  const known = VENUE_META[venue];
  if (known) {
    return known;
  }
  const team = "";
  let city = "";
  let state = "";
  const cityMatch = intro.match(
    /\b(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2})\b/
  );
  if (cityMatch) {
    city = cityMatch[1] ?? "";
    state = cityMatch[2] ?? "";
  } else {
    const inCity = intro.match(/\b(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
    if (inCity) {
      city = inCity[1] ?? "";
    }
  }
  return { team, city, state };
}

function seasonForBlock(intro: string, category: string | null): string {
  if (/2026/.test(intro) || category === "Headline Item") {
    return DEFAULT_SEASON;
  }
  return "";
}

type VendorContext = {
  vendor: string;
  section: string;
  standName: string;
};

function looksLikeVendorName(name: string): boolean {
  return /(?:canteen|grill|bar|lounge|stand|cantina|eatery|deli|shop|kitchen|pit|bbq|pizza|tavern|pub|club|market|café|cafe|co\.|company|inc\.)/i.test(
    name
  );
}

function buildRow(
  venue: string,
  meta: { team: string; city: string; state: string },
  season: string,
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  reviewFlags: string[]
): NflDocxParseRow {
  return {
    league: LEAGUE,
    team: meta.team,
    venue,
    city: meta.city,
    state: meta.state,
    vendor: vendor || itemName,
    stand_name: standName,
    section,
    item_name: itemName,
    description: conciseDescription(description),
    price: undefined,
    category: category ?? "",
    source_url: "",
    season,
    reviewFlags
  };
}

export function parseNflStadiumDocxParagraphs(paragraphs: string[]): NflDocxParseResult {
  const anchors: { index: number; intro: string; venue: string }[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]!;
    if (isVenueAnchor(p)) {
      anchors.push({ index: i, intro: p, venue: normalizeVenueName(p) });
    }
  }

  const rows: NflDocxParseRow[] = [];
  const ambiguousVenues = new Set<string>();
  const ambiguousItems: string[] = [];

  for (let a = 0; a < anchors.length; a++) {
    const { venue, intro } = anchors[a]!;
    const end = anchors[a + 1]?.index ?? paragraphs.length;
    const meta = inferVenueMeta(venue, intro);
    if (!meta.team && !VENUE_META[venue]) {
      ambiguousVenues.add(venue);
    }

    let category: string | null = null;
    let vendorCtx: VendorContext | null = null;
  const blockSeason = /2026/.test(intro) ? DEFAULT_SEASON : "";

    for (let i = anchors[a]!.index + 1; i < end; i++) {
      const line = paragraphs[i]!;
      if (shouldSkipLine(line)) {
        continue;
      }

      const headerCategory = categoryFromHeader(line);
      if (headerCategory || isCategoryHeader(line)) {
        category = headerCategory ?? category;
        vendorCtx = null;
        continue;
      }

      const itemMatch = ITEM_LINE_RE.exec(line);
      if (itemMatch) {
        const itemName = itemMatch[1]!.trim();
        const { vendorHint, section, standName } = parseLocation(itemMatch[2]!);
        const description = itemMatch[3]!.trim();
        const flags: string[] = [];

        let vendor = vendorHint;
        if (!vendorHint) {
          vendorCtx = null;
        }
        if (!vendor && looksLikeVendorName(itemName)) {
          vendor = itemName;
        }
        if (!vendor) {
          vendor = itemName;
        }

        const resolvedSection: string = section || vendorCtx?.section || "";
        if (!resolvedSection) {
          flags.push("missing-section");
        } else if (!vendorHint && vendor !== itemName) {
          flags.push("inherited-context");
        }

        if (looksLikeVendorName(itemName) && !vendorHint) {
          vendorCtx = { vendor: itemName, section: resolvedSection, standName };
          if (description.length > 30) {
            rows.push(
              buildRow(
                venue,
                meta,
                seasonForBlock(intro, category) || blockSeason,
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
        rows.push(
          buildRow(
            venue,
            meta,
            seasonForBlock(intro, category) || blockSeason,
            category,
            itemName,
            vendor,
            resolvedSection,
            standName,
            description,
            flags
          )
        );
        continue;
      }

      const subMatch = SUB_ITEM_RE.exec(line);
      if (subMatch && vendorCtx) {
        const subName = subMatch[1]!.trim();
        if (
          isCategoryHeader(subName) ||
          shouldSkipLine(subName) ||
          isCategoryHeader(line)
        ) {
          continue;
        }
        if (looksLikeVendorName(subName) && subMatch[2]!.length > 40) {
          vendorCtx = {
            vendor: subName,
            section: vendorCtx.section,
            standName: vendorCtx.standName
          };
          continue;
        }
        rows.push(
          buildRow(
            venue,
            meta,
            seasonForBlock(intro, category) || blockSeason,
            category,
            subName,
            vendorCtx.vendor,
            vendorCtx.section,
            vendorCtx.standName,
            subMatch[2]!.trim(),
            []
          )
        );
        continue;
      }

      if (SUB_ITEM_RE.test(line) && !vendorCtx) {
        const subName = SUB_ITEM_RE.exec(line)?.[1]?.trim() ?? "";
        if (looksLikeVendorName(subName) && !isCategoryHeader(line)) {
          vendorCtx = { vendor: subName, section: "", standName: "" };
          continue;
        }
        ambiguousItems.push(`${venue}: ${line.slice(0, 80)}`);
      }
    }
  }

  const venues = [...new Set(rows.map((r) => r.venue))];
  const reviewRows = rows.filter((r) => r.reviewFlags.length > 0);

  return {
    rows,
    venues,
    reviewRows,
    ambiguousVenues: [...ambiguousVenues],
    ambiguousItems: ambiguousItems.slice(0, 40)
  };
}

export function parseNflStadiumDocx(docxPath: string): NflDocxParseResult {
  return parseNflStadiumDocxParagraphs(extractDocxParagraphs(docxPath));
}

export function leagueImportRowToCsvRecord(
  row: LeagueImportRow
): Record<LeagueImportCsvColumn, string> {
  return {
    league: row.league,
    team: row.team,
    venue: row.venue,
    city: row.city,
    state: row.state,
    vendor: row.vendor,
    stand_name: row.stand_name ?? "",
    section: row.section ?? "",
    item_name: row.item_name,
    description: row.description ?? "",
    price: row.price != null ? String(row.price) : "",
    category: row.category ?? "",
    source_url: row.source_url ?? "",
    season: row.season ?? ""
  };
}

export function rowsToCsv(rows: LeagueImportRow[]): string {
  const escape = (v: string) => {
    if (/[",\n\r]/.test(v)) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [LEAGUE_IMPORT_CSV_COLUMNS.join(",")];
  for (const row of rows) {
    const rec = leagueImportRowToCsvRecord(row);
    lines.push(LEAGUE_IMPORT_CSV_COLUMNS.map((col) => escape(rec[col])).join(","));
  }
  return `${lines.join("\n")}\n`;
}
