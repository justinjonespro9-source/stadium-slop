/**
 * Lincoln Financial Field (Philadelphia Eagles, FIFA World Cup 2026) menu parser.
 *
 * The official food page is WordPress HTML with section headers and `<ul>` item
 * lines (club level, action stations, local favorites). Local Favorites rows are
 * vendor prose expanded via curated item lists. Beer and liquor sections are skipped.
 *
 * Source: https://www.lincolnfinancialfield.com/food-and-concessions/
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "lincoln-financial-field";
const VENUE_NAME = "Lincoln Financial Field";
const SOURCE_URL =
  "https://www.lincolnfinancialfield.com/food-and-concessions/";

export let lastLincolnFinancialFieldParseStats = {
  sectionsParsed: 0,
  skippedModifiers: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  deduped: 0
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const SKIP_SECTION_RE = /^(premium\s+beer|liquor\s+bar)/i;

const DRINK_RE =
  /\b(beer|wine|cocktail|margarita|liquor|mixed\s+drinks?|water\s+ice|rita'?s|custard|soda|cola|coffee|red\s+bridge\s+beer)\b/i;

const GENERIC_SKIP_RE =
  /^(assorted\s+frito\s+lays|assorted\s+candy|popcorn\s+for\s+the\s+people|chips\s*&\s*salsa|chips\s*&\s*guacamole)$/i;

/** Vendor prose in Local Favorites → explicit menu items. */
const LOCAL_VENDOR_ITEMS: Array<{
  match: RegExp;
  vendor: string;
  items: string[];
}> = [
  {
    match: /9th\s+street\s+market/i,
    vendor: "9th Street Market",
    items: ["9th Street Market Pastel"]
  },
  {
    match: /america'?s\s+pie/i,
    vendor: "America's Pie Kitchen & Grille",
    items: ["The Vincent", "Cheesesteak", "Nachos", "Cheesesteak Eggroll"]
  },
  {
    match: /g'?day\s+gourmet|aussie\s+meat\s+pies/i,
    vendor: "G'Day Gourmet",
    items: ["Maui BBQ Meat Pie"]
  },
  {
    match: /chickie/i,
    vendor: "Chickie's & Pete's",
    items: ["CrabFries", "Buffalo Chicken Cutlets"]
  },
  {
    match: /philly\s+pretzel\s+factory/i,
    vendor: "Philly Pretzel Factory",
    items: ["Soft Pretzel"]
  },
  {
    match: /philip'?s\s+cheesesteaks/i,
    vendor: "Philip's Cheesesteaks",
    items: ["Philip's Cheesesteak", "Old School Cheesesteak"]
  },
  {
    match: /philly\s+cheesesteak\s+co/i,
    vendor: "Philly Cheesesteak Co",
    items: ["Cheesesteak"]
  },
  {
    match: /tacos\s+americanos/i,
    vendor: "Tacos Americanos",
    items: ["Nachos", "Tacos", "Churros"]
  },
  {
    match: /pierogie\s+place/i,
    vendor: "The Pierogie Place",
    items: [
      "Traditional Pierogi",
      "Bacon Pierogi",
      "Jalapeño Pierogi",
      "Kielbasa Pierogie Special"
    ]
  },
  {
    match: /wing\s+kitchen/i,
    vendor: "The Wing Kitchen",
    items: ["Bone-In Wings", "Boneless Wings"]
  },
  {
    match: /tony\s+luke/i,
    vendor: "Tony Luke's",
    items: ["Roast Pork Italian", "Cheesesteak"]
  },
  {
    match: /zac'?s\s+hamburgers/i,
    vendor: "Zac's Hamburgers",
    items: ["Zac's Burger"]
  },
  {
    match: /rita'?s\s+water\s+ice/i,
    vendor: "Rita's Water Ice",
    items: []
  }
];

