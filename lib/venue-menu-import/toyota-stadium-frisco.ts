/**
 * Toyota Stadium, Frisco TX (FC Dallas — MLS) menu parser.
 *
 * Tenant: FC Dallas only. Not Colorado Rapids (they play at DICK'S Sporting
 * Goods Park, Commerce City CO — slug `dick-s-sporting-goods-park`).
 *
 * The official dining page lists 2026 new items with names, descriptions,
 * and stand/location hints in server-rendered HTML. A linked "Food Map" section
 * is image-only (PNG dining guide) — not OCR'd here.
 *
 * Vendor/stand names (Winners Club, Home Grown, Stand 8/9) are location
 * metadata only — never imported as FoodItem rows.
 *
 * Source: https://www.fcdallas.com/dining
 *
 * DB venue slug: `toyota-stadium` (import CLI uses `toyota-stadium-frisco`).
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "toyota-stadium-frisco";
const VENUE_NAME = "Toyota Stadium";
const SOURCE_URL = "https://www.fcdallas.com/dining";

/** Resolved via apply.ts alias to existing `toyota-stadium` venue row. */
export const TOYOTA_STADIUM_DB_SLUG = "toyota-stadium";

export let lastToyotaStadiumFriscoParseStats = {
  skippedBeverages: 0,
  skippedVendorOnly: 0,
  skippedGeneric: 0
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const DRINK_RE =
  /\b(beer|wine|cocktail|margarita|mule|spritz|seltzer|vodka|whiskey|bourbon|rum|gin|tequila|soda|pepsi|coffee|tea|lemonade|beverage|slush|daiquiri)\b/i;

const VENDOR_ONLY_RE =
  /^(new options at toyota stadium|2026 food map|dining destinations)/i;

const LOCATION_VENDOR: Record<string, string> = {
  "home grown": "Home Grown"
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanItemName(name: string): string {
  return decodeHtmlEntities(name).replace(/^[-–•\s]+/, "").trim();
}

function inferFare(name: string, description: string): VenueMenuFare {
  const text = `${name} ${description}`.toLowerCase();
  if (/\b(cookie|melt|dessert|sweet)\b/.test(text)) return "Desserts";
  if (/\b(salad|fruit cup)\b/.test(text) && !/\b(burger|burrito|taco|sandwich)\b/.test(text)) {
    return "Snacks";
  }
  if (
    /\b(nachos?|wings|fries|sausage link)\b/.test(text) &&
    !/\b(burger|burrito|sandwich)\b/.test(text)
  ) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(description: string): VenueMenuDietaryTag[] {
  const text = description.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\bvegan\b/.test(text)) tags.push("Vegan", "Vegetarian");
  else if (/\bvegetarian\b/.test(text)) tags.push("Vegetarian");
  if (/\bgluten[- ]?free\b/.test(text)) tags.push("Gluten Free");
  return [...new Set(tags)];
}

function locationMetadata(location: string): {
  vendor?: string;
  vendorHint: string;
} {
  const hint = location.trim();
  const key = hint.toLowerCase();
  const vendor = LOCATION_VENDOR[key];
  return { vendor, vendorHint: hint };
}

function parseDescriptionFromList(listHtml: string): string {
  const text = listHtml
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => decodeHtmlEntities(line))
    .filter(Boolean);

  const parts = text.filter((line) => !/^location:/i.test(line));
  return parts.join(" ").trim();
}

function parseLocationFromList(listHtml: string): string | undefined {
  const match = listHtml.match(/Location:\s*([^<]+)/i);
  return match ? decodeHtmlEntities(match[1]) : undefined;
}

export function parseFcDallasDiningHtml(html: string): RawItem[] {
  const items: RawItem[] = [];
  /** Each 2026 item is a top-level <li> with nested description <ul>. */
  const blockRe =
    /<li>\s*<strong>([^<]+)<\/strong>\s*<ul>([\s\S]*?)<\/ul>\s*<\/li>/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html)) !== null) {
    const name = cleanItemName(match[1]);
    const listHtml = match[2];

    if (!name || VENDOR_ONLY_RE.test(name)) {
      lastToyotaStadiumFriscoParseStats.skippedVendorOnly += 1;
      continue;
    }

    const description = parseDescriptionFromList(listHtml);
    const location = parseLocationFromList(listHtml);
    const blob = `${name} ${description}`;

    if (DRINK_RE.test(blob)) {
      lastToyotaStadiumFriscoParseStats.skippedBeverages += 1;
      continue;
    }

    const { vendor, vendorHint } = location
      ? locationMetadata(location)
      : { vendorHint: undefined };

    const tags = ["mls"];
    if (
      /\b(tex|texas|tex-mex|bbq|brisket|pernil|nashville|cotija|tinga)\b/i.test(
        blob
      )
    ) {
      tags.push("local-specialty");
    }

    items.push({
      name,
      description: description || undefined,
      fare: inferFare(name, description),
      vendor,
      vendorHint: vendorHint || location,
      dietary: inferDietary(description),
      tags
    });
  }

  return items;
}

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<string, RawItem>();

  for (const raw of rawItems) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, raw);
      continue;
    }
    if (!existing.description && raw.description) {
      existing.description = raw.description;
    }
    if (!existing.vendor && raw.vendor) existing.vendor = raw.vendor;
    if (raw.vendorHint && raw.vendorHint !== existing.vendorHint) {
      existing.vendorHint = [existing.vendorHint, raw.vendorHint]
        .filter(Boolean)
        .join("; ");
    }
  }

  return [...map.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((raw) => ({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food" as const,
      vendorName: raw.vendor,
      vendorLocationHint: raw.vendorHint,
      dietaryTags: raw.dietary ?? [],
      sourceUrl: SOURCE_URL
    }));
}

export async function parseToyotaStadiumFriscoMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastToyotaStadiumFriscoParseStats = {
    skippedBeverages: 0,
    skippedVendorOnly: 0,
    skippedGeneric: 0
  };

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "StadiumSlop/1.0 (venue menu import)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FC Dallas dining page: ${response.status}`);
  }

  const html = await response.text();
  const rawItems = parseFcDallasDiningHtml(html);
  const items = mergeItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastToyotaStadiumFriscoParseStats.skippedBeverages
  };
}
