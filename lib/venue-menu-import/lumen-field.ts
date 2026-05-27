/**
 * Lumen Field (Seattle Sounders FC — MLS, Seattle Seahawks — NFL) menu parser.
 *
 * The official concessions guide is a Webflow CMS page with filterable vendor
 * cards. Each card includes a stand name and item-level menu copy in
 * `.cg-vendor-desc` (server-rendered for all vendors in the HTML). Section
 * numbers load via nested CMS filters and are not in static HTML.
 *
 * No PDF menus, image-only boards, or ordering API. Event-type tags
 * (Seahawks / Sounders / Reign) appear as hidden filter fields only.
 *
 * Source: https://www.lumenfield.com/plan-your-visit/concessions-guide
 *
 * Re-verify each season; Night Market and Heineken vendors rotate.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "lumen-field";
const VENUE_NAME = "Lumen Field";
const SOURCE_URL = "https://www.lumenfield.com/plan-your-visit/concessions-guide";

const BASE_TAGS = ["mls", "nfl", "world-cup-host"];

/** Stands with no reviewable food items in menu copy. */
const BEVERAGE_OR_VENDOR_ONLY_STANDS = new Set([
  "Cityside Bars",
  "Elysian",
  "Muckleshoot Sports Lounge",
  "Rainier Market",
  "Spirits on Main",
  "Spirits on Summit",
  "Tapped & Corked",
  "Tap Works",
  "Coffee and Espresso Cart",
  "Club Market",
  "Fly Thru Market",
  "Grab & Go",
  "Beer Garden",
  "Nacho Carts",
  "Sausage Carts",
  "Night Market",
  "PNW Marketplace",
  "Cheesesteak Kitchen" // vendor-only copy: no named menu items
]);

export let lastLumenFieldParseStats = {
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  standsParsed: 0
};