function decodeHtml(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<sup>[^<]*<\/sup>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLocationHint(text: string): string | undefined {
  const located = text.match(
    /\blocated\s+at\s+sections?\s+(.+?)(?:\.|$|for\s+eagles)/i
  );
  if (located) {
    return `Sections ${located[1].replace(/\s+/g, " ").trim()}`;
  }
  const available = text.match(
    /\bavailable\s+at\s+sections?\s+(.+?)(?:\.|$|for)/i
  );
  if (available) {
    return `Sections ${available[1].replace(/\s+/g, " ").trim()}`;
  }
  const atSection = text.match(
    /\bat\s+sections?\s+([\d,\sand]+(?:\s*\([^)]+\))?)/i
  );
  if (atSection) {
    return `Sections ${atSection[1].replace(/\s+/g, " ").trim()}`;
  }
  return undefined;
}

function canonicalItemName(raw: string): string | null {
  const name = decodeHtml(raw)
    .replace(/\([^)]*\)/g, "")
    .replace(/\*+/g, "")
    .trim();

  if (!name || DRINK_RE.test(name) || GENERIC_SKIP_RE.test(name)) return null;

  const lower = name.toLowerCase().replace(/\s+/g, " ");

  const aliases: Record<string, string | null> = {
    "philly cheesesteak": "Philly Cheesesteak",
    "the carmichael bbq chicken": "Carmichael BBQ Chicken Sandwich",
    "the quick bbq pork": "BBQ Pulled Pork Sandwich",
    "the quick & carmichael": "BBQ Combo Sandwich",
    "the quick and carmichael": "BBQ Combo Sandwich",
    "big mozz sticks": "Big Mozz Sticks",
    "cheese calzone": "Cheese Calzone",
    "pepperoni calzone": "Pepperoni Calzone",
    "buffalo chicken calzone": "Buffalo Chicken Calzone",
    "blissful bowl": "Blissful Bowl",
    "buffalo cauliflower wrap": "Buffalo Cauliflower Wrap",
    "honey turkey panini": "Honey Turkey Panini",
    "kelly green jumbo cookie": "Kelly Green Jumbo Cookie",
    "jumbo black forest cake pop": "Jumbo Black Forest Cake Pop",
    "warm apple turnover": "Warm Apple Turnover",
    "gluten free brownie": "Gluten Free Brownie",
    "frito pie burrito": "Frito Pie Burrito",
    "mission chicken burrito": "Mission Chicken Burrito",
    "vegan burrito": "Vegan Burrito",
    "jerk chicken sandwich": "Jerk Chicken Sandwich",
    "philly pressed italiano sandwich": "Philly Pressed Italiano Sandwich",
    "9th street market pastel": "9th Street Market Pastel",
    "traditional pierogi": "Traditional Pierogi",
    "bacon pierogi": "Bacon Pierogi",
    "jalapeño pierogi": "Jalapeño Pierogi",
    "jalapeno pierogi": "Jalapeño Pierogi",
    "bone-in wings": "Bone-In Wings",
    "boneless wings": "Boneless Wings",
    "vegetarian burgers": "Vegetarian Burger",
    "kosher hot dog": "Kosher Hot Dog",
    "gluten-free items": null,
    "gluten free items": null
  };

  if (lower in aliases) return aliases[lower] ?? null;

  if (/^the\s+/i.test(name)) {
    const stripped = name.replace(/^the\s+/i, "").trim();
    if (stripped.length > 3) return canonicalItemName(stripped);
  }

  if (name.length <= 80) {
    return name
      .split(/\s+/)
      .map((w) => {
        if (/^(bbq|gf|nj|ny)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ")
      .replace(/Philly/g, "Philly")
      .replace(/Bbq/g, "BBQ");
  }

  return null;
}

function inferFare(name: string): VenueMenuFare {
  const text = name.toLowerCase();
  if (
    /\b(cookie|brownie|turnover|cake\s+pop|churro|dessert|pie)\b/.test(text) &&
    !/\b(meat\s+pie|bbq\s+meat\s+pie)\b/.test(text)
  ) {
    return "Desserts";
  }
  if (
    /\b(fries|nachos|pretzel|wings|chips|pierogi)\b/.test(text) &&
    !/\b(sandwich|burger|burrito|cheesesteak|hoagie|calzone)\b/.test(text)
  ) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(
  name: string,
  description: string,
  vendor: string
): VenueMenuDietaryTag[] {
  const text = `${name} ${description} ${vendor}`.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\bvegan\b/.test(text)) tags.push("Vegan", "Vegetarian");
  else if (/\bvegetarian\b|veggie\b/.test(text)) tags.push("Vegetarian");
  if (/\bgluten\s*free\b|\bgf\b/.test(text)) tags.push("Gluten Free");
  return [...new Set(tags)];
}

function parseItemLine(
  line: string,
  vendor: string
): RawItem | null {
  const decoded = decodeHtml(line);
  if (!decoded || DRINK_RE.test(decoded)) {
    if (DRINK_RE.test(decoded)) {
      lastLincolnFinancialFieldParseStats.skippedBeverages += 1;
    }
    return null;
  }

  let namePart = "";
  let rest = "";

  const dash = decoded.match(/^([^–—-]+?)\s*[–—-]\s*(.+)$/);
  if (dash) {
    namePart = dash[1].trim();
    rest = dash[2].trim();
  } else {
    const served = decoded.match(/^(.+?)\s+served\s+with\s+(.+)$/i);
    if (served) {
      namePart = served[1].trim();
      rest = served[2].trim();
    } else if (decoded.length <= 80 && !/located\s+at|featuring/i.test(decoded)) {
      namePart = decoded.replace(/\blocated\s+at\s+sections?.+$/i, "").trim();
      rest = "";
    } else {
      return null;
    }
  }

  const itemName = canonicalItemName(namePart);
  if (!itemName) {
    if (GENERIC_SKIP_RE.test(namePart)) {
      lastLincolnFinancialFieldParseStats.skippedGeneric += 1;
    }
    return null;
  }

  const locationHint = extractLocationHint(`${rest} ${decoded}`);
  const description = rest
    .replace(/\blocated\s+at\s+sections?.+$/i, "")
    .replace(/\bavailable\s+at\s+sections?.+$/i, "")
    .trim();

  return {
    name: itemName,
    description: description || undefined,
    vendor,
    vendorHint: locationHint,
    fare: inferFare(itemName),
    dietary: inferDietary(itemName, description, vendor)
  };
}

function expandLocalFavoriteLine(line: string): RawItem[] {
  const decoded = decodeHtml(line);
  if (DRINK_RE.test(decoded)) {
    lastLincolnFinancialFieldParseStats.skippedBeverages += 1;
    return [];
  }

  const locationHint = extractLocationHint(decoded);

  for (const entry of LOCAL_VENDOR_ITEMS) {
    if (!entry.match.test(decoded)) continue;
    if (entry.items.length === 0) {
      lastLincolnFinancialFieldParseStats.skippedBeverages += 1;
      return [];
    }
    return entry.items.map((name) => ({
      name,
      vendor: entry.vendor,
      vendorHint: locationHint,
      fare: inferFare(name),
      dietary: inferDietary(name, "", entry.vendor)
    }));
  }

  lastLincolnFinancialFieldParseStats.skippedVendorOnly += 1;
  return [];
}

function parseDietaryOptionLine(line: string): RawItem[] {
  const decoded = decodeHtml(line);
  const items: RawItem[] = [];
  const locationHint = extractLocationHint(decoded);

  if (/gluten[- ]?free/i.test(decoded)) {
    if (/brownie/i.test(decoded)) {
      items.push({
        name: "Gluten Free Brownie",
        vendor: "Gluten-Free Market",
        vendorHint: locationHint ?? "Sections 120, 216",
        fare: "Desserts",
        dietary: ["Gluten Free"]
      });
    }
    if (/hot\s+dog/i.test(decoded)) {
      items.push({
        name: "Gluten Free Hot Dog",
        vendor: "Gluten-Free Market",
        vendorHint: locationHint ?? "Sections 120, 216",
        fare: "Meals",
        dietary: ["Gluten Free"]
      });
    }
    return items;
  }

  if (/vegetarian\s+burgers?/i.test(decoded)) {
    items.push({
      name: "Vegetarian Burger",
      vendor: "Plant-Based Favorites",
      vendorHint: locationHint ?? "Section 110",
      fare: "Meals",
      dietary: ["Vegetarian"]
    });
    return items;
  }

  if (/kosher/i.test(decoded)) {
    items.push({
      name: "Kosher Hot Dog",
      vendor: "Kosher Grill",
      vendorHint: locationHint ?? "Section 116",
      fare: "Meals"
    });
    return items;
  }

  return items;
}

function normalizeSectionVendor(header: string): string {
  return decodeHtml(header)
    .replace(/\s+located\s+in\s+sections?.+$/i, "")
    .replace(/\s+locations?$/i, "")
    .trim();
}

export function parseLincolnFinancialFieldHtml(html: string): RawItem[] {
  const rawItems: RawItem[] = [];

  const contentMatch = html.match(
    /<div class="left leftContent">([\s\S]*?)<\/div>\s*<div id="comments"/i
  );
  const content = contentMatch?.[1] ?? html;

  const sections = [
    ...content.matchAll(
      /<p><strong><u>([^<]+)<\/u><\/strong>([\s\S]*?)<\/p>([\s\S]*?)(?=<p><strong><u>|$)/gi
    )
  ];

  for (const section of sections) {
    const header = normalizeSectionVendor(section[1]);
    const body = section[3];

    if (SKIP_SECTION_RE.test(header)) {
      lastLincolnFinancialFieldParseStats.skippedBeverages += 1;
      continue;
    }

    lastLincolnFinancialFieldParseStats.sectionsParsed += 1;

    if (/^local\s+favorites/i.test(header)) {
      const listItems = [...body.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) =>
        decodeHtml(m[1].replace(/<[^>]+>/g, " "))
      );
      for (const line of listItems) {
        rawItems.push(...expandLocalFavoriteLine(line));
      }
      continue;
    }

    if (/vegetarian,\s*gluten/i.test(header)) {
      const listItems = [...body.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) =>
        decodeHtml(m[1].replace(/<[^>]+>/g, " "))
      );
      for (const line of listItems) {
        rawItems.push(...parseDietaryOptionLine(line));
      }
      continue;
    }

    const vendor = header || "Lincoln Financial Field";
    const listItems = [...body.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) =>
      decodeHtml(m[1].replace(/<[^>]+>/g, " "))
    );

    for (const line of listItems) {
      if (/^local\s+favorites\s+at/i.test(line)) continue;

      const item = parseItemLine(line, vendor);
      if (item) {
        rawItems.push(item);
        continue;
      }

      if (/located\s+at|available\s+at|featuring/i.test(line)) {
        rawItems.push(...expandLocalFavoriteLine(line));
      }
    }
  }

  return rawItems;
}

