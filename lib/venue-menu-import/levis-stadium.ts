/**
 * Levi's Stadium (San Francisco 49ers, FIFA World Cup 2026) menu parser.
 *
 * The official concessions page is WordPress HTML with expandable stand cards
 * (`.grid-item`): image alt = brand, optional sub-title, section number, and
 * `<ul class="concession__menu">` item lines. List and map views duplicate cards
 * (deduped by `data-id`). No ordering API; WP REST page JSON has no menu rows.
 *
 * Supplements headline / 2026 partner items from NFL import when absent on-page
 * (Gilroy Garlic Steak Frites, Ramen Nagi, Incogmeato, San Fran Sticky Roll).
 *
 * Source: https://levisstadium.com/concessions/
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "levis-stadium";
const VENUE_NAME = "Levi's Stadium";
const SOURCE_URL = "https://levisstadium.com/concessions/";

export let lastLevisStadiumParseStats = {
  standsParsed: 0,
  standsSkippedBarOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  skippedCombos: 0,
  deduped: 0,
  curatedAdded: 0
};

/** Bar / drink stands with no food lines on the public card list. */
const BEVERAGE_VENDOR_RE =
  /\b(ketel one|wine bar|casamigos|bud light|gold bar|spirits|tequileria|draft bar|tap room|west coast brews|cutwater|tito'?s|nutrl|legendary cocktails|salt point|astral|peet'?s coffee|pepsi grab|planet popcorn|ice cream)\b/i;

const DRINK_RE =
  /\b(beer|wine|cocktails?|margarita|mule|spritz|seltzer|vodka|whiskey|bourbon|rum|gin|tequila|draft|lager|soda|cola|coffee|hot\s+chocolate|lemonade|iced\s+tea|bottled\s+water|aquafina|water|gatorade|beverage|espresso|micheladas?|float|organic\s+lemonade|organic\s+vodka|boba|milkshakes?|aguas\s+frescas|michelob|nutrl)\b/i;

const GENERIC_SKIP_RE =
  /^(assorted\s+chips|chips|popcorn(\s+\(gf\))?|candy|cookies?|pretzels?|ice\s+cream\s+novelties|nachos?\s*(\(gf\))?|hot\s+dogs?|peanuts?(\s+\(gf\))?|rotational\s+desserts|fries|regular\s+soda|fountain\s+soda|beef\s+jerky|trail\s+mix|kettle\s+corn|cotton\s+candy|dippin\s+dots|soft\s+serve\s+(cones|cups)|mars\s+ice\s+cream\s+novelties)$/i;

const VENDOR_ONLY_ITEM_RE =
  /^(cocktails?|premium\s+(canned\s+)?beer|american\s+lager(\s+canned\s+beer)?|charcuterie\s+tray|canned\s+cocktails|specialty\s+cocktails|gold\s+bar\s+specialty\s+cocktails|ketel\s+one\s+specialty\s+cocktails|frozen\s+cocktails|salt\s+point\s+canned\s+cocktails)$/i;

const COMBO_SKIP_RE = /\bcombo\b/i;

/** Stands whose published menu is drink-only or mis-linked (Starbird card copies pizza fries). */
const SKIP_STAND_ALT_RE = /^starbird\s*$/i;

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

type ParsedStand = {
  vendor: string;
  section?: string;
  items: string[];
};

