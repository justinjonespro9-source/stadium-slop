/**
 * Globe Life Field (Texas Rangers) menu parser.
 *
 * Programmatically parses the official 2026 Concessions List PDF.
 * The PDF uses dot-leader formatting: "Item Name . . . . . locations".
 * Each line with ≥3 consecutive dots is an item; non-dot follow-up lines
 * are either location continuations (start with digit/dot) or descriptions.
 *
 * Source: https://mktg.mlbstatic.com/rangers/documents/y2026/26_ConcessionsList.pdf
 * Re-run each season to pick up menu changes.
 */

import { PDFParse } from "pdf-parse";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "globe-life-field";
const VENUE_NAME = "Globe Life Field";
const SOURCE_URL =
  "https://mktg.mlbstatic.com/rangers/documents/y2026/26_ConcessionsList.pdf";

/* ── Section routing ──────────────────────────────────────────── */

const SECTION_HEADINGS = [
  "RESTAURANT PARTNERS",
  "NON-ALCOHOLIC BEVERAGES",
  "ALCOHOLIC BEVERAGES",
  "ENTREES",
  "HOT DOGS & SAUSAGES",
  "NACHOS",
  "SNACKS"
] as const;

type SectionName = (typeof SECTION_HEADINGS)[number];

const SKIP_SECTIONS = new Set<SectionName>([
  "NON-ALCOHOLIC BEVERAGES",
  "ALCOHOLIC BEVERAGES"
]);

/* ── Generic / skip filters ───────────────────────────────────── */

const SKIP_NAMES = new Set([
  "chips",
  "doritos/fritos top n go",
  "kettle corn",
  "peanuts",
  "popcorn boot",
  "candy",
  "cotton candy",
  "cracker jacks",
  "freeze-dried candy",
  "straw topper",
  "grub tub add on",
  "dollar hot dogs (wednesdays only)",
  "dollar ice cream novelties (sundays only)",
  "ice cream novelties",
  "ice cream scoops/pints",
  "cookies/pastries"
]);

/* ── Fare inference ───────────────────────────────────────────── */

function inferFare(name: string, section: SectionName): VenueMenuFare {
  const l = name.toLowerCase();
  if (
    /churro|sundae|ice cream|funnel cake|waffle bowl|cookie dough|float|vegan soft serve|shaved ice|sno blast|bahama buck/i.test(
      l
    )
  )
    return "Desserts";
  if (
    /fries|pretzel|nacho|elote|hummus|nuts|fruit cup|pickle|lobster roll|milkshake/i.test(
      l
    )
  )
    return "Snacks";
  if (section === "NACHOS") return "Snacks";
  if (section === "SNACKS" && !/sandwich|burger|roll|nugget|wing/i.test(l))
    return "Snacks";
  return "Meals";
}

/* ── Dietary tag inference ────────────────────────────────────── */

function inferDietaryTags(name: string): VenueMenuDietaryTag[] {
  const tags: VenueMenuDietaryTag[] = [];
  const l = name.toLowerCase();
  if (/gluten.free/i.test(l)) tags.push("Gluten Free");
  if (/\bvegan\b/i.test(l) || /\bimpossible\b/i.test(l)) tags.push("Vegan");
  if (/\bveggie\b/i.test(l) || /\bvegetable\b/i.test(l))
    tags.push("Vegetarian");
  return tags;
}

/* ── Name cleanup / typo correction ───────────────────────────── */

function cleanItemName(raw: string): string {
  let name = raw.trim();
  name = name.replace(/\bCaptan's\b/, "Captain's");
  name = name.replace(/\bSandwhich\b/i, "Sandwich");
  name = name.replace(/\bsandwich$/i, "Sandwich");
  name = name.replace(/^"New"\s*/i, "");
  name = name.replace(/\s*\(In-House\)\s*$/i, "");
  name = name.replace(/\s*-\s*Specialty Dog\s*$/i, "");
  name = name.replace(/\s*-\s*Available via.*$/i, "");
  name = name.replace(/\*+/g, "").trim();
  name = name.replace(/\/\s*/g, " / ");
  return name;
}

/* ── Line-level parsing ───────────────────────────────────────── */

const DOT_LEADER_RE = /^(.+?)(?:\s*\.){3,}\s*(.*)$/;

interface ParsedItem {
  name: string;
  locationHint: string;
  description: string;
  section: SectionName;
}

function isLocationContinuation(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith(".")) return true;
  if (/^\d/.test(t)) return true;
  if (/^All\b/i.test(t)) return true;
  if (/^[Pp]\d/.test(t)) return true;
  if (/^CL\d/i.test(t)) return true;
  return false;
}

