/**
 * SoFi Stadium / Hollywood Park (LA Rams, LA Chargers, FIFA World Cup 2026) menu parser.
 *
 * The official dining guide is a Flutter web app (FlutterFlow) backed by public
 * Google Cloud Firestore collections:
 *
 *   GET firestore.googleapis.com/.../v2_menu_items
 *   GET firestore.googleapis.com/.../v2_locations
 *
 * Beverages live in `v2_beverages` and are not imported. Bar/drink-cart locations
 * have no food rows in `v2_menu_items`.
 *
 * Source: https://dining.hollywoodparkca.com
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "sofi-stadium";
const VENUE_NAME = "SoFi Stadium";
const SOURCE_URL = "https://dining.hollywoodparkca.com";

const FIRESTORE_PROJECT = "prj-hwp-its-stadium-fb-finder";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents`;

/** Drink-only stands (no food SKUs in Firestore; guard if data changes). */
const BEVERAGE_ONLY_LOCATION_IDS = new Set([
  "1800_tequila_bar",
  "beer_cart",
  "beer_wine_cart",
  "champagne_bar",
  "cocktail_bar",
  "crown_royal_bar",
  "frozen_drinks_cart",
  "grab_&_go_beer",
  "johnnie_walker_bar",
  "michelada_cart",
  "neighborhood_bar",
  "pacifico_bar",
  "south_hall_of_fame_bar",
  "the_hilt_wine_bar",
  "ultra_gold_bars",
  "vending_machine"
]);

const ORPHAN_LOCATION_NAMES: Record<string, string> = {
  touchdown_treats: "Touchdown Treats",
  stadium_favorites: "Stadium Favorites",
  sushi: "Sushi"
};

export let lastSofiStadiumParseStats = {
  firestoreMenuRows: 0,
  firestoreLocations: 0,
  skippedModifiers: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  skippedBarLocation: 0,
  deduped: 0
};

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type SofiMenuItem = {
  _id: string;
  name: string;
  description?: string;
  location_id?: string;
  vegan_flag?: boolean;
  vegetarian_flag?: boolean;
  gluten_flag?: boolean;
  featured_flag?: boolean;
  optimized_image?: string;
};

type SofiLocation = {
  _id: string;
  id: string;
  name: string;
  level?: string;
  is_bar?: boolean;
  category?: string[];
};

type AccumulatedItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHints: Set<string>;
  dietary: VenueMenuDietaryTag[];
  imageUrl?: string;
};

const DRINK_NAME_RE =
  /\b(beer|wine|cocktail|margarita|mule|spritz|seltzer|hard\s+tea|vodka|whiskey|bourbon|rum|gin|tequila|cuervo|ipa|lager|ale|stout|pilsner|draft|soda|coke|pepsi|sprite|fanta|dr\.?\s*pepper|mountain\s+dew|lemonade|limeade|iced\s+tea|sweet\s+tea|coffee|latte|espresso|hot\s+chocolate|bottled\s+water|\bwater\b|gatorade|powerade|red\s+bull|monster|energy\s+drink|juice|beverage|dirty\s+cola|dirty\s+soda|ram-rita|bolt-tail|highball|michelada|champagne|tequila\s+bar|johnnie\s+walker|agua\s+fresca)\b/i;

const VENDOR_ONLY_NAME_RE =
  /^grab\s+and\s+go\b|^(salads?\s+and\s+sandwiches?|market\s+grill|general\s+concessions)$/i;

const MODIFIER_NAME_RE =
  /^(add|extra|no\s|substitute|sub\b|side\s+of|upgrade|\+)\b/i;

const GENERIC_SNACK_RE =
  /^(popcorn|candy|chips|bag\s+of\s+chips|peanuts|trail\s+mix|skittles|m&ms?|cheetos|fritos|doritos|cotton\s+candy|sour\s+patch|nerds|roasted\s+peanuts|pretzel\s+sticks?|chocolate\s+chip\s+cookie|cookie)\b/i;

const COMBO_RE = /\b(combo\s+meal|meal\s+deal|\bcombo\b)\b/i;

const MERCH_RE =
  /\b(jersey|hat|scarf|program|souvenir|merchandise|gift\s+card|uber\s+eats|zippin)\b/i;