function decodeHtml(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function vendorFromStand(alt: string, subTitle: string | null): string {
  const brand = alt.replace(/\s+/g, " ").trim();
  const genericBar =
    /^(wine bar|spirits|gold bar|draft bar|tap room|tequileria|ketel one|casamigos|bud light)/i.test(
      brand
    );
  if (!genericBar && brand.length > 2) {
    if (/^chicken guy/i.test(brand)) return "Chicken Guy!";
    if (/^blue line pizza/i.test(brand)) return "Blue Line Pizza";
    if (/^the organic coup/i.test(brand)) return "The Organic Coup";
    return brand;
  }
  return (subTitle ?? brand).trim();
}

function parseStandsFromHtml(html: string): ParsedStand[] {
  const seenIds = new Set<string>();
  const stands: ParsedStand[] = [];
  const gridRe =
    /<div\s+class="grid-item"[^>]*data-id="(\d+)"[\s\S]*?(?=<div\s+class="grid-item"|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = gridRe.exec(html)) !== null) {
    const id = match[1];
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const block = match[0];
    const alt = decodeHtml(
      block.match(/concession__image--main"[^>]*alt="([^"]+)"/)?.[1] ?? ""
    );
    if (SKIP_STAND_ALT_RE.test(alt)) continue;

    const subTitle = block.match(/concession__sub-title">([^<]+)/)?.[1];
    const section = block.match(/concession__section-id-label">([^<]+)/)?.[1];
    const items: string[] = [];
    for (const li of block.matchAll(/<li>([^<]+)/gi)) {
      items.push(decodeHtml(li[1]));
    }
    if (items.length === 0) continue;

    stands.push({
      vendor: vendorFromStand(alt, subTitle ? decodeHtml(subTitle) : null),
      section: section ? decodeHtml(section) : undefined,
      items
    });
  }

  return stands;
}

function canonicalItemName(raw: string): string | null {
  let name = decodeHtml(raw)
    .replace(/\s*\(gf\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || DRINK_RE.test(name) || GENERIC_SKIP_RE.test(name)) return null;
  if (VENDOR_ONLY_ITEM_RE.test(name)) return null;
  if (COMBO_SKIP_RE.test(name)) return null;

  const lower = name.toLowerCase();

  const pizzaMatch = lower.match(
    /^(cheese|pepperoni|sausage & mushroom) pizza (deep dish|thin crust)$/
  );
  if (pizzaMatch) {
    const style =
      pizzaMatch[1] === "sausage & mushroom"
        ? "Sausage & Mushroom"
        : pizzaMatch[1].charAt(0).toUpperCase() + pizzaMatch[1].slice(1);
    return `${style} Pizza`;
  }

  const aliases: Record<string, string | null> = {
    "dungeness crab sandwich": "Crab Sammies",
    "guacamole & chips": "Guacamole and Chips",
    "guac and chips": "Guacamole and Chips",
    "mac n' cheese": "Mac and Cheese",
    "quesabirria taco": "Quesabirria Taco",
    "chicken al pastor taco": "Chicken Al Pastor Taco",
    "tostitos specialty nacho": "Tostitos Specialty Nacho",
    "specialty loaded nachos": "Specialty Loaded Nachos",
    "hella fries (loaded fries)": "Hella Fries",
    "pretzel sticks with tostitos cheese sauce": "Pretzel Sticks with Cheese Sauce",
    "chicken guy classic sandwich": "Chicken Guy Classic Sandwich",
    "sausage & mushroom deep dish": "Sausage & Mushroom Pizza",
    "sausage & mushroom thin crust": "Sausage & Mushroom Pizza"
  };

  if (lower in aliases) return aliases[lower] ?? null;

  if (/^tacos$/i.test(name)) return "Tacos";
  if (/^burritos$/i.test(name)) return "Burritos";

  return name
    .split(/\s+/)
    .map((w, i) => {
      if (/^(bbq|gf)$/i.test(w)) return w.toUpperCase();
      if (i === 0 || !/^(and|with|n)$/i.test(w)) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }
      return w.toLowerCase();
    })
    .join(" ")
    .replace(/N'/g, "n'");
}

function inferFare(name: string): VenueMenuFare {
  const text = name.toLowerCase();
  if (
    /\b(cookie|brownie|churro|cannoli|sundae|sticky roll|banana|dessert|ice cream)\b/.test(
      text
    )
  ) {
    return "Desserts";
  }
  if (
    /\b(fries|nachos|pretzel|wings|tots|chips|popcorn)\b/.test(text) &&
    !/\b(sandwich|burger|burrito|taco|pizza|ramen|bowl|salad|wrap)\b/.test(text)
  ) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(name: string, vendor: string): VenueMenuDietaryTag[] {
  const text = `${name} ${vendor}`.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\bvegan\b/.test(text)) tags.push("Vegan", "Vegetarian");
  else if (/\bvegetarian\b|veggie\b|plant-based\b/.test(text)) {
    tags.push("Vegetarian");
  }
  if (/\bgluten\s*free\b|\(gf\)/i.test(`${name} ${vendor}`)) {
    tags.push("Gluten Free");
  }
  return [...new Set(tags)];
}

function isVendorOnlyName(name: string, vendor: string): boolean {
  const n = normalizeMenuItemName(name);
  const v = normalizeMenuItemName(vendor);
  if (!n || !v) return false;
  if (n !== v) return false;
  // Flagship dishes may share the stand name (e.g. Crab Sammies @ Crab Sammies).
  if (
    /\b(sammies|sandwich|burger|taco|ramen|pizza|dog|fries|nachos|roll|brat|wings|tenders)\b/i.test(
      name
    )
  ) {
    return false;
  }
  return true;
}

/** NFL import / press rows not listed on the concessions card grid. */
const CURATION_SUPPLEMENT: RawItem[] = [
  {
    name: "Gilroy Garlic Steak Frites",
    vendor: "Gilroy Garlic Steak Frites",
    description:
      "California hanger steak over fries with au poivre and Gilroy garlic",
    vendorHint: "Section 110"
  },
  {
    name: "The San Fran Sticky Roll",
    vendor: "State Fair Sweets",
    description:
      "Cinnamon roll with white chocolate mascarpone crème anglaise and spun sugar",
    vendorHint: "Section 122",
    fare: "Desserts"
  },
  {
    name: "Original King Ramen",
    vendor: "Ramen Nagi",
    description: "Signature pork broth with fresh-made noodles",
    vendorHint: "Section 119"
  },
  {
    name: "Vegetarian King Ramen",
    vendor: "Ramen Nagi",
    description: "Vegetarian broth with fresh-made noodles",
    vendorHint: "Section 119",
    dietary: ["Vegetarian"]
  },
  {
    name: "Plant-Based Brat",
    vendor: "Incogmeato",
    description: "MorningStar Farms plant-based bratwurst",
    vendorHint: "Zenni Zone — upper concourse",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Vegan Tenders",
    vendor: "Incogmeato",
    description: "MorningStar Farms plant-based tenders",
    vendorHint: "Zenni Zone — upper concourse",
    dietary: ["Vegan", "Vegetarian"]
  }
];

export function parseLevisStadiumConcessionsHtml(html: string): RawItem[] {
  const rawItems: RawItem[] = [];
  const stands = parseStandsFromHtml(html);

  for (const stand of stands) {
    const foodLines: string[] = [];

    for (const line of stand.items) {
      if (DRINK_RE.test(line)) {
        lastLevisStadiumParseStats.skippedBeverages += 1;
        continue;
      }
      if (GENERIC_SKIP_RE.test(line)) {
        lastLevisStadiumParseStats.skippedGeneric += 1;
        continue;
      }
      if (VENDOR_ONLY_ITEM_RE.test(line)) {
        lastLevisStadiumParseStats.skippedVendorOnly += 1;
        continue;
      }
      if (COMBO_SKIP_RE.test(line)) {
        lastLevisStadiumParseStats.skippedCombos += 1;
        continue;
      }
      foodLines.push(line);
    }

    if (BEVERAGE_VENDOR_RE.test(stand.vendor) && foodLines.length === 0) {
      lastLevisStadiumParseStats.standsSkippedBarOnly += 1;
      continue;
    }

    if (foodLines.length === 0) {
      lastLevisStadiumParseStats.skippedVendorOnly += 1;
      continue;
    }

    lastLevisStadiumParseStats.standsParsed += 1;
    const sectionHint = stand.section ? `Section ${stand.section}` : undefined;
    const names = new Set<string>();

    for (const line of foodLines) {
      const canonical = canonicalItemName(line);
      if (!canonical) {
        if (COMBO_SKIP_RE.test(line)) {
          lastLevisStadiumParseStats.skippedCombos += 1;
        } else if (DRINK_RE.test(line)) {
          lastLevisStadiumParseStats.skippedBeverages += 1;
        } else {
          lastLevisStadiumParseStats.skippedGeneric += 1;
        }
        continue;
      }
      if (isVendorOnlyName(canonical, stand.vendor)) {
        lastLevisStadiumParseStats.skippedVendorOnly += 1;
        continue;
      }
      names.add(canonical);
    }

    for (const name of names) {
      rawItems.push({
        name,
        vendor: stand.vendor,
        vendorHint: sectionHint,
        fare: inferFare(name),
        dietary: inferDietary(name, stand.vendor)
      });
    }
  }

  const existing = new Set(
    rawItems.map((r) => normalizeMenuItemName(r.name))
  );
  for (const row of CURATION_SUPPLEMENT) {
    const key = normalizeMenuItemName(row.name);
    if (existing.has(key)) continue;
    existing.add(key);
    lastLevisStadiumParseStats.curatedAdded += 1;
    rawItems.push(row);
  }

  return rawItems;
}

export function auditLevisStadiumConcessionsHtml(html: string): {
  hasConcessionGrid: boolean;
  uniqueStandCount: number;
} {
  const stands = parseStandsFromHtml(html);
  return {
    hasConcessionGrid: html.includes("concession-list-view"),
    uniqueStandCount: stands.length
  };
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

    lastLevisStadiumParseStats.deduped += 1;
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

export async function parseLevisStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastLevisStadiumParseStats = {
    standsParsed: 0,
    standsSkippedBarOnly: 0,
    skippedBeverages: 0,
    skippedGeneric: 0,
    skippedVendorOnly: 0,
    skippedCombos: 0,
    deduped: 0,
    curatedAdded: 0
  };

  const res = await fetch(url, {
    headers: {
      "User-Agent": "StadiumSlop/1.0 (venue-menu-import)",
      Accept: "text/html,application/xhtml+xml"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Levi's concessions page: ${res.status}`);
  }
  const html = await res.text();
  const audit = auditLevisStadiumConcessionsHtml(html);
  if (!audit.hasConcessionGrid) {
    console.warn(
      "[levis-stadium] concessions grid markup missing; parser may need updates"
    );
  }

  const rawItems = parseLevisStadiumConcessionsHtml(html);
  const items = mergeRawItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastLevisStadiumParseStats.skippedBeverages
  };
}
