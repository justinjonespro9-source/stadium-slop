/**
 * Shared helpers for narrative league DOCX → flat import CSV parsers.
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

export const MAX_IMPORT_DESCRIPTION = 220;

export const ITEM_LINE_RE = /^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/;
export const SUB_ITEM_RE = /^([^:]{2,80}):\s*(.+)$/;
export const PRICE_MENU_RE = /^\$\d+(?:\.\d{2})?:\s/;

export const VENDOR_SECTION_RE = /^(.+?)\s*-\s*((?:Section|Sections|Gate|Level|Portal|Balcony|Loge|Suite|Club|Concourse)\s*.+)$/i;
export const SECTION_ONLY_RE = /^(?:Section|Sections|Gate|Level|Portal|Balcony|Loge|Suite|Club|Concourse)\s+/i;

export function extractDocxParagraphs(docxPath: string): string[] {
  const dir = mkdtempSync(join(tmpdir(), "league-docx-"));
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

export function conciseDescription(raw: string): string {
  const one = raw.replace(/\s+/g, " ").trim();
  if (one.length <= MAX_IMPORT_DESCRIPTION) {
    return one;
  }
  const cut = one.slice(0, MAX_IMPORT_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function parseLocation(locationRaw: string): {
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
  if (/^(multiple sections|various sections|various locations|multiple locations)/i.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  if (/^(gate|level|portal|loge|suite|club|concourse|balcony|section)\b/i.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  return { vendorHint: "", section: location, standName: "" };
}

export function looksLikeVendorName(name: string): boolean {
  return /(?:canteen|grill|bar|lounge|stand|cantina|eatery|deli|shop|kitchen|pit|bbq|pizza|tavern|pub|club|market|café|cafe|co\.|company|inc\.|bakery|pizzeria)/i.test(
    name
  );
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