const LOCAL_SPECIALTY_RE =
  /\b(la\s+street\s+dog|olvera|sawtelle|fairfax|san\s+vicente|twinkie|char\s+siu|haupia|pastrami|al\s+pastor|teriyaki|hollywood|inglewood|sofi|california|socal|texas\s+twinkie)\b/i;

function firestoreFieldValue(field: FirestoreValue | undefined): unknown {
  if (!field) return undefined;
  if ("stringValue" in field && field.stringValue !== undefined) {
    return field.stringValue;
  }
  if ("booleanValue" in field && field.booleanValue !== undefined) {
    return field.booleanValue;
  }
  if ("integerValue" in field && field.integerValue !== undefined) {
    return Number(field.integerValue);
  }
  if ("doubleValue" in field && field.doubleValue !== undefined) {
    return field.doubleValue;
  }
  if ("timestampValue" in field && field.timestampValue !== undefined) {
    return field.timestampValue;
  }
  if (field.arrayValue?.values) {
    return field.arrayValue.values.map((v) => firestoreFieldValue(v));
  }
  return undefined;
}

function parseFirestoreDoc<T extends Record<string, unknown>>(
  doc: FirestoreDocument
): T {
  const out: Record<string, unknown> = {
    _id: doc.name.split("/").pop() ?? ""
  };
  for (const [key, field] of Object.entries(doc.fields ?? {})) {
    out[key] = firestoreFieldValue(field);
  }
  return out as T;
}

async function fetchFirestoreCollection(
  collection: string
): Promise<FirestoreDocument[]> {
  const docs: FirestoreDocument[] = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({ pageSize: "300" });
    if (pageToken) params.set("pageToken", pageToken);
    const url = `${FIRESTORE_BASE}/${collection}?${params}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "StadiumSlop/1.0 (venue-menu-import)" }
    });
    if (!res.ok) {
      throw new Error(`Firestore ${collection} failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      documents?: FirestoreDocument[];
      nextPageToken?: string;
    };
    docs.push(...(data.documents ?? []));
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return docs;
}

function formatOrphanLocationName(locationId: string): string {
  if (ORPHAN_LOCATION_NAMES[locationId]) {
    return ORPHAN_LOCATION_NAMES[locationId];
  }
  return locationId
    .replace(/_/g, " ")
    .replace(/\b&\b/g, "&")
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function resolveVendor(
  locationId: string | undefined,
  locationsById: Map<string, SofiLocation>
): { vendor: string; locationHint?: string } {
  if (!locationId) {
    return { vendor: "General Concessions" };
  }

  const loc = locationsById.get(locationId);
  if (loc) {
    const hintParts = [loc.level].filter(Boolean);
    return {
      vendor: loc.name.trim(),
      locationHint: hintParts.length > 0 ? hintParts.join("; ") : undefined
    };
  }

  return {
    vendor: formatOrphanLocationName(locationId),
    locationHint: undefined
  };
}

function canonicalItemName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*[-–]\s*(Small|Medium|Large|Regular|XL|XXL)\s*$/i, "")
    .replace(/\s+Basket\s*$/i, "")
    .replace(/\s+Combo\s+Meal\s*$/i, "")
    .trim();
}

function inferFare(name: string, description: string): VenueMenuFare {
  const text = `${name} ${description}`.toLowerCase();
  if (
    /\b(ice cream|cookie|brownie|churro|pudding|pie|cheesecake|dessert|tart|cake|donut|doughnut|soft serve|sundae|haupia)\b/.test(
      text
    )
  ) {
    return "Desserts";
  }
  if (
    /\b(nachos?|fries|pretzel|wings|tenders|chips|popcorn|egg roll|antipasto)\b/.test(
      text
    ) &&
    !/\b(sandwich|burger|bowl|pizza|hot dog|brat|sausage|torta|burrito)\b/.test(
      text
    )
  ) {
    return "Snacks";
  }
  return "Meals";
}

