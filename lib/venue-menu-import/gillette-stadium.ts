/**
 * Gillette Stadium (New England Revolution — MLS, New England Patriots — NFL)
 * menu parser.
 *
 * The official concessions page lists stands with menu summaries and section
 * numbers in server-rendered HTML (Elementor). No ordering API or PDF.
 *
 * Stand names are vendor metadata only. Beverage-only stands/carts and generic
 * snack rows are excluded. Repeated items across stands are merged.
 *
 * Source: https://www.gillettestadium.com/concessions/
 *
 * Note: Page footer states Patriots offerings; Revolution/concert menus may vary.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "gillette-stadium";
const VENUE_NAME = "Gillette Stadium";
const SOURCE_URL = "https://www.gillettestadium.com/concessions/";

const BASE_TAGS = ["mls", "nfl", "world-cup-host"];

/** Stands with no reviewable food items on the concessions page. */
const BEVERAGE_OR_SNACK_ONLY_STANDS = new Set([
  "The Landing",
  "Fast Lane",
  "Bar Cart",
  "Cans of New England",
  "Bottle Cart",
  "Draft Cart",
  "Draft beers of New England",
  "Ice Cream & Popcorn Cart"
]);

export let lastGilletteStadiumParseStats = {
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  standsParsed: 0
};

