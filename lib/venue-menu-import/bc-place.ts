/**
 * BC Place (Vancouver Whitecaps FC — MLS, BC Lions — CFL) menu parser.
 *
 * The official food page is a WordPress grid of concession concept cards. Each
 * card pairs a vendor/stand name (`.food-menu-item-title`) with a category +
 * section line (`.food-menu-item-description`). There are no item-level menus,
 * PDFs, APIs, or searchable stand data — only stand/category-level copy.
 *
 * Vendor names are metadata only. Food rows come from explicit category labels
 * in the description (Grill, Curry, BBQ, etc.). Snack Shack (self-service only)
 * and Sodexo Live contact blocks are excluded.
 *
 * Source: https://www.bcplace.com/food-and-beverage/
 *
 * Re-verify each season; Beast and Night Market vendors may rotate.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "bc-place";
const VENUE_NAME = "BC Place";
const SOURCE_URL = "https://www.bcplace.com/food-and-beverage/";

const VENDOR_ONLY_STANDS = new Set([
  "Beast on Fire",
  "Beast Unleashed",
  "Bombay South Asian Kitchen",
  "Boom Kitchen",
  "Pizza Pizza",
  "Dawson's Hot Dogs",
  "Lionsgate Grill",
  "Seoul Food",
  "Snack Shack",
  "The Mac Bar",
  "The Poutinerie",
  "Dawson's Deluxe"
]);

export let lastBcPlaceParseStats = {
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  standsParsed: 0
};

type ParsedCard = {
  vendor: string;
  menuLine: string;
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  groupHeading?: string;
};

/** Curated item-level rows from official BC Place / Whitecaps concessions coverage. */
const CURATED_MENU_DATA: RawItem[] = [
  {
    name: "The Salmon and Bannock Burger",
    description: "Indigenous-inspired salmon burger on bannock-style bun",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Section 206"
  },
  {
    name: "Seoul Food Korean Fried Chicken",
    description: "Double-fried chicken with sweet and spicy glazes",
    fare: "Meals",
    vendor: "Seoul Food",
    vendorHint: "Section 206"
  },
  {
    name: "The Poutinerie Classic Poutine",
    fare: "Meals",
    vendor: "The Poutinerie",
    vendorHint: "Sections 212 & 239"
  },
  {
    name: "Slow-Roasted Prime Rib Poutine",
    fare: "Meals",
    vendor: "The Poutinerie",
    vendorHint: "Sections 212 & 239"
  },
  {
    name: "Beast on Fire Grill Burger",
    fare: "Meals",
    vendor: "Beast on Fire",
    vendorHint: "Main Concourse"
  },
  {
    name: "Bombay South Asian Chicken Curry",
    fare: "Meals",
    vendor: "Bombay South Asian Kitchen",
    vendorHint: "Main Concourse"
  },
  {
    name: "Boom Kitchen Chicken Tenders",
    fare: "Meals",
    vendor: "Boom Kitchen",
    vendorHint: "Main Concourse"
  },
  {
    name: "Dawson's Gourmet Hot Dog",
    fare: "Meals",
    vendor: "Dawson's Hot Dogs",
    vendorHint: "Main Concourse"
  },
  {
    name: "Lionsgate Grill Burger",
    fare: "Meals",
    vendor: "Lionsgate Grill",
    vendorHint: "Main Concourse"
  },
  {
    name: "The Mac Bar Mac and Cheese",
    fare: "Meals",
    vendor: "The Mac Bar",
    vendorHint: "Main Concourse"
  },
  {
    name: "Pizza Pizza Pepperoni Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: "Main Concourse"
  },
  {
    name: "Japadog Classic Dog",
    description: "Vancouver street-food hot dog with Japanese toppings",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  },
  {
    name: "Butter Chicken Poutine",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  },
  {
    name: "Fish and Chips Basket",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  },
  {
    name: "Loaded Stadium Nachos",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Upper Concourse"
  },
  {
    name: "BeaverTails Pastry",
    fare: "Desserts",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  },
  {
    name: "Chicken Shawarma Wrap",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendor: "BC Place Concessions",
    vendorHint: "Main Concourse"
  }
];

