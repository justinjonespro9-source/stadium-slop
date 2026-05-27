/**
 * Bank of America Stadium (Charlotte FC — MLS, Carolina Panthers — NFL) menu parser.
 *
 * Menu data is fetched live from the VenueNext / OrderNext ordering API used by
 * https://clt.ordernext.com (organization `car`, instance `clt`).
 *
 * Flow:
 *   1. Anonymous guest token — POST car.principal.prd.api.vnops.net/users/token
 *   2. Stand/menu index — GET stadium.prd.crux.vnops.net/ordering_api/v1/stands
 *   3. Per-menu items — GET …/ordering_api/v1/menu/{menuUuid}
 *
 * Modifiers, add-ons, beverages, and vendor-only rows are excluded. Duplicate
 * SKUs and size/combo variants are consolidated to one reviewable item name.
 *
 * Source: https://clt.ordernext.com
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "bank-of-america-stadium";
const VENUE_NAME = "Bank of America Stadium";
const SOURCE_URL = "https://clt.ordernext.com";

const ORGANIZATION = "car";
const INSTANCE = "clt";
const VENUE_UUID = "7f5b3d76-7087-4382-a93b-2b680d9f7283";
const PRINCIPAL_API = "https://car.principal.prd.api.vnops.net";
const ORDERING_API = "https://stadium.prd.crux.vnops.net/ordering_api/v1";

/** Last parse skip stats (for dry-run reporting). */
export let lastBankOfAmericaStadiumParseStats = {
  skippedModifiers: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  skippedInternal: 0,
  deduped: 0
};

type OrderNextMenuSummary = {
  uuid: string;
  name: string;
  stand_name?: string | null;
  product_type?: string | null;
  is_available?: boolean;
  section?: string | null;
};

type OrderNextCategory = {
  item_category_uuid: string;
  name: string;
  modifier?: boolean;
};

type OrderNextMenuItem = {
  name: string;
  description?: string | null;
  marketing_description?: string | null;
  is_alcohol?: boolean;
  is_modifier?: boolean;
  modifier?: boolean;
  variants?: Array<{
    inventory_state?: string;
    name?: string;
    price_in_cents?: number;
  }>;
  item_category_uuids?: string[];
  metadata?: Array<{ name?: string; value?: string }>;
};

type OrderNextMenuPayload = {
  menu?: OrderNextMenuSummary;
  categories?: OrderNextCategory[];
  items?: OrderNextMenuItem[];
};

type OrderNextStandsPayload = {
  menus?: OrderNextMenuSummary[];
};

type AccumulatedItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHints: Set<string>;
  dietary: VenueMenuDietaryTag[];
  tags: string[];
  price?: number;
};

const DRINK_CATEGORY_RE =
  /\b(beer|wine|cocktail|seltzer|beverage|soft drink|drinks|bottled water|water|coffee|tea|lemonade|margarita)\b/i;

const DRINK_NAME_RE =
  /\b(beer|wine|cocktail|margarita|mule|spritz|seltzer|hard\s+tea|vodka|whiskey|bourbon|rum|gin|tequila|cuervo|ipa|lager|ale|stout|pilsner|draft|soda|coke|pepsi|sprite|fanta|dr\.?\s*pepper|mountain\s+dew|lemonade|limeade|iced\s+tea|sweet\s+tea|coffee|latte|espresso|hot\s+chocolate|bottled\s+water|\bwater\b|gatorade|powerade|red\s+bull|monster|energy\s+drink|juice|beverage|dirty\s+cola|dirty\s+soda)\b/i;

const MODIFIER_NAME_RE =
  /^(add|extra|no\s|substitute|sub\b|side\s+of|upgrade|\+)\b/i;

const GENERIC_SNACK_RE =
  /^(popcorn|candy|chips|bag\s+of\s+chips|peanuts|trail\s+mix|skittles|m&ms?|peanut\s+m&ms?|airheads|regular\s+lays|bbq\s+lays|cheetos|fritos|doritos|cotton\s+candy|sour\s+patch|nerds|roasted\s+peanuts|cookie)\b/i;

const PACKAGED_SNACK_RE =
  /\b\d+(\.\d+)?\s*oz\b|\bsnack\s+meat\s+&\s+cheese\s+tray\b|\bdried\s+mango\s+bites\b/i;

const CONDIMENT_RE =
  /^(extra\s+|add\s+)(cheese|bacon|ranch|sauce|ketchup|mustard|mayo)\b/i;

const SIDE_ONLY_RE =
  /^(guacamole|salsa\s+verde|salsa\s+rojo|sour\s+cream|warm\s+chips\s+and\s+(queso|salsa)|creamy\s+sweet\s+and\s+sour\s+coleslaw)$/i;

const INTERNAL_SKU_RE =
  /^[A-Z]\s+[A-Z]{2,4}\s|\b(ENT|BEF|FSI|FLH|SNK|CUP)\b/i;