function mergeRawItems(items: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<
    string,
    {
      name: string;
      description?: string;
      fare?: VenueMenuFare;
      vendor?: string;
      vendorHints: Set<string>;
      dietary: VenueMenuDietaryTag[];
    }
  >();

  for (const raw of items) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        name: raw.name,
        description: raw.description,
        fare: raw.fare,
        vendor: raw.vendor,
        vendorHints: new Set(raw.vendorHint ? [raw.vendorHint] : []),
        dietary: raw.dietary ?? []
      });
      continue;
    }

    lastLincolnFinancialFieldParseStats.deduped += 1;
    if (!existing.description && raw.description) {
      existing.description = raw.description;
    }
    if (!existing.vendor && raw.vendor) existing.vendor = raw.vendor;
    if (raw.vendorHint) existing.vendorHints.add(raw.vendorHint);
    for (const tag of raw.dietary ?? []) {
      if (!existing.dietary.includes(tag)) existing.dietary.push(tag);
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
      vendorLocationHint:
        raw.vendorHints.size > 0
          ? [...raw.vendorHints].sort().join("; ")
          : undefined,
      dietaryTags: raw.dietary,
      sourceUrl: SOURCE_URL
    }));
}

export async function parseLincolnFinancialFieldMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastLincolnFinancialFieldParseStats = {
    sectionsParsed: 0,
    skippedModifiers: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    skippedVendorOnly: 0,
    deduped: 0
  };

  const res = await fetch(url, {
    headers: {
      "User-Agent": "StadiumSlop/1.0 (venue-menu-import)",
      Accept: "text/html,application/xhtml+xml"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Lincoln Financial Field food page: ${res.status}`);
  }
  const html = await res.text();
  const items = mergeRawItems(parseLincolnFinancialFieldHtml(html));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastLincolnFinancialFieldParseStats.skippedBeverages
  };
}
