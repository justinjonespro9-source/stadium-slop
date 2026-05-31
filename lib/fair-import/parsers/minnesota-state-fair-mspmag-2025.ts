/**
 * Minnesota State Fair — MSP Mag 2025 bonus/reviewed foods (factual fields only).
 * Source: https://mspmag.com/eat-and-drink/foodie/new-minnesota-state-fair-food-reviews-2025/
 *
 * Does not import review commentary, GET IT / SKIP IT labels, or quoted opinions.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import { shouldSkipFairRawItem } from "../filter";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";
import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";
import type { VenueMenuDietaryTag } from "@/lib/venue-menu-import/types";

import { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";
import { parseMinnesotaStateFairCoreCatalog } from "./minnesota-state-fair-core-catalog";

const MSPMAG_SOURCE_URL =
  "https://mspmag.com/eat-and-drink/foodie/new-minnesota-state-fair-food-reviews-2025/";
const VENUE_SLUG = "minnesota-state-fair";
const VENUE_NAME = "Minnesota State Fair";

const EDITORIAL_LINE_RE = /^(SM|JVH)\b/i;
const EDITORIAL_PARAGRAPH_RE = /^(SM|JVH)\b.*\b(GET IT|SKIP IT|YOUR CALL)\b/i;
const ITEM_AT_RE = /\s+At\s+/i;
const ITEM_LOCATED_RE = /,\s*located\s+/i;

const GENERIC_BEVERAGE_NAME_RE =
  /^(starbucks nitro cold brew|iced coffee|pepsi|coke|lemonade|iced tea|water|soda)$/i;

const SPECIALTY_BEVERAGE_RE =
  /(soft serve.*beer|bloody mary|berliner|mocktail|affogato|orange whip|cold brew|malt|sundae|shake-up|iced tea.*pickle)/i;

const ALCOHOL_SIGNAL_RE =
  /\b(beer|wine|weisse|bloody mary|margarita|mule|rita|liqueur|cocktail)\b/i;
const NON_ALCOHOL_SIGNAL_RE = /\b(mocktail|non[- ]?alcoholic|virgin|zero[- ]?proof)\b/i;

const SKIP_WHOLE_LINE_RE = [
  /^beans & beignets:/i,
  /^mn state fair food map/i,
  /^reviewing all the new minnesota/i
];

type ParsedTail = {
  vendor: string;
  location: string;
  price?: number;
  priceNote?: string;
};

type MspMagStats = {
  articleLines: number;
  editorialLinesIgnored: number;
  itemBlocksParsed: number;
  candidatesBeforeDedupe: number;
};

function decodeHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "\n");
}

function normalizeFairVendorName(vendor: string): string {
  return normalizeMenuItemName(
    vendor
      .replace(/^the\s+/i, "")
      .replace(/\s+booth$/i, "")
      .replace(/['']/g, "'")
      .trim()
  );
}

function fairCatalogDedupeKey(vendor: string, name: string): string {
  return `${normalizeFairVendorName(vendor)}::${normalizeMenuItemName(name)}`;
}

function vendorsLikelyMatch(a: string, b: string): boolean {
  const na = normalizeFairVendorName(a);
  const nb = normalizeFairVendorName(b);
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function isDuplicateOfCatalog(
  vendor: string,
  name: string,
  catalogKeys: Set<string>,
  catalogEntries: { vendor: string; name: string }[]
): boolean {
  const key = fairCatalogDedupeKey(vendor, name);
  if (catalogKeys.has(key)) return true;

  const normName = normalizeMenuItemName(name);
  return catalogEntries.some(
    (entry) =>
      normalizeMenuItemName(entry.name) === normName &&
      vendorsLikelyMatch(entry.vendor, vendor)
  );
}

async function loadMinnesotaCatalogKeys(): Promise<{
  keys: Set<string>;
  entries: { vendor: string; name: string }[];
}> {
  const entries: { vendor: string; name: string }[] = MINNESOTA_2025_PREVIEW_ITEMS.map(
    (item) => ({ vendor: item.vendor, name: item.name })
  );

  try {
    const core = await parseMinnesotaStateFairCoreCatalog();
    for (const item of core.items) {
      if (item.vendorName) {
        entries.push({ vendor: item.vendorName, name: item.name });
      }
    }
  } catch {
    // Core catalog fetch optional for dedupe when offline.
  }

  const keys = new Set(entries.map((e) => fairCatalogDedupeKey(e.vendor, e.name)));
  return { keys, entries };
}

function parseDietaryTags(text: string): VenueMenuDietaryTag[] {
  const tags: VenueMenuDietaryTag[] = [];
  const matches = [...text.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  for (const block of matches) {
    const lower = block.toLowerCase();
    if (lower.includes("vegan")) tags.push("Vegan");
    if (lower.includes("vegetarian")) tags.push("Vegetarian");
    if (lower.includes("gluten free") || lower.includes("gluten-free")) {
      tags.push("Gluten Free");
    }
  }
  return [...new Set(tags)];
}

function stripDietaryAnnotations(text: string): string {
  return text.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function parsePrice(text?: string): { price?: number; priceNote?: string } {
  if (!text) return {};
  const cleaned = text.replace(/^\$/, "").trim();
  if (/[-–]/.test(cleaned)) {
    return { priceNote: `$${cleaned}` };
  }
  const num = Number.parseFloat(cleaned.replace(/[^\d.]/g, ""));
  if (Number.isFinite(num)) {
    return { price: num };
  }
  return { priceNote: `$${cleaned}` };
}

function parseAtTail(tail: string): ParsedTail | null {
  const match = tail.match(/^\s*At\s+(.+?),\s+located\s+(.+)$/i);
  if (!match) return null;

  const vendor = match[1].trim();
  let locationPart = match[2].trim();

  let priceText: string | undefined;
  const priceMatch = locationPart.match(/\.\s*(\$[\d.]+(?:\s*[-–]\s*[\d.]+)?(?:\s+for\s+[^.]+)?)\s*\.?\s*$/);
  if (priceMatch) {
    priceText = priceMatch[1];
    locationPart = locationPart.slice(0, priceMatch.index).trim();
  }

  let location = locationPart.replace(/\s*\([^)]*only[^)]*\)\s*$/i, "").trim();
  location = location.replace(/\s+located\s+(?:at\s+|on\s+the\s+)?/i, " · ").trim();
  const { price, priceNote } = parsePrice(priceText);

  return { vendor, location, price, priceNote };
}

function splitBonusNames(raw: string): string[] {
  const cleaned = raw.replace(/\.$/, "").trim();
  const parts = cleaned
    .split(/,(?!\s*\d)/)
    .flatMap((part) => part.split(/\s+and\s+/i))
    .map((p) => p.trim())
    .filter(Boolean);
  return parts;
}

function splitMultiItemHead(head: string): { name: string; description: string }[] {
  const segments = head.split(/(?<=\.)\s+(?=[A-Z][^:]+?:\s+)/);
  if (segments.length <= 1) {
    const colon = head.indexOf(":");
    if (colon < 0) return [];
    return [
      {
        name: head.slice(0, colon).trim(),
        description: stripDietaryAnnotations(head.slice(colon + 1).trim())
      }
    ];
  }

  const results: { name: string; description: string }[] = [];
  for (const segment of segments) {
    const colon = segment.indexOf(":");
    if (colon < 0) continue;
    results.push({
      name: segment.slice(0, colon).trim(),
      description: stripDietaryAnnotations(segment.slice(colon + 1).trim())
    });
  }
  return results;
}

function splitUrbanGrowlerHead(head: string): { name: string; description: string }[] {
  const cheweeniesIdx = head.search(/\bCheweenies\b/i);
  if (cheweeniesIdx < 0) {
    return splitMultiItemHead(head);
  }

  const mocktailPart = head.slice(0, cheweeniesIdx).trim().replace(/\.$/, "");
  const cheweeniesPart = head.slice(cheweeniesIdx).trim();

  const items: { name: string; description: string }[] = [];
  const mockColon = mocktailPart.indexOf(":");
  if (mockColon >= 0) {
    items.push({
      name: mocktailPart.slice(0, mockColon).trim(),
      description: stripDietaryAnnotations(mocktailPart.slice(mockColon + 1).trim())
    });
  }

  const cheeColon = cheweeniesPart.indexOf(":");
  if (cheeColon >= 0) {
    items.push({
      name: "Cheweenies",
      description: stripDietaryAnnotations(cheweeniesPart.slice(cheeColon + 1).trim())
    });
  }

  return items;
}

function inferFare(name: string, description: string): FairRawMenuItem["fare"] {
  const blob = `${name} ${description}`.toLowerCase();
  if (/\b(dessert|donut|ice cream|sundae|malt|cheesecake|churro|cake|cookie|chocolate|funnel)\b/.test(blob)) {
    return "Desserts";
  }
  if (/\b(taco|burger|sandwich|sub|pork|chicken|ramen|pizza|meatball|waffle|quesaratha)\b/.test(blob)) {
    return "Meals";
  }
  return "Snacks";
}

function isAlcoholicItem(name: string, description: string): boolean {
  const blob = `${name} ${description}`;
  if (NON_ALCOHOL_SIGNAL_RE.test(blob)) return false;
  if (/\bmocktails?\b/i.test(name)) return false;
  return ALCOHOL_SIGNAL_RE.test(blob);
}

function isGenericBeverageOnly(name: string, description: string): boolean {
  if (GENERIC_BEVERAGE_NAME_RE.test(name.trim())) return true;
  if (SPECIALTY_BEVERAGE_RE.test(`${name} ${description}`)) return false;
  if (/\b(coffee|tea|espresso|latte|chai)\b/i.test(name) && !/\b(pickle|ube|pandan|nitro)\b/i.test(name)) {
    return true;
  }
  return false;
}

function buildDescription(
  factual: string,
  location: string,
  priceNote?: string
): string {
  const parts = [factual, location ? `Stand: ${location}.` : null, priceNote ? `Price: ${priceNote}.` : null].filter(
    Boolean
  );
  return parts.join(" ").slice(0, 500);
}

function normalizeParagraphText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isItemParagraph(text: string): boolean {
  if (!ITEM_AT_RE.test(text) || !ITEM_LOCATED_RE.test(text)) return false;
  if (EDITORIAL_PARAGRAPH_RE.test(text)) return false;
  if (SKIP_WHOLE_LINE_RE.some((re) => re.test(text))) return false;

  const atIdx = text.search(/\sAt\s+/i);
  if (atIdx < 0) return false;
  const head = text.slice(0, atIdx);
  if (!head.includes(":") && !/^Bonus Food:/i.test(head)) return false;
  if (/^(GET IT|SKIP IT|YOUR CALL):/i.test(head)) return false;
  return text.length >= 35;
}

function parseItemCandidatesFromLine(line: string): { name: string; description: string }[] {
  const atMatch = line.match(/\s+At\s+/i);
  if (!atMatch || atMatch.index == null) return [];

  const head = line.slice(0, atMatch.index).trim();
  const isBonus = /^Bonus Food:/i.test(head);

  if (isBonus) {
    const list = head.replace(/^Bonus Food:\s*/i, "").trim();
    return splitBonusNames(list).map((name) => ({
      name: name.trim(),
      description: ""
    }));
  }

  if (/\bCheweenies\b/i.test(head) && /\bMocktails?\b/i.test(head)) {
    return splitUrbanGrowlerHead(head);
  }

  return splitMultiItemHead(head);
}