type ParsedStand = {
  vendor: string;
  menuText: string;
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

function decodeHtml(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rawItem(
  name: string,
  vendor: string,
  opts: {
    description?: string;
    fare?: VenueMenuFare;
    vendorHint?: string;
    dietary?: VenueMenuDietaryTag[];
    local?: boolean;
  } = {}
): RawItem {
  const tags = [...BASE_TAGS];
  if (opts.local !== false) tags.push("local-specialty");
  return {
    name,
    description: opts.description,
    fare: opts.fare ?? "Meals",
    vendor,
    vendorHint: opts.vendorHint,
    dietary: opts.dietary ?? [],
    tags
  };
}

function inferLocationHint(menuText: string): string | undefined {
  const section = menuText.match(/Section\s+(\d+(?:\s*&\s*\d+)?)/i);
  if (section) return `Section ${section[1].replace(/\s+/g, " ")}`;
  if (/olympic plaza/i.test(menuText)) return "Olympic Plaza";
  if (/international eats/i.test(menuText)) return "International Eats Stand";
  return undefined;
}

function extractItemsForStand(stand: ParsedStand): RawItem[] {
  const { vendor, menuText } = stand;
  const hint = inferLocationHint(menuText);
  const items: RawItem[] = [];

  switch (vendor) {
    case "Ballard Pizza":
      items.push(
        rawItem("3 Cheese Pizza", vendor, { local: true }),
        rawItem("Pepperoni Pizza", vendor, { local: true }),
        rawItem("Ballard Bridge Pizza", vendor, {
          description: "Ballard Bridge slice",
          local: true
        }),
        rawItem("Staple & Fancy Pizza", vendor, { local: true }),
        rawItem("Italiano Salad", vendor, { fare: "Snacks", local: true }),
        rawItem("Caesar Salad", vendor, { fare: "Snacks", local: true }),
        rawItem("How to Wolfe a Cookie", vendor, {
          fare: "Desserts",
          local: true
        })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    case "Bam Bam Smash Burger":
      items.push(
        rawItem("Bam Bam Smash Burger", vendor, { local: true }),
        rawItem("Seattle Smash Burger", vendor, {
          description: "Seattle-style smash burger",
          local: true
        }),
        rawItem("Legion Cajun Shrimp Basket", vendor, { local: true }),
        rawItem("Cajun Fries", vendor, { fare: "Snacks", local: true })
      );
      break;

    case "Bar Dojo":
      items.push(
        rawItem("Poke Nachos", vendor, { local: true }),
        rawItem("Birria Ramen", vendor, { local: true }),
        rawItem("Soup Dumplings", vendor, { local: true }),
        rawItem("Chicken Fried Rice", vendor, { local: true }),
        rawItem("Chicken Teriyaki", vendor, { local: true })
      );
      break;

    case "Big Walt's Kitchen":
      items.push(
        rawItem("The Rookie", vendor, {
          description: "Classic chicken tenders and fries",
          local: true
        }),
        rawItem("The All Pro", vendor, {
          description: "Chicken tenders and fries with bang bang sauce",
          local: true
        }),
        rawItem("284", vendor, {
          description: "Chicken tenders and fries with rotating sauce",
          local: true
        })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      lastLumenFieldParseStats.skippedGeneric += 1;
      break;

    case "Dippin' Dots & Lemonade":
      items.push(
        rawItem("Dippin' Dots", vendor, { fare: "Desserts", local: false }),
        rawItem("Churros", vendor, { fare: "Desserts", local: false })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      lastLumenFieldParseStats.skippedGeneric += 2;
      break;

    case "District Market":
      items.push(
        rawItem("Chung Chun Rice Dog", vendor, {
          description: "Seattle local restaurant",
          local: true
        }),
        rawItem("Mochi Donut", vendor, { fare: "Desserts", local: true })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    case "Grilled Cheese & Tomato Soup":
      items.push(
        rawItem("Grilled Cheese", vendor, {
          description: "Texas toast with cheddar and provolone",
          vendorHint: hint ?? "Olympic Plaza",
          dietary: ["Vegetarian"]
        }),
        rawItem("Tomato Basil Soup", vendor, {
          vendorHint: hint ?? "Olympic Plaza",
          dietary: ["Vegetarian"]
        })
      );
      break;

    case "Ivar's":
      items.push(
        rawItem("Fish and Chips", vendor, { local: true }),
        rawItem("Ivar's Clam Chowder", vendor, { local: true }),
        rawItem("Garlic Fries", vendor, { fare: "Snacks", local: true }),
        rawItem("Chicken and Chips", vendor, { local: true })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    case "Kidd Valley":
      items.push(
        rawItem("Big Kidd Burger", vendor, {
          description: "1/3 lb burger",
          local: true
        }),
        rawItem("Chicken Tenders", vendor, { fare: "Snacks", local: true }),
        rawItem("Garlic Fries", vendor, { fare: "Snacks", local: true }),
        rawItem("French Fries", vendor, { fare: "Snacks", local: false })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    case "Kings Hawaiian":
      items.push(
        rawItem("Pulled Chicken Sandwich", vendor, { local: true }),
        rawItem("Pulled Pork Sandwich", vendor, { local: true }),
        rawItem("Rib Sandwich", vendor, { local: true }),
        rawItem("Beecher's White Cheddar Mac and Cheese", vendor, {
          description: "With cornbread crunch",
          dietary: ["Vegetarian"],
          local: true
        }),
        rawItem("Apple Hand Pie", vendor, {
          fare: "Desserts",
          dietary: ["Vegetarian"],
          local: true
        })
      );
      break;

    case "KOREAN BBQ STEAK SANDWICH":
      items.push(
        rawItem("Korean Beef Bulgogi Sandwich", vendor, {
          description: "Bulgogi beef with spicy gochujang slaw",
          local: true
        })
      );
      break;

    case "Legion":
      items.push(
        rawItem("Legion Sausage", vendor, { local: true }),
        rawItem("Chicken and Andouille Gumbo", vendor, { local: true }),
        rawItem("Southern Fried Catfish Nuggets", vendor, { local: true })
      );
      break;

    case "Local Dogs and Brats":
      items.push(
        rawItem("Hempler's Hot Dog", vendor, {
          vendorHint: hint ?? "Sections 109 and 135",
          local: true
        }),
        rawItem("Footlong Seattle Dog", vendor, {
          description: "Seattle-style hot dog",
          vendorHint: hint ?? "Sections 109 and 135",
          local: true
        })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      lastLumenFieldParseStats.skippedGeneric += 1; // 12s Combo
      break;

    case "Lune Café":
      items.push(
        rawItem("Dubai Strawberry Cup", vendor, {
          fare: "Desserts",
          vendorHint: hint,
          local: true
        }),
        rawItem("Biscoff Mini Pancakes", vendor, {
          fare: "Desserts",
          vendorHint: hint,
          local: true
        }),
        rawItem("Cookies and Cream Mini Pancakes", vendor, {
          fare: "Desserts",
          vendorHint: hint
        }),
        rawItem("Strawberry Mini Pancakes", vendor, {
          fare: "Desserts",
          vendorHint: hint
        })
      );
      lastLumenFieldParseStats.skippedBeverages += 2; // energy drinks
      break;

    case "Manu's Tacos":
      items.push(
        rawItem("Chicken Tinga Nachos", vendor, { vendorHint: hint, local: true }),
        rawItem("Chicken Tinga Tacos", vendor, { vendorHint: hint, local: true }),
        rawItem("Beef Birria Tacos", vendor, { vendorHint: hint, local: true }),
        rawItem("Black Bean Nachos", vendor, {
          fare: "Snacks",
          vendorHint: hint,
          dietary: ["Vegetarian"]
        }),
        rawItem("Black Bean Taco", vendor, {
          vendorHint: hint,
          dietary: ["Vegetarian"]
        })
      );
      break;

    case "Mister Softee":
      items.push(
        rawItem("Soft Serve Ice Cream", vendor, {
          description: "Chocolate, vanilla, or swirl cup or cone",
          fare: "Desserts",
          local: false
        })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    case "Pacific Northwest Kitchen":
      items.push(
        rawItem("Yard Nachos", vendor, { fare: "Snacks", local: true }),
        rawItem("Smokey BBQ Mac and Cheese", vendor, { local: true }),
        rawItem("Fiesta Mac and Cheese", vendor, { local: true }),
        rawItem("Beecher's Mac and Cheese", vendor, {
          dietary: ["Vegetarian"],
          local: true
        }),
        rawItem("Banh Mi", vendor, {
          description: "Saigon Drip Café banh mi",
          local: true
        })
      );
      break;

    case "Tierra Madre":
      items.push(
        rawItem("Jackfruit Carnitas Nachos", vendor, {
          dietary: ["Vegan", "Vegetarian"],
          local: true
        }),
        rawItem("Grilled Vegetable Tamales", vendor, {
          dietary: ["Vegan", "Vegetarian"],
          local: true
        }),
        rawItem("Off the Cobb Corn Esquite", vendor, {
          dietary: ["Vegan", "Vegetarian"],
          local: true
        })
      );
      break;

    case "Tutta Bella Neapolitan Pizza":
      items.push(
        rawItem("Neapolitan Pizza", vendor, { local: true }),
        rawItem("Tiramisu", vendor, { fare: "Desserts", local: true })
      );
      lastLumenFieldParseStats.skippedBeverages += 1;
      break;

    default:
      break;
  }

  if (items.length === 0 && !BEVERAGE_OR_VENDOR_ONLY_STANDS.has(vendor)) {
    lastLumenFieldParseStats.skippedGeneric += 1;
  }

  return items;
}

export function parseLumenFieldConcessionsHtml(html: string): RawItem[] {
  lastLumenFieldParseStats = {
    skippedVendorOnly: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    standsParsed: 0
  };

  const rawItems: RawItem[] = [];
  const parts = html.split('class="conc-vendor-block"').slice(1);

  lastLumenFieldParseStats.standsParsed = parts.length;

  for (const part of parts) {
    const titleMatch = part.match(/cg-vendor-title">([^<]+)</);
    const descMatch = part.match(
      /cg-vendor-desc">([\s\S]*?)<\/div>\s*<div fs-cmsfilter-field="food-type"/
    );
    if (!titleMatch || !descMatch) continue;

    const vendor = decodeHtml(titleMatch[1]).trim();
    const menuText = decodeHtml(descMatch[1].replace(/<[^>]+>/g, " "));

    if (BEVERAGE_OR_VENDOR_ONLY_STANDS.has(vendor)) {
      lastLumenFieldParseStats.skippedVendorOnly += 1;
      continue;
    }

    rawItems.push(...extractItemsForStand({ vendor, menuText }));
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

    if (!existing.description && raw.description) {
      existing.description = raw.description;
    } else if (
      raw.description &&
      existing.description &&
      raw.description !== existing.description &&
      !existing.description.includes(raw.description)
    ) {
      existing.description = `${existing.description}; ${raw.description}`;
    }

    if (raw.vendor && existing.vendor && existing.vendor !== raw.vendor) {
      existing.vendor = `${existing.vendor} / ${raw.vendor}`;
    } else if (raw.vendor && !existing.vendor) {
      existing.vendor = raw.vendor;
    }

    if (raw.vendorHint) {
      const parts = new Set(
        `${existing.vendorHint ?? ""}; ${raw.vendorHint}`
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      existing.vendorHint = [...parts].join("; ");
    }

    if (raw.dietary?.length) {
      existing.dietary = [...new Set([...(existing.dietary ?? []), ...raw.dietary])];
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

export async function parseLumenFieldMenu(
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
    throw new Error(`Failed to fetch Lumen Field concessions guide: ${response.status}`);
  }

  const html = await response.text();
  const rawItems = parseLumenFieldConcessionsHtml(html);
  const items = mergeItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastLumenFieldParseStats.skippedBeverages
  };
}