type ParsedStand = {
  vendor: string;
  sections: string[];
  menuText: string;
  nutFreeText?: string;
  dairyFreeText?: string;
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
  /\b(beer|wine|cocktail|margarita|cider|seltzer|vodka|whiskey|bourbon|rum|gin|tequila|soda|pepsi|gatorade|coffee|tea|lemonade|beverage|hot\s+chocolate|iced\s+tea|minute\s+maid)\b/i;

const GENERIC_SKIP_RE =
  /^(bbq\s+sandwiches?|and\s+snacks|snacks|various\s+snacks|house\s+made\s+snacks|house\s+baked\s+snacks|organic\s+popcorn|popcorn|peanuts|candy|soft\s+pretzel|nachos)$/i;

const MENU_SPLIT_RE = /\s*,\s*|\s+and\s+/i;

function decodeHtml(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionHint(sections: string[]): string {
  if (sections.length === 0) return "";
  return `Sections ${sections.join(", ")}`;
}

function inferFare(name: string): VenueMenuFare {
  const n = name.toLowerCase();
  if (/\b(pretzel|fries|nachos|wings|sticks|fruit\s+cup|salad|greens)\b/.test(n)) {
    return "Snacks";
  }
  if (/\b(pizza|burger|sandwich|sub|taco|burrito|enchilada|panini|sausage|hot\s+dog|ramyun|smashburger|mac)\b/.test(n)) {
    return "Meals";
  }
  return "Meals";
}

function canonicalItemName(raw: string): string | null {
  let name = decodeHtml(raw)
    .replace(/\([^)]*\)/g, "")
    .replace(/\*+/g, "")
    .trim();

  if (
    !name ||
    DRINK_RE.test(name) ||
    GENERIC_SKIP_RE.test(name) ||
    /[{}"<>]|&quot;|elementor|classic/i.test(name)
  ) {
    return null;
  }

  const lower = name.toLowerCase();

  if (/^personal\s+pizzas?$/i.test(name) || /^pizza$/i.test(name)) return null;
  if (/^hand[- ]stretched\s+pizzas?$/i.test(name)) return null;
  if (/^fresh\s+wraps?\s+and\s+salads?$/i.test(name)) return null;
  if (/^burger\s+basket/i.test(name)) return null;

  const aliases: Record<string, string | null> = {
    "fresh baked pretzel log": "Fresh Baked Pretzel Log",
    "bavarian pretzel logs": "Bavarian Pretzel Log",
    "bavarian pretzel log": "Bavarian Pretzel Log",
    "pulled pork nachos": "Pulled Pork Nachos",
    "pulled chicken nachos": "Pulled Chicken Nachos",
    "pulled pork sandwich": "Pulled Pork Sandwich",
    "pulled chicken sandwich": "Pulled Chicken Sandwich",
    "beef brisket sandwich": "Beef Brisket Sandwich",
    "hand breaded fried chicken sandwiches": "Hand Breaded Fried Chicken Sandwich",
    "hand breaded fried chicken sandwich": "Hand Breaded Fried Chicken Sandwich",
    "italian sausages": "Italian Sausage",
    "footlong hot dogs": "Footlong Hot Dog",
    "hot dogs": "Hot Dog",
    "kosher hot dogs": "Kosher Hot Dog",
    "veggie hot dogs": "Veggie Hot Dog",
    "hamburgers": "Hamburger",
    "cheeseburgers": "Cheeseburger",
    "vegan burgers": "Vegan Burger",
    "steak & cheese subs": "Steak & Cheese Sub",
    "steak and cheese subs": "Steak & Cheese Sub",
    "smashburgers": "Smashburger",
    "kielbasy": "Kielbasa",
    "kielbasa": "Kielbasa",
    "dom's steak tip sub": "Dom's Steak Tip Sub",
    "doms steak tip sub": "Dom's Steak Tip Sub",
    "fresh fruit cup": "Fresh Fruit Cup",
    "fresh local greens": "Fresh Local Greens",
    "garlic parmesan fries": "Garlic Parmesan Fries",
    "pressed paninis": "Pressed Panini",
    "seasonal soups": "Seasonal Soup",
    "seasonal soup": "Seasonal Soup",
    "fresh wraps": "Wrap",
    "salads": "Salad",
    "wraps": "Wrap",
    "burritos": "Burrito",
    "enchiladas": "Enchilada",
    "chicken wings": "Chicken Wings",
    "chicken tenders": "Chicken Tenders",
    "mozzarella sticks": "Mozzarella Sticks",
    "french fries": "French Fries",
    "cheese pizza": "Cheese Pizza",
    "pepperoni pizza": "Pepperoni Pizza",
    "cheese or pepperoni pizza": null,
    "personal pizza (cheese or pepperoni)": null,
    "cheesesteak sandwich": "Steak & Cheese Sub",
    "turkey burger": null,
    "warm cinnamon sticks": null
  };

  const key = lower.replace(/\s+/g, " ");
  if (key in aliases) return aliases[key] ?? null;

  if (/cheese\s+or\s+pepperoni/i.test(name)) return null;

  // Title-case short names
  if (name.length < 60) {
    return name
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
      .replace(/\bBbq\b/g, "BBQ")
      .replace(/\bAnd\b/g, "and");
  }

  return null;
}

function parseMenuLine(menuText: string): string[] {
  const items = new Set<string>();
  let text = decodeHtml(menuText).replace(/^kiosk ordering of\s+/i, "");

  const compounds: Array<{ re: RegExp; names: string[] }> = [
    {
      re: /pulled pork nachos\s+and\s+pulled chicken nachos/gi,
      names: ["Pulled Pork Nachos", "Pulled Chicken Nachos"]
    },
    {
      re: /personal pizza\s*\(\s*cheese\s+or\s+pepperoni\s*\)/gi,
      names: ["Cheese Pizza", "Pepperoni Pizza"]
    },
    {
      re: /cheese\s+or\s+pepperoni\s+pizza/gi,
      names: ["Cheese Pizza", "Pepperoni Pizza"]
    }
  ];

  for (const { re, names } of compounds) {
    if (re.test(text)) {
      for (const name of names) items.add(name);
      text = text.replace(re, "");
    }
  }

  for (const segment of text.split(/\s*,\s*/)) {
    let part = segment.replace(/^\s*and\s+/i, "").trim();
    if (!part) continue;

    if (MENU_SPLIT_RE.test(part)) {
      for (const sub of part.split(MENU_SPLIT_RE)) {
        const name = canonicalItemName(sub.trim());
        if (name) items.add(name);
      }
      continue;
    }

    const name = canonicalItemName(part);
    if (name) items.add(name);
  }

  return [...items];
}

function parseAllergenItems(text: string | undefined): string[] {
  if (!text) return [];
  const items: string[] = [];
  const cleaned = decodeHtml(text.replace(/<[^>]+>/g, " "))
    .replace(/\(nut free only\)/gi, "")
    .replace(/\(available upon request\)/gi, "")
    .replace(/gluten[- ]?free\s+hot\s+dog\s+or\s+hamburger\s+buns/gi, "")
    .replace(/\{[^}]*\}/g, "");

  for (const part of cleaned.split(/,|\band\b/)) {
    const trimmed = part.trim();
    if (!trimmed || trimmed.length > 45) continue;
    if (/^\d{3}$/.test(trimmed)) continue;
    if (/most offerings|locations sections|market express locations/i.test(trimmed)) {
      continue;
    }
    const name = canonicalItemName(trimmed);
    if (name) items.push(name);
  }
  return items;
}

function inferDietaryFromStand(
  itemName: string,
  stand: ParsedStand
): VenueMenuDietaryTag[] {
  const tags = new Set<VenueMenuDietaryTag>();
  const blob = `${stand.dairyFreeText ?? ""} ${stand.nutFreeText ?? ""}`.toLowerCase();
  const norm = itemName.toLowerCase();

  if (/\bvegan\s+burger\b/.test(norm) || /\bbeyond\s+meat\b/i.test(norm)) {
    tags.add("Vegan");
    tags.add("Vegetarian");
  } else if (/\bveggie\s+hot\s+dog\b/.test(norm)) {
    tags.add("Vegetarian");
  } else if (/\bcheese\s+pizza\b/.test(norm) && !/\bpepperoni\b/.test(norm)) {
    tags.add("Vegetarian");
  }

  return [...tags];
}

export function parseGilletteConcessionsHtml(html: string): RawItem[] {
  const rawItems: RawItem[] = [];
  let skippedVendorOnly = 0;
  let skippedGeneric = 0;

  const parts = html.split(/alt=\"([^\"]+) at Gillette Stadium/i);
  const stands: ParsedStand[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const vendor = decodeHtml(parts[i].replace(/ logo\.?$/i, ""));
    const chunk = parts[i + 1]?.slice(0, 12_000) ?? "";

    if (BEVERAGE_OR_SNACK_ONLY_STANDS.has(vendor)) {
      skippedVendorOnly += 1;
      continue;
    }

    const menuMatch = chunk.match(
      /<(?:strong|b)>Menu:?\s*<\/(?:strong|b)>([\s\S]*?)<\/p>/i
    );
    const menuHtml = menuMatch?.[1] ?? "";
    const menuText = decodeHtml(menuHtml.replace(/<[^>]+>/g, " "));

    const beverageOnly =
      !menuText &&
      /<strong>Beverages:/i.test(chunk) &&
      !/<strong>Menu/i.test(chunk);
    if (beverageOnly) {
      skippedVendorOnly += 1;
      continue;
    }

    if (!menuText || /^various snacks$/i.test(menuText.trim())) {
      if (/various snacks/i.test(menuText)) skippedGeneric += 1;
      else skippedVendorOnly += 1;
      continue;
    }

    const sections = [
      ...chunk.matchAll(
        /<h4 class="elementor-heading-title elementor-size-default">(\d{3})<\/h4>/g
      )
    ].map((m) => m[1]);

    const nutMatch = chunk.match(
      /Nut(?:\s+and\s+Dairy)?\s+Free[^:]*:([\s\S]*?)(?=<p|<\/div|$)/i
    );
    const dairyMatch = chunk.match(
      /Dairy\s+Free[^:]*:([\s\S]*?)(?=<p|<\/div|$)/i
    );

    stands.push({
      vendor,
      sections: [...new Set(sections)],
      menuText,
      nutFreeText: nutMatch ? decodeHtml(nutMatch[1]) : undefined,
      dairyFreeText: dairyMatch ? decodeHtml(dairyMatch[1]) : undefined
    });
  }

  lastGilletteStadiumParseStats.standsParsed = stands.length;

  for (const stand of stands) {
    const hint = sectionHint(stand.sections);
    const names = new Set<string>();

    for (const name of parseMenuLine(stand.menuText)) {
      names.add(name);
    }

    // Named BBQ sandwiches from allergy copy when menu only says "BBQ Sandwiches"
    if (/bbq\s+sandwich/i.test(stand.menuText)) {
      for (const sandwich of [
        "Pulled Pork Sandwich",
        "Pulled Chicken Sandwich",
        "Beef Brisket Sandwich"
      ]) {
        if (
          stand.nutFreeText?.toLowerCase().includes(sandwich.toLowerCase()) ||
          stand.vendor === "Backyard Barbeque"
        ) {
          names.add(sandwich);
        }
      }
    }

    for (const name of parseAllergenItems(stand.nutFreeText)) {
      if (!GENERIC_SKIP_RE.test(name)) names.add(name);
    }
    for (const name of parseAllergenItems(stand.dairyFreeText)) {
      if (name === "Veggie Hot Dog" || name === "Vegan Burger") {
        names.add(name);
      }
    }

    // Pizza stands: split personal/cheese-or-pepperoni mentions
    if (/\bpizza\b/i.test(stand.menuText) || /\bpizzas\b/i.test(stand.menuText)) {
      names.add("Cheese Pizza");
      names.add("Pepperoni Pizza");
      names.delete("Pizza");
    }

    for (const name of names) {
      if (GENERIC_SKIP_RE.test(name)) {
        skippedGeneric += 1;
        continue;
      }

      const tags = [...BASE_TAGS];
      const dietary = inferDietaryFromStand(name, stand);

      if (
        name === "Dom's Steak Tip Sub" ||
        /\b(steak tip|local greens)\b/i.test(name)
      ) {
        tags.push("local-specialty");
      }

      rawItems.push({
        name,
        fare: inferFare(name),
        vendor: stand.vendor,
        vendorHint: hint || undefined,
        dietary,
        tags
      });
    }
  }

  lastGilletteStadiumParseStats.skippedVendorOnly = skippedVendorOnly;
  lastGilletteStadiumParseStats.skippedGeneric = skippedGeneric;

  return rawItems;
}

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<string, RawItem>();

  for (const raw of rawItems) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...raw, vendorHint: raw.vendorHint });
      continue;
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

export async function parseGilletteStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastGilletteStadiumParseStats = {
    skippedVendorOnly: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    standsParsed: 0
  };

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "StadiumSlop/1.0 (venue menu import)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Gillette concessions page: ${response.status}`);
  }

  const html = await response.text();
  const rawItems = parseGilletteConcessionsHtml(html);
  const items = mergeItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastGilletteStadiumParseStats.skippedBeverages
  };
}