function toRawMenuItem(
  name: string,
  description: string,
  tail: ParsedTail,
  sourceLine: string
): FairRawMenuItem {
  const dietaryTags = parseDietaryTags(sourceLine);
  const factual = description || name;
  const alcoholic = isAlcoholicItem(name, factual);
  const specialtyDrink =
    alcoholic || SPECIALTY_BEVERAGE_RE.test(`${name} ${factual}`);

  let desc = buildDescription(
    stripDietaryAnnotations(factual),
    tail.location,
    tail.priceNote
  );
  if (!desc) {
    desc = `Listed at ${tail.vendor}. ${tail.location}.`;
  }

  return {
    name,
    vendor: tail.vendor,
    description: desc,
    price: tail.price,
    location: tail.location,
    fare: inferFare(name, factual),
    dietaryTags,
    allowBeverage: specialtyDrink,
    beverageCategory: alcoholic ? "Alcoholic Drink" : specialtyDrink ? "Non-Alcoholic Drink" : undefined
  };
}

async function fetchArticleHtml(): Promise<string> {
  const response = await fetch(MSPMAG_SOURCE_URL, {
    headers: { "User-Agent": "StadiumSlopFairImport/1.0 (+https://stadiumslop.com)" }
  });
  if (!response.ok) {
    throw new Error(`MSP Mag fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function extractItemParagraphs(html: string, stats: MspMagStats): string[] {
  const paragraphs: string[] = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    const text = normalizeParagraphText(decodeHtml(match[1]));
    if (!text) continue;

    stats.articleLines++;

    if (EDITORIAL_PARAGRAPH_RE.test(text)) {
      stats.editorialLinesIgnored++;
      continue;
    }

    if (isItemParagraph(text)) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

export async function parseMinnesotaStateFairMspMag2025(): Promise<FairMenuParseResult> {
  const stats: MspMagStats = {
    articleLines: 0,
    editorialLinesIgnored: 0,
    itemBlocksParsed: 0,
    candidatesBeforeDedupe: 0
  };

  const skippedItems: { name: string; reason: string }[] = [];
  const [{ keys: catalogKeys, entries: catalogEntries }, html] = await Promise.all([
    loadMinnesotaCatalogKeys(),
    fetchArticleHtml()
  ]);

  const itemParagraphs = extractItemParagraphs(html, stats);
  const rawCandidates: FairRawMenuItem[] = [];
  const seenBatch = new Set<string>();

  for (const line of itemParagraphs) {
    stats.itemBlocksParsed++;
    const atSegment = line.slice(line.search(/\sAt\s+/i));
    const tail = parseAtTail(atSegment);
    if (!tail) {
      skippedItems.push({ name: line.slice(0, 60), reason: "Could not parse vendor/location tail" });
      continue;
    }

    const parsed = parseItemCandidatesFromLine(line);
    for (const candidate of parsed) {
      stats.candidatesBeforeDedupe++;
      const name = candidate.name.replace(/\.$/, "").trim();
      if (!name) continue;

      if (isGenericBeverageOnly(name, candidate.description)) {
        skippedItems.push({
          name,
          reason: "Generic beverage-only line (not specialty)"
        });
        continue;
      }

      const raw = toRawMenuItem(name, candidate.description, tail, line);
      const batchKey = fairCatalogDedupeKey(raw.vendor, raw.name);
      if (seenBatch.has(batchKey)) {
        skippedItems.push({ name, reason: "Duplicate within MSP Mag batch" });
        continue;
      }
      seenBatch.add(batchKey);

      if (isDuplicateOfCatalog(raw.vendor, raw.name, catalogKeys, catalogEntries)) {
        skippedItems.push({
          name,
          reason: "Duplicate of Minnesota preview/core catalog"
        });
        continue;
      }

      const filterSkip = shouldSkipFairRawItem(raw);
      if (filterSkip) {
        skippedItems.push({ name, reason: filterSkip });
        continue;
      }

      rawCandidates.push(raw);
    }
  }

  const skippedDuplicates = skippedItems.filter((s) =>
    s.reason.includes("Duplicate of Minnesota")
  ).length;
  const skippedEditorial = stats.editorialLinesIgnored;
  const skippedGeneric = skippedItems.filter((s) =>
    s.reason.toLowerCase().includes("beverage")
  ).length;
  const skippedAmbiguous = skippedItems.filter((s) =>
    s.reason.includes("Could not parse")
  ).length;
  const ageRestricted = rawCandidates.filter((r) => r.beverageCategory === "Alcoholic Drink");

  const warnings = [
    "Third-party article-derived factual data from MSP Mag (2025). Verify vendors, prices, and locations on official Minnesota State Fair sources before relying on listings.",
    "MSP Mag review commentary, GET IT / SKIP IT labels, and quoted opinions were not imported.",
    `MSPMag stats: article lines scanned: ${stats.articleLines}`,
    `MSPMag stats: editorial/review lines ignored: ${skippedEditorial}`,
    `MSPMag stats: item blocks parsed: ${stats.itemBlocksParsed}`,
    `MSPMag stats: factual candidates extracted: ${stats.candidatesBeforeDedupe}`,
    `MSPMag stats: unique items after dedupe/filter: ${rawCandidates.length}`,
    `MSPMag stats: skipped duplicates (preview/core): ${skippedDuplicates}`,
    `MSPMag stats: skipped generic beverages: ${skippedGeneric}`,
    `MSPMag stats: skipped ambiguous/unparsed: ${skippedAmbiguous}`,
    `MSPMag stats: age-restricted items: ${ageRestricted.length}`
  ];

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: MSPMAG_SOURCE_URL,
    items: rawCandidates,
    importSource: "mspmag-2025",
    skippedItems,
    warnings
  });
}