function dietaryFromFlags(item: SofiMenuItem): VenueMenuDietaryTag[] {
  const tags: VenueMenuDietaryTag[] = [];
  if (item.vegan_flag) tags.push("Vegan", "Vegetarian");
  else if (item.vegetarian_flag) tags.push("Vegetarian");
  if (item.gluten_flag) tags.push("Gluten Free");
  return tags;
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
  | "bar-location"
  | "merch"
  | "combo"
  | "empty";

function classifySkip(
  item: SofiMenuItem,
  vendor: string,
  locationId: string | undefined
): SkipReason | null {
  const name = item.name?.trim() ?? "";
  if (!name) return "empty";
  if (locationId && BEVERAGE_ONLY_LOCATION_IDS.has(locationId)) {
    return "bar-location";
  }

  const desc = (item.description ?? "").trim();
  if (DRINK_NAME_RE.test(name) || DRINK_NAME_RE.test(desc)) return "beverage";
  if (MODIFIER_NAME_RE.test(name)) return "modifier";
  if (GENERIC_SNACK_RE.test(name)) return "generic";
  if (COMBO_RE.test(name)) return "combo";
  if (MERCH_RE.test(name) || MERCH_RE.test(desc)) return "merch";
  if (VENDOR_ONLY_NAME_RE.test(name)) return "vendor-only";
  if (isVendorOnlyName(name, vendor)) return "vendor-only";

  return null;
}

function recordSkip(reason: SkipReason): void {
  switch (reason) {
    case "modifier":
      lastSofiStadiumParseStats.skippedModifiers += 1;
      break;
    case "beverage":
      lastSofiStadiumParseStats.skippedBeverages += 1;
      break;
    case "generic":
    case "merch":
    case "combo":
    case "empty":
      lastSofiStadiumParseStats.skippedGeneric += 1;
      break;
    case "vendor-only":
      lastSofiStadiumParseStats.skippedVendorOnly += 1;
      break;
    case "bar-location":
      lastSofiStadiumParseStats.skippedBarLocation += 1;
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

  lastSofiStadiumParseStats.deduped += 1;
  if (!existing.description && incoming.description) {
    existing.description = incoming.description;
  }
  if (!existing.vendor && incoming.vendor) existing.vendor = incoming.vendor;
  for (const hint of incoming.vendorHints) existing.vendorHints.add(hint);
  for (const tag of incoming.dietary) {
    if (!existing.dietary.includes(tag)) existing.dietary.push(tag);
  }
  if (!existing.imageUrl && incoming.imageUrl) {
    existing.imageUrl = incoming.imageUrl;
  }
}

export async function parseSofiStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastSofiStadiumParseStats = {
    firestoreMenuRows: 0,
    firestoreLocations: 0,
    skippedModifiers: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    skippedVendorOnly: 0,
    skippedBarLocation: 0,
    deduped: 0
  };

  const [menuDocs, locationDocs] = await Promise.all([
    fetchFirestoreCollection("v2_menu_items"),
    fetchFirestoreCollection("v2_locations")
  ]);

  const menuItems = menuDocs.map((d) => parseFirestoreDoc<SofiMenuItem>(d));
  const locations = locationDocs.map((d) => parseFirestoreDoc<SofiLocation>(d));

  lastSofiStadiumParseStats.firestoreMenuRows = menuItems.length;
  lastSofiStadiumParseStats.firestoreLocations = locations.length;

  const locationsById = new Map<string, SofiLocation>();
  for (const loc of locations) {
    const id = loc.id ?? loc._id;
    if (id) locationsById.set(id, loc);
  }

  const accumulated = new Map<string, AccumulatedItem>();

  for (const item of menuItems) {
    const locationId = item.location_id;
    const { vendor, locationHint } = resolveVendor(locationId, locationsById);

    const skip = classifySkip(item, vendor, locationId);
    if (skip) {
      recordSkip(skip);
      continue;
    }

    const displayName = canonicalItemName(item.name);
    const desc = (item.description ?? "").trim();
    const dietary = dietaryFromFlags(item);

    const hints = new Set<string>();
    if (locationHint) hints.add(locationHint);

    mergeItem(accumulated, {
      name: displayName,
      description: desc || undefined,
      fare: inferFare(displayName, desc),
      vendor,
      vendorHints: hints,
      dietary,
      imageUrl: item.optimized_image
    });
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
      imageUrl: raw.imageUrl,
      dietaryTags: raw.dietary,
      sourceUrl: url
    }));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastSofiStadiumParseStats.skippedBeverages
  };
}