function parseSectionLines(
  lines: string[],
  section: SectionName
): ParsedItem[] {
  const items: ParsedItem[] = [];
  let current: ParsedItem | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "2026 CONCESSIONS LIST") continue;

    const dotMatch = trimmed.match(DOT_LEADER_RE);
    if (dotMatch) {
      if (current) items.push(current);
      current = {
        name: dotMatch[1].trim(),
        locationHint: dotMatch[2].replace(/^[\s.]+|[\s.]+$/g, "").trim(),
        description: "",
        section
      };
      continue;
    }

    if (current) {
      if (isLocationContinuation(trimmed)) {
        const locPart = trimmed.replace(/^[\s.]+/, "").trim();
        if (locPart) {
          current.locationHint = current.locationHint
            ? current.locationHint + ", " + locPart
            : locPart;
        }
      } else if (!current.description) {
        current.description = trimmed;
      }
    }
  }

  if (current) items.push(current);
  return items;
}

/* ── Vendor attribution ───────────────────────────────────────── */

function extractVendor(item: ParsedItem): string | undefined {
  if (item.section === "RESTAURANT PARTNERS") return item.name;
  const l = item.name.toLowerCase();
  if (l.startsWith("hurtado")) return "Hurtado Barbeque";
  if (l.startsWith("golden chick")) return "Golden Chick";
  return undefined;
}

/* ── Main parser ──────────────────────────────────────────────── */

export async function parseGlobeLifeFieldMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl || SOURCE_URL;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `Failed to fetch Globe Life Field PDF: ${response.status}`
    );
  const buffer = Buffer.from(await response.arrayBuffer());

  const pdfParser = new PDFParse({ data: buffer });
  const result = await pdfParser.getText({ pageJoiner: "\n" });
  const text = result.text;

  const sectionMap = new Map<SectionName, string[]>();
  let currentSection: SectionName | null = null;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (
      (SECTION_HEADINGS as readonly string[]).includes(trimmed)
    ) {
      currentSection = trimmed as SectionName;
      sectionMap.set(currentSection, []);
      continue;
    }
    if (currentSection && sectionMap.has(currentSection)) {
      sectionMap.get(currentSection)!.push(line);
    }
  }

  const seen = new Map<string, VenueMenuSourceItem>();
  let skippedDrinks = 0;

  for (const [sectionName, sectionLines] of sectionMap) {
    if (SKIP_SECTIONS.has(sectionName)) {
      skippedDrinks += sectionLines.filter((l) =>
        DOT_LEADER_RE.test(l.trim())
      ).length;
      continue;
    }

    const parsed = parseSectionLines(sectionLines, sectionName);

    for (const item of parsed) {
      const cleanName = cleanItemName(item.name);
      if (cleanName.length < 3) continue;
      const normKey = cleanName.toLowerCase().replace(/\s*\/\s*/g, "/");
      if (SKIP_NAMES.has(normKey)) continue;

      const key = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (seen.has(key)) {
        const existing = seen.get(key)!;
        if (
          item.locationHint &&
          existing.vendorLocationHint &&
          !existing.vendorLocationHint.includes(item.locationHint)
        ) {
          existing.vendorLocationHint += "; " + item.locationHint;
        }
        if (item.description && !existing.description) {
          existing.description = item.description;
        }
        continue;
      }

      seen.set(key, {
        name: cleanName,
        description: item.description || undefined,
        fare: inferFare(cleanName, sectionName),
        category: "Food",
        vendorName: extractVendor(item),
        vendorLocationHint: item.locationHint || undefined,
        dietaryTags: inferDietaryTags(cleanName),
        sourceUrl: url
      });
    }
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items: Array.from(seen.values()),
    skippedDrinks
  };
}