const MERCH_RE =
  /\b(jersey|hat|scarf|program|souvenir|merchandise|gift\s+card)\b/i;

const LOCAL_SPECIALTY_RE =
  /\b(carolina|charlotte|queen\s+city|cheerwine|bojangles|piedmont|duke'?s?|pimento|nc\s+bbq|southern)\b/i;

const DRINK_CATEGORIES = new Set(
  [
    "beer",
    "wine",
    "cocktails",
    "beverages",
    "bottled water",
    "soft drinks",
    "drinks",
    "coffee",
    "tea",
    "seltzer",
    "margarita",
    "frozen drinks"
  ].map((s) => s.toLowerCase())
);

function orderNextTimestamp(): string {
  const d = new Date();
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  const base = d.toISOString().slice(0, 19).replace("T", "T");
  return `${base}.${ms}${sign}${hh}:${mm}`;
}

async function fetchAnonymousToken(): Promise<string> {
  const res = await fetch(`${PRINCIPAL_API}/users/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      provider: "vn_anonymous",
      instance: INSTANCE,
      currentTimestamp: orderNextTimestamp()
    })
  });
  if (!res.ok) {
    throw new Error(`OrderNext token request failed: ${res.status}`);
  }
  const raw = (await res.json()) as string;
  return typeof raw === "string" ? raw : String(raw);
}

async function orderNextGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${ORDERING_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`OrderNext API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function parseStandVendor(
  standName: string | null | undefined,
  menuName: string
): { vendor: string; hint?: string } {
  const source = (standName ?? menuName).trim();
  const secPipe = source.match(/^(?:Sec\s*\|\s*)?(\d+[A-Z]?)\s+(.+)$/i);
  if (secPipe) {
    return {
      vendor: secPipe[2].trim(),
      hint: `Section ${secPipe[1]}`
    };
  }

  const menuSec = menuName.match(/^(\d+[A-Z]?)\s*[-–]\s*(.+?)(?:\s*[-–]|$)/i);
  if (menuSec) {
    return {
      vendor: menuSec[2].replace(/\s*[-–].*$/, "").trim(),
      hint: `Section ${menuSec[1]}`
    };
  }

  const cleaned = source.replace(/^Sec\s*\|\s*/i, "").trim();
  const pipeParts = cleaned.split("|").map((p) => p.trim()).filter(Boolean);
  if (pipeParts.length > 1) {
    const vendorPart = pipeParts.find(
      (p) => !/quickpay|club\s+level|ticket\s+access/i.test(p)
    );
    return {
      vendor: vendorPart ?? pipeParts[0],
      hint: pipeParts.filter((p) => p !== vendorPart).join("; ") || undefined
    };
  }

  const stripped = cleaned
    .replace(/^\s*[-–]\s*/, "")
    .replace(/\s*\*?club\s+level.*$/i, "")
    .trim();

  return { vendor: stripped || menuName };
}

function canonicalItemName(name: string): string {
  return name
    .replace(/^z(?=[A-Z])/, "")
    .replace(/\s*[-–]\s*(Small|Medium|Large|Regular|XL|XXL)\s*$/i, "")
    .replace(/\s+Basket\s*$/i, "")
    .replace(/\s+Combo\s+Meal\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function itemDescription(item: OrderNextMenuItem): string {
  return [item.marketing_description, item.description]
    .filter((s) => s && s.trim())
    .join(" ")
    .trim();
}

function inferFare(name: string, description: string): VenueMenuFare {
  const text = `${name} ${description}`.toLowerCase();
  if (/\b(ice cream|cookie|brownie|churro|pudding|pie|cheesecake|dessert|banana pudding|dole whip)\b/.test(text)) {
    return "Desserts";
  }
  if (/\b(nachos?|fries|pretzel|wings|tenders|chips|popcorn|egg roll)\b/.test(text) && !/\b(sandwich|burger|bowl|pizza|ramen|hot dog|brat|sausage)\b/.test(text)) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(
  name: string,
  description: string,
  categoryNames: string[]
): VenueMenuDietaryTag[] {
  const text = `${name} ${description} ${categoryNames.join(" ")}`.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\b(vegan|plant[- ]?based|impossible)\b/.test(text)) {
    tags.push("Vegan", "Vegetarian");
  } else if (/\bvegetarian\b/.test(text)) {
    tags.push("Vegetarian");
  }
  if (/\bgluten[- ]?free\b/.test(text)) {
    tags.push("Gluten Free");
  }
  return [...new Set(tags)];
}

function isVendorOnlyName(name: string, vendor: string): boolean {
  const n = normalizeMenuItemName(name);
  const v = normalizeMenuItemName(vendor);
  if (!n || !v) return false;
  if (n === v) return true;
  if (v.length > 4 && (n.includes(v) || v.includes(n)) && n.split(" ").length <= 3) {
    return true;
  }
  return false;
}

type SkipReason =
  | "modifier"
  | "beverage"
  | "generic"
  | "vendor-only"
  | "internal"
  | "merch"
  | "unavailable"
  | "empty";

function classifySkip(
  item: OrderNextMenuItem,
  categoryNames: string[],
  vendor: string
): SkipReason | null {
  const name = item.name?.trim() ?? "";
  if (!name) return "empty";
  if (item.is_modifier || item.modifier) return "modifier";
  if (item.is_alcohol) return "beverage";

  const desc = itemDescription(item);
  const catsLower = categoryNames.map((c) => c.toLowerCase());

  if (DRINK_NAME_RE.test(name) || DRINK_NAME_RE.test(desc)) return "beverage";
  if (catsLower.some((c) => DRINK_CATEGORIES.has(c) || DRINK_CATEGORY_RE.test(c))) {
    return "beverage";
  }
  if (MODIFIER_NAME_RE.test(name) || CONDIMENT_RE.test(name)) return "modifier";
  if (SIDE_ONLY_RE.test(name)) return "modifier";
  if (GENERIC_SNACK_RE.test(name)) return "generic";
  if (PACKAGED_SNACK_RE.test(name)) return "generic";
  if (/\bbeans\b/i.test(name) && /\bcoffee|perk\b/i.test(`${vendor} ${desc}`)) {
    return "beverage";
  }
  if (INTERNAL_SKU_RE.test(name)) return "internal";
  if (MERCH_RE.test(name) || MERCH_RE.test(desc)) return "merch";
  if (isVendorOnlyName(name, vendor)) return "vendor-only";

  const variants = item.variants ?? [];
  if (
    variants.length > 0 &&
    variants.every((v) => v.inventory_state === "unavailable")
  ) {
    return "unavailable";
  }

  return null;
}

function centsToDollars(cents: number | undefined): number | undefined {
  if (cents == null || cents <= 0) return undefined;
  return Math.round(cents) / 100;
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

  lastBankOfAmericaStadiumParseStats.deduped += 1;
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

function recordSkip(reason: SkipReason): void {
  switch (reason) {
    case "modifier":
      lastBankOfAmericaStadiumParseStats.skippedModifiers += 1;
      break;
    case "beverage":
      lastBankOfAmericaStadiumParseStats.skippedBeverages += 1;
      break;
    case "generic":
    case "merch":
    case "unavailable":
    case "empty":
      lastBankOfAmericaStadiumParseStats.skippedGeneric += 1;
      break;
    case "vendor-only":
      lastBankOfAmericaStadiumParseStats.skippedVendorOnly += 1;
      break;
    case "internal":
      lastBankOfAmericaStadiumParseStats.skippedInternal += 1;
      break;
  }
}

export async function parseBankOfAmericaStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastBankOfAmericaStadiumParseStats = {
    skippedModifiers: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    skippedVendorOnly: 0,
    skippedInternal: 0,
    deduped: 0
  };

  const token = await fetchAnonymousToken();
  const index = await orderNextGet<OrderNextStandsPayload>(
    `/stands?organization_name=${ORGANIZATION}&venue_uuid=${VENUE_UUID}&show_sales_events=true`,
    token
  );

  const menus = (index.menus ?? []).filter(
    (m) => m.product_type === "Food" && m.is_available !== false
  );

  const accumulated = new Map<string, AccumulatedItem>();

  for (const menu of menus) {
    const payload = await orderNextGet<OrderNextMenuPayload>(
      `/menu/${menu.uuid}?organization_name=${ORGANIZATION}&venue_uuid=${VENUE_UUID}`,
      token
    );

    const categoryByUuid = new Map(
      (payload.categories ?? []).map((c) => [c.item_category_uuid, c.name])
    );
    const { vendor, hint: standHint } = parseStandVendor(
      menu.stand_name,
      menu.name
    );
    const locationHint =
      [standHint, menu.section].filter(Boolean).join("; ") || undefined;

    for (const item of payload.items ?? []) {
      const categoryNames = (item.item_category_uuids ?? [])
        .map((id) => categoryByUuid.get(id) ?? "")
        .filter(Boolean);

      const skip = classifySkip(item, categoryNames, vendor);
      if (skip) {
        recordSkip(skip);
        continue;
      }

      const displayName = canonicalItemName(item.name);
      const desc = itemDescription(item);
      const variant = item.variants?.find(
        (v) => v.inventory_state !== "unavailable"
      );
      const price = centsToDollars(variant?.price_in_cents);

      const tags = ["mls", "nfl"];
      const localText = `${displayName} ${desc} ${vendor}`;
      if (LOCAL_SPECIALTY_RE.test(localText)) {
        tags.push("local-specialty");
      }

      mergeItem(accumulated, {
        name: displayName,
        description: desc || undefined,
        fare: inferFare(displayName, desc),
        vendor,
        vendorHints: new Set(locationHint ? [locationHint] : []),
        dietary: inferDietary(displayName, desc, categoryNames),
        tags,
        price
      });
    }
  }

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
    skippedDrinks: lastBankOfAmericaStadiumParseStats.skippedBeverages
  };
}