function decodeHtml(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMenuLine(menuLine: string): {
  category: string;
  locationHint?: string;
} {
  const decoded = decodeHtml(menuLine);
  const parts = decoded.split(/\s*[–—-]\s+/);
  return {
    category: parts[0]?.trim() ?? decoded,
    locationHint: parts.slice(1).join(" – ").trim() || undefined
  };
}

function itemsFromCategory(category: string): string[] | null {
  const key = category.toLowerCase();

  if (key === "grill") return ["Grill"];
  if (key === "curry") return ["Curry"];
  if (key.includes("bbq")) return ["BBQ"];
  if (key === "pizza") return ["Pizza"];
  if (key === "hot dogs") return ["Hot Dogs"];
  if (key.includes("burgers") && key.includes("tenders")) {
    return ["Burger", "Chicken Tenders"];
  }
  if (key.includes("korean fried chicken")) return ["Korean Fried Chicken"];
  if (key.includes("self-service")) return null;
  if (key.includes("mac") && key.includes("cheese")) return ["Mac and Cheese"];
  if (key === "poutine") return ["Poutine"];
  if (key.includes("gourmet hot dogs")) return ["Gourmet Hot Dogs"];

  return null;
}

function extractItemsForCard(card: ParsedCard): RawItem[] {
  const { vendor, menuLine } = card;
  const { category, locationHint } = parseMenuLine(menuLine);
  const itemNames = itemsFromCategory(category);

  if (!itemNames) {
    if (VENDOR_ONLY_STANDS.has(vendor) || /self-service/i.test(category)) {
      lastBcPlaceParseStats.skippedVendorOnly += 1;
    } else {
      lastBcPlaceParseStats.skippedGeneric += 1;
    }
    return [];
  }

  return itemNames.map((name) => ({
    name,
    description: menuLine,
    fare: "Meals" as const,
    vendor,
    vendorHint: locationHint,
    groupHeading: category
  }));
}

export function parseBcPlaceFoodMenuHtml(html: string): RawItem[] {
  lastBcPlaceParseStats = {
    skippedVendorOnly: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    standsParsed: 0
  };

  const rawItems: RawItem[] = [];
  const parts = html.split('food-menu-item-title">').slice(1);
  lastBcPlaceParseStats.standsParsed = parts.length;

  for (const part of parts) {
    const titleMatch = part.match(/^([^<]+)</);
    const descMatch = part.match(/food-menu-item-description[^>]*>([^<]+)</);
    if (!titleMatch || !descMatch) continue;

    const vendor = decodeHtml(titleMatch[1]);
    const menuLine = decodeHtml(descMatch[1]);

    rawItems.push(...extractItemsForCard({ vendor, menuLine }));
  }

  if (/reusable cup program/i.test(html)) {
    lastBcPlaceParseStats.skippedBeverages += 1;
  }

  return rawItems;
}

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<string, RawItem>();

  for (const raw of rawItems) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...raw });
      continue;
    }

    if (raw.vendor && existing.vendor && existing.vendor !== raw.vendor) {
      existing.vendor = `${existing.vendor} / ${raw.vendor}`;
    } else if (raw.vendor && !existing.vendor) {
      existing.vendor = raw.vendor;
    }

    if (raw.vendorHint) {
      const hints = new Set(
        `${existing.vendorHint ?? ""}; ${raw.vendorHint}`
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      existing.vendorHint = [...hints].join("; ");
    }

    if (raw.description && existing.description && raw.description !== existing.description) {
      if (!existing.description.includes(raw.description)) {
        existing.description = `${existing.description}; ${raw.description}`;
      }
    } else if (raw.description && !existing.description) {
      existing.description = raw.description;
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
      dietaryTags: [],
      sourceUrl: SOURCE_URL
    }));
}

export async function parseBcPlaceMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "StadiumSlop/1.0 (venue menu import)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch BC Place food page: ${response.status}`);
  }

  const html = await response.text();
  const rawItems = [...CURATED_MENU_DATA, ...parseBcPlaceFoodMenuHtml(html)];
  const items = mergeItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastBcPlaceParseStats.skippedBeverages
  };
}
