/**
 * DICK'S Sporting Goods Park (Colorado Rapids — MLS) menu parser.
 *
 * Source: iMenuPro QR concessions menu (SvelteKit dehydrated payload).
 *   https://qr.imenupro.com/1rha-7
 *   https://qr.imenupro.com/1rha-7/__data.json
 *
 * Static HTML is a shell; menu items live in `__data.json`. Beverage-only
 * menus and drink-vendor sections are skipped. Vendor/section headings from
 * the order stream become vendorName / location hints only.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "dick-s-sporting-goods-park";
const VENUE_NAME = "DICK'S Sporting Goods Park";
const SOURCE_URL = "https://qr.imenupro.com/1rha-7";
const DATA_URL = "https://qr.imenupro.com/1rha-7/__data.json";

export let lastDickSSportingGoodsParkParseStats = {
  skippedModifiers: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  skippedSides: 0,
  skippedMenus: 0,
  deduped: 0
};

type ImenuProHeading = {
  id: string;
  text?: string | null;
  type?: string | null;
};

type ImenuProFoodItem = {
  id: string | number;
  name?: string | null;
  description?: string | null;
  extras?: string | null;
  price?: string | null;
};

type ImenuProMenu = {
  order?: Array<string | number>;
  headings?: ImenuProHeading[];
  fooditems?: ImenuProFoodItem[];
};

type ImenuProPayload = {
  menus?: Array<{ menu?: ImenuProMenu }>;
};

type SvelteKitDataFile = {
  nodes: Array<null | { type?: string; data?: unknown }>;
};

type AccumulatedItem = {
  name: string;
  description?: string;
  price?: number;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHints: Set<string>;
  dietary: VenueMenuDietaryTag[];
  tags: string[];
};

const SKIP_MENU_TITLE_RE =
  /non-alcoholic beverage|alcoholic beverage/i;

const DRINK_VENDOR_RE =
  /\b(cocktail|chillco|lariat\s+lodge|brewing\s+co|eighteen76|mixed-up)\b/i;

const DRINK_NAME_RE =
  /\b(beer|wine|cocktail|margarita|mojito|mule|spritz|seltzer|vodka|whiskey|bourbon|rum|gin|tequila|ipa|lager|ale|stout|pilsner|draft|soda|pepsi|gatorade|aquafina|dr\.?\s*pepper|starry|crush|root\s+beer|bottled\s+water|lemonade|coffee|tea|beverage|slush|daiquiri|hard\s+tea|bud\s*light|budweiser|coors|miller|hawaiian|hot\s+chocolate|boozy|spiked)\b/i;

const GENERIC_SNACK_RE =
  /^(popcorn|pretzel\s*&\s*cheese|tostitos|nachos\s*&\s*cheese|bomb\s+pop|nerds|cheetos|dorito|sour\s+patch|lay'?s|bagged\s+candy|roasted\s+nuts|simply\s+nuts|freeze\s+dried\s+snacks)/i;

const SIDE_CONDIMENT_RE =
  /^(cole\s+slaw|curry|dipping\s+sauce|chips\s*\(fries\)|house\s+made\s+salsas?)$/i;

const ALLERGY_RE = /allergy|allergen/i;

const LOCAL_SPECIALTY_RE =
  /\b(colorado|carolina|green\s+chili|cheerwine|bojangles|pueblo|denver)\b/i;

const VENDOR_DISPLAY_FIXES: Record<string, string> = {
  "gb fish & chips": "GB Fish & Chips",
  "taco bron": "Taco Bron",
  "big belly brothers bbq": "Big Belly Brothers BBQ",
  "maria empandas": "Maria Empanada",
  "infinitus pie": "Infinitus Pie",
  "freddy's frozen custard & steakburgers": "Freddy's Frozen Custard & Steakburgers",
  "simply nuts snacks & sweets": "Simply Nuts Snacks & Sweets",
  "jake's baby d mini donuts": "Jake's Baby D's Mini Donuts",
  "burgundy bites": "Burgundy Bites"
};

function resolveSvelteKitData(root: unknown): unknown {
  if (!Array.isArray(root)) return root;

  const arr = root as unknown[];
  const memo = new Map<number, unknown>();

  function resolveValue(val: unknown, stack: Set<number>): unknown {
    if (typeof val !== "number" || val < 0 || val >= arr.length) {
      return val;
    }
    if (memo.has(val)) return memo.get(val);
    if (stack.has(val)) return null;

    stack.add(val);
    const raw = arr[val];

    let out: unknown;
    if (
      raw === null ||
      typeof raw === "string" ||
      typeof raw === "boolean"
    ) {
      out = raw;
    } else if (typeof raw === "number") {
      out = resolveValue(raw, stack);
    } else if (Array.isArray(raw)) {
      out = raw.map((entry) => resolveValue(entry, new Set(stack)));
    } else if (typeof raw === "object") {
      out = Object.fromEntries(
        Object.entries(raw as Record<string, unknown>).map(([k, v]) => [
          k,
          resolveValue(v, new Set(stack))
        ])
      );
    } else {
      out = raw;
    }

    memo.set(val, out);
    stack.delete(val);
    return out;
  }

  return resolveValue(0, new Set());
}

function cleanItemName(name: string): string {
  return name.replace(/^[-–•\s]+/, "").trim();
}

function formatVendorName(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const key = raw.trim().toLowerCase();
  if (VENDOR_DISPLAY_FIXES[key]) return VENDOR_DISPLAY_FIXES[key];
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bD\b/g, "d")
    .replace(/Freddy'D/g, "Freddy's")
    .replace(/Jake'S/g, "Jake's");
}

function parseLocation(...texts: Array<string | undefined>): string | undefined {
  for (const text of texts) {
    if (!text) continue;
    const match = text.match(/Location:\s*(.+)/i);
    if (match) return match[1].trim();
  }
  return undefined;
}

function parsePrice(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const match = raw.match(/\$(\d+(?:\.\d{2})?)/);
  return match ? Number.parseFloat(match[1]) : undefined;
}

function inferFare(name: string, description: string): VenueMenuFare {
  const text = `${name} ${description}`.toLowerCase();
  if (
    /\b(ice cream|cookie|pudding|churro|donut|doughnut|gelato|custard)\b/.test(
      text
    )
  ) {
    return "Desserts";
  }
  if (
    /\b(nachos?|fries|wings|tenders)\b/.test(text) &&
    !/\b(sandwich|burger|bowl|pizza|pie|taco)\b/.test(text)
  ) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(
  name: string,
  description: string
): VenueMenuDietaryTag[] {
  const text = `${name} ${description}`.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\bvegan\b/.test(text)) {
    tags.push("Vegan", "Vegetarian");
  } else if (/\bvegetarian\b/.test(text)) {
    tags.push("Vegetarian");
  }
  if (/\bgluten[- ]?free\b|\bgluten[- ]?friendly\b/.test(text)) {
    tags.push("Gluten Free");
  }
  return [...new Set(tags)];
}

type SkipReason =
  | "beverage"
  | "modifier"
  | "generic"
  | "vendor"
  | "side"
  | "empty";

function classifySkip(
  name: string,
  description: string,
  extras: string,
  vendor: string | undefined
): SkipReason | null {
  if (!name || name.length < 2 || ALLERGY_RE.test(name)) return "empty";

  if (vendor && DRINK_VENDOR_RE.test(vendor)) return "vendor";

  const blob = `${name} ${description} ${extras}`;
  if (DRINK_NAME_RE.test(blob)) return "beverage";
  if (SIDE_CONDIMENT_RE.test(name)) return "side";
  if (GENERIC_SNACK_RE.test(name)) return "generic";

  return null;
}

function recordSkip(reason: SkipReason): void {
  switch (reason) {
    case "beverage":
      lastDickSSportingGoodsParkParseStats.skippedBeverages += 1;
      break;
    case "modifier":
      lastDickSSportingGoodsParkParseStats.skippedModifiers += 1;
      break;
    case "generic":
    case "empty":
      lastDickSSportingGoodsParkParseStats.skippedGeneric += 1;
      break;
    case "vendor":
      lastDickSSportingGoodsParkParseStats.skippedVendorOnly += 1;
      break;
    case "side":
      lastDickSSportingGoodsParkParseStats.skippedSides += 1;
      break;
  }
}

function mergeItem(
  map: Map<string, AccumulatedItem>,
  incoming: AccumulatedItem
): void {
  const key = normalizeMenuItemName(incoming.name);
  const existing = map.get(key);
  if (!existing) {
    map.set(key, incoming);
    return;
  }

  lastDickSSportingGoodsParkParseStats.deduped += 1;
  if (!existing.description && incoming.description) {
    existing.description = incoming.description;
  }
  if (!existing.vendor && incoming.vendor) existing.vendor = incoming.vendor;
  for (const hint of incoming.vendorHints) existing.vendorHints.add(hint);
  for (const tag of incoming.dietary) {
    if (!existing.dietary.includes(tag)) existing.dietary.push(tag);
  }
  if (!existing.price && incoming.price) existing.price = incoming.price;
}

function parseMenus(payload: ImenuProPayload): Map<string, AccumulatedItem> {
  const accumulated = new Map<string, AccumulatedItem>();

  for (const menuWrap of payload.menus ?? []) {
    const menu = menuWrap.menu;
    if (!menu) continue;

    const title =
      menu.headings?.find((h) => h.type === "title")?.text?.trim() ?? "";
    if (SKIP_MENU_TITLE_RE.test(title)) {
      lastDickSSportingGoodsParkParseStats.skippedMenus +=
        menu.fooditems?.length ?? 0;
      continue;
    }

    const headings = new Map(
      (menu.headings ?? [])
        .filter((h) => h.id)
        .map((h) => [h.id, h] as const)
    );
    const itemsById = new Map(
      (menu.fooditems ?? []).map((item) => [String(item.id), item] as const)
    );

    let currentVendor: string | undefined;
    let currentHint: string | undefined;
    const sectionVendor =
      title && !SKIP_MENU_TITLE_RE.test(title) ? title : undefined;

    for (const orderId of menu.order ?? []) {
      const heading = headings.get(String(orderId));
      if (heading) {
        const text = heading.text?.trim() ?? "";
        const headingType = heading.type ?? "";

        if (headingType === "sub") {
          if (/^SERVING\s+/i.test(text)) {
            currentVendor = text.replace(/^SERVING\s+/i, "").trim();
          } else if (text && !/^LOCATED\b/i.test(text)) {
            currentHint = text;
          }
        } else if (
          headingType === "normal" &&
          text.length > 2 &&
          !/^(SERVING|LOCATED)\b/i.test(text)
        ) {
          currentHint = text;
        }
        continue;
      }

      const item = itemsById.get(String(orderId));
      if (!item) continue;

      const name = cleanItemName(item.name ?? "");
      const description = item.description?.trim() ?? "";
      const extras =
        typeof item.extras === "string" ? item.extras.trim() : "";
      const vendor = formatVendorName(currentVendor ?? sectionVendor);
      const location = parseLocation(description, extras);

      const skip = classifySkip(name, description, extras, vendor);
      if (skip) {
        recordSkip(skip);
        continue;
      }

      const hintParts = [currentHint, location].filter(Boolean);
      const tags = ["mls"];
      if (LOCAL_SPECIALTY_RE.test(`${name} ${description} ${vendor ?? ""}`)) {
        tags.push("local-specialty");
      }

      mergeItem(accumulated, {
        name,
        description: description || undefined,
        price: parsePrice(item.price),
        vendor,
        vendorHints: new Set(hintParts.length > 0 ? [hintParts.join("; ")] : []),
        dietary: inferDietary(name, description),
        tags,
        fare: inferFare(name, description)
      });
    }
  }

  return accumulated;
}

async function fetchImenuProPayload(): Promise<ImenuProPayload> {
  const res = await fetch(DATA_URL, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch iMenuPro data: ${res.status}`);
  }

  const file = (await res.json()) as SvelteKitDataFile;
  const node = file.nodes[1];
  if (!node?.data) {
    throw new Error("iMenuPro response missing dehydrated data node");
  }

  return resolveSvelteKitData(node.data) as ImenuProPayload;
}

export async function parseDickSSportingGoodsParkMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastDickSSportingGoodsParkParseStats = {
    skippedModifiers: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    skippedVendorOnly: 0,
    skippedSides: 0,
    skippedMenus: 0,
    deduped: 0
  };

  const payload = await fetchImenuProPayload();
  const accumulated = parseMenus(payload);

  const items: VenueMenuSourceItem[] = [...accumulated.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((raw) => ({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food" as const,
      vendorName: raw.vendor,
      vendorLocationHint:
        raw.vendorHints.size > 0
          ? [...raw.vendorHints].sort().join("; ")
          : undefined,
      dietaryTags: raw.dietary,
      price: raw.price,
      sourceUrl: url
    }));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastDickSSportingGoodsParkParseStats.skippedBeverages
  };
}
