/**
 * MetLife Stadium (NY Giants, NY Jets, FIFA World Cup 2026 Final) menu parser.
 *
 * The official dining page is server-rendered CMS HTML with concession cards
 * (`.entry` blocks): stand name, section list, and comma-separated menu copy.
 * Specialty blocks (Kosher, Vegetarian, Gluten Free) list items with section
 * lists. The Beer section is drink-only and skipped. No ordering API or PDF menus.
 *
 * Source: https://www.metlifestadium.com/plan-your-visit/dining-options-locations
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "metlife-stadium";
const VENUE_NAME = "MetLife Stadium";
const SOURCE_URL =
  "https://www.metlifestadium.com/plan-your-visit/dining-options-locations";

export let lastMetLifeStadiumParseStats = {
  standsParsed: 0,
  skippedModifiers: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  skippedVendorOnly: 0,
  deduped: 0
};

type ParsedStand = {
  vendor: string;
  sectionHint?: string;
  menuText: string;
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const DRINK_RE =
  /\b(beer|wine|cocktail|margarita|mule|spritz|seltzer|vodka|whiskey|bourbon|rum|gin|tequila|cantina|highball|draft\s+beer|bottled\s+beer|non-alcoholic\s+beer|soft\s+drinks?|soda|cola|coffee|hot\s+chocolate|hot\s+beverages?|lemonade|iced\s+tea|bottled\s+water|\bwater\b|gatorade|beverage)\b/i;

const GENERIC_SKIP_RE =
  /^(popcorn|candy|peanuts?|potato\s+chips?|chips|pakora\s+chips|value\s+meal|value\s+popcorn|value\s+soft\s+drink|value\s+pretzel|assortment\s+of|various\s+snacks|salads?|fresh\s+fruit|cookies,\s*brownies)$/i;

const VENDOR_ONLY_RE =
  /^(grab\s*&\s*go|halal|beer|gluten\s+free\s+beer|beers\s+of\s+the\s+world|craft\s+beer\s+zone|concourse\s+bars?|casamigos|modelo)$/i;

/** Specialty-card rows that only name a stand, not a dish. */
const SPECIALTY_VENDOR_ONLY_LABELS = new Set([
  "petite greens",
  "mr. tot",
  "dippin' dots",
  "dippin dots",
  "fresh fruit"
]);

const BEVERAGE_VENDOR_RE =
  /\b(beer\s+garden|tequila\s+bar|cantina|craft\s+beer|concourse\s+bar)\b/i;

/** Stands with comma-heavy copy that does not split cleanly. */
const VENDOR_ITEM_OVERRIDES: Record<string, string[]> = {
  "A Cut Above by Against the Grain": [
    "Brisket Sandwich",
    "BBQ Pulled Pork Sandwich"
  ],
  "Shah's Halal": [
    "Chicken over Rice",
    "Halal Gyro",
    "Falafel Gyro"
  ],
  "Fuku Chicken Sando": [
    "Fuku Spicy Fried Chicken Sando",
    "Fuku Fingers & Fries",
    "Fuku Fries"
  ],
  "Fuku Chicken": [
    "Fuku Spicy Fried Chicken Sando",
    "Fuku Fingers & Fries",
    "Fuku Fries"
  ],
  "WingMan NYC": ["Chicken Wings"],
  "Global Pies": ["Empanadas", "Meat Pies"],
  "Supremio": ["Premio Sausage", "NJ/NY Sausage"],
  "Tostitos Nachos": ["Nacho Grande"],
  "Nonna Fusco's Kitchen": [
    "Meatball Sandwich",
    "Chicken Cutlet Sandwich",
    "Chicken Vodka Parm Sandwich",
    "Fried Ravioli",
    "Spicy Rigatoni Vodka",
    "Pasta Alfredo",
    "Pasta with Nonna's Sauce",
    "Zeppoles"
  ]
};

function vendorMenuOverrides(vendor: string): string[] | undefined {
  const key = vendor.trim();
  return VENDOR_ITEM_OVERRIDES[key] ?? VENDOR_ITEM_OVERRIDES[vendor];
}

/** Specialty dietary cards: item label → serving stand. */
const SPECIALTY_ITEM_VENDOR: Record<string, string> = {
  "Veggie Burrito": "Taco's Raqueros",
  "Veggie Taco": "Taco's Raqueros",
  "Rice and Bean Bowl": "Taco's Raqueros",
  "Chop Salad": "Petite Greens",
  "Quinoa Bowls": "Petite Greens",
  "Veggie Wraps": "Petite Greens",
  "Fruit Cup": "Petite Greens",
  "Loaded Tots": "Mr. Tot",
  "Burnt Ends Chili Tots": "Mr. Tot",
  "Hot Dogs": "Kosher Stand",
  "Pretzels": "Kosher Stand",
  "Chicken Nuggets": "Kosher Stand",
  Knish: "Kosher Stand",
  "Burger with Gluten Free Bun": "Patty's Burger",
  "Sausage with Gluten Free Bun": "Premio Sausage"
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

function extractVendor(block: string): string | null {
  const title =
    block.match(/<h3 class="title"[^>]*>[\s\S]*?title="([^"]+)"/i)?.[1] ??
    block.match(/<span title="([^"]+)"/i)?.[1];
  if (!title) return null;
  return decodeHtml(title).replace(/\s+/g, " ").trim();
}

function extractSectionHint(block: string): string | undefined {
  const sections =
    block.match(/<strong>Sections?:?\s*([^<]+)<\/strong>/i)?.[1] ??
    block.match(/<li>\s*Sections?:?\s*([^<]+)<\/li>/i)?.[1];
  if (!sections) return undefined;
  const cleaned = decodeHtml(sections)
    .replace(/\s+/g, " ")
    .replace(/\(Secs\.[^)]+\)/gi, "")
    .trim();
  if (!cleaned) return undefined;
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}…` : cleaned;
}

function extractMenuParagraphs(block: string): string[] {
  const paragraphs: string[] = [];
  for (const m of block.matchAll(/<p>([\s\S]*?)<\/p>/gi)) {
    const text = decodeHtml(m[1].replace(/<[^>]+>/g, " "));
    if (!text || /^sections?:/i.test(text)) continue;
    if (/^shah/i.test(text) && text.length < 40) continue;
    paragraphs.push(text);
  }
  return paragraphs;
}

function splitMenuSegments(menuText: string): string[] {
  const segments: string[] = [];
  let text = menuText
    .replace(/\s+with\s+fries\s+(?=Specialty)/i, " with fries, ")
    .replace(/\s+and\s+Platters,\s*/i, ", ");

  const parenGroups = [...text.matchAll(/\(([^)]+)\)/g)];
  for (const g of parenGroups) {
    if (/rigatoni|alfredo|pasta|vodka/i.test(g[1])) {
      for (const part of g[1].split(/,\s*/)) {
        segments.push(part.trim());
      }
    }
    text = text.replace(g[0], "");
  }

  for (const part of text.split(/,\s*/)) {
    const trimmed = part.trim();
    if (trimmed) segments.push(trimmed);
  }

  return segments;
}

function canonicalItemName(raw: string): string | null {
  let name = decodeHtml(raw)
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+only\s+@.*$/i, "")
    .replace(/\*+/g, "")
    .trim();

  if (!name || DRINK_RE.test(name) || GENERIC_SKIP_RE.test(name)) return null;
  if (/^value\s+/i.test(name)) return null;
  if (/^sections?\b/i.test(name)) return null;

  const lower = name.toLowerCase().replace(/\s+/g, " ");

  const aliases: Record<string, string | null> = {
    "brisket sandwiches": "Brisket Sandwich",
    "bbq pulled pork sandwiches": "BBQ Pulled Pork Sandwich",
    "chicken tender basket": "Chicken Tender Basket",
    "fried clams": "Fried Clams",
    "thumann's hot dogs": "Thumann's Stadium Dog",
    "thumanns hot dogs": "Thumann's Stadium Dog",
    "thumann's stadium dog": "Thumann's Stadium Dog",
    "thumanns stadium dog": "Thumann's Stadium Dog",
    "value turkey wrap meal": null,
    "pastrami hoagie": "Pastrami Hoagie",
    "corned beef hoagie": "Corned Beef Hoagie",
    "fresh fruit cup": "Fresh Fruit Cup",
    "spicy chicken sandwich": "Spicy Chicken Sandwich",
    "hand battered 3pc chicken tender with fries": "Hand Battered Chicken Tenders",
    "specialty topped fries": "Specialty Topped Fries",
    "pretzel braid": "Pretzel Braid",
    "footlong hot dogs": "Footlong Hot Dog",
    "foot long hot dogs": "Footlong Hot Dog",
    "fuku spicy chicken sando": "Fuku Spicy Fried Chicken Sando",
    "fuku fingers & fries": "Fuku Fingers & Fries",
    "fuku fries": "Fuku Fries",
    "fuku chicken sando": "Fuku Spicy Fried Chicken Sando",
    "assortment of empanadas": "Empanadas",
    "meat pies": "Meat Pies",
    "meatball sandwich": "Meatball Sandwich",
    "chicken cutlet sandwich": "Chicken Cutlet Sandwich",
    "chicken vodka parm sandwich": "Chicken Vodka Parm Sandwich",
    "fried ravioli": "Fried Ravioli",
    "spicy rigatoni vodka": "Spicy Rigatoni Vodka",
    "pasta alfredo": "Pasta Alfredo",
    "pasta with nonna's sauce": "Pasta with Nonna's Sauce",
    "zeppoles": "Zeppoles",
    "halal chicken, beef, and falafel gyros": "Halal Gyro",
    "halal chicken, beef, and falafel gyros and platters": "Chicken over Rice",
    "platters": null,
    "patty's burger": "Patty's Burger",
    "cheese pizza": "Cheese Pizza",
    "pepperoni pizza": "Pepperoni Pizza",
    "traditional and boneless wings": "Chicken Wings",
    "traditional and boneless wings with buffalo": "Chicken Wings",
    "hot honey bbq": null,
    "garlic parmesan sauces": null,
    "and falafel gyros": null,
    "halal chicken": "Chicken over Rice",
    "beef": null,
    "and fuku fries": null,
    "tacos": "Tacos",
    "burritos/bowl (chicken, beef, pork)": "Burrito Bowl",
    "burritos/bowl": "Burrito Bowl",
    "rice & beans": "Rice and Beans",
    "loaded nacho": "Loaded Nachos",
    "premio sausage": "Premio Sausage",
    "new jersey and new york sausage": "NJ/NY Sausage",
    "loaded tots": "Loaded Tots",
    "burnt ends chili tots": "Burnt Ends Chili Tots",
    "cookies": "Mrs. Fields Cookie",
    "brownies": "Brownie",
    "sausage sandwich": "Sausage Sandwich",
    "nacho grande": "Nacho Grande",
    "soft serve ice cream": "Soft Serve Ice Cream",
    "cheesesteak": "Cheesesteak",
    "chop salad": "Chop Salad",
    "veggie wraps": "Veggie Wrap",
    "quinoa bowls": "Quinoa Bowl",
    "fruit cup": "Fruit Cup",
    "sausage with gluten free bun": "Sausage with Gluten Free Bun",
    "burger with gluten free bun": "Burger with Gluten Free Bun",
    "hot dogs": "Hot Dog",
    "pretzels": "Pretzel",
    "chicken nuggets": "Chicken Nuggets",
    "knish": "Knish",
    "veggie burrito": "Veggie Burrito",
    "veggie taco": "Veggie Taco",
    "rice and bean bowl": "Rice and Bean Bowl",
    "fries": "French Fries",
    "cheese fries": "Cheese Fries"
  };

  if (lower in aliases) return aliases[lower] ?? null;

  if (/^fresh\s+pasta\s+options$/i.test(name)) return null;
  if (/nick mangold/i.test(name)) return null;

  if (/^and\s+/i.test(name) || /^&\s+/i.test(name)) return null;
  if (name.split(/\s+/).length === 1 && /^(beef|pork|chicken)$/i.test(name)) {
    return null;
  }

  if (name.length <= 80) {
    return name
      .replace(/\b3pc\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s+/)
      .map((w, i) => {
        if (/^(bbq|nj|ny|gf)$/i.test(w)) return w.toUpperCase();
        if (/^fuku$/i.test(w) && i === 0) return "Fuku";
        if (i === 0 || !/^(and|with)$/i.test(w)) {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }
        return w.toLowerCase();
      })
      .join(" ")
      .replace(/Thumann's/gi, "Thumann's")
      .replace(/Fuku Fingers & Fries/i, "Fuku Fingers & Fries");
  }

  return null;
}

function isVendorOnlyName(name: string, vendor: string): boolean {
  const n = normalizeMenuItemName(name);
  const v = normalizeMenuItemName(vendor);
  if (!n || !v) return false;
  if (n === v) return true;
  if (v.length > 3 && n.includes(v) && n.split(" ").length <= 4) return true;
  return false;
}

function inferFare(name: string): VenueMenuFare {
  const text = name.toLowerCase();
  if (
    /\b(cookie|brownie|zeppole|ice cream|dots|dessert|cake)\b/.test(text)
  ) {
    return "Desserts";
  }
  if (
    /\b(fries|nachos|pretzel|wings|tots|chips|clams)\b/.test(text) &&
    !/\b(sandwich|burger|bowl|pizza|hoagie|cheesesteak|burrito|taco)\b/.test(
      text
    )
  ) {
    return "Snacks";
  }
  return "Meals";
}

function inferDietary(
  name: string,
  vendor: string,
  blockVendor: string
): VenueMenuDietaryTag[] {
  const text = `${name} ${vendor} ${blockVendor}`.toLowerCase();
  const tags: VenueMenuDietaryTag[] = [];
  if (/\bvegan\b/.test(text)) tags.push("Vegan", "Vegetarian");
  else if (/\bvegetarian\b|veggie\b/.test(text)) tags.push("Vegetarian");
  if (/\bgluten\s*free\b|\bgf\b/.test(text)) tags.push("Gluten Free");
  if (/\bhalal\b/.test(text) || /shah'?s\s+halal/i.test(vendor)) {
    // Halal certification is not a VenueMenuDietaryTag enum value
  }
  return [...new Set(tags)];
}

function parseSpecialtyBlock(
  block: string,
  blockVendor: string
): RawItem[] {
  const items: RawItem[] = [];

  const strongBlocks = [
    ...block.matchAll(/<p><strong>([^<]+)<\/strong><\/p>\s*<ul>\s*<li>([^<]+)<\/li>/gi)
  ];

  for (const m of strongBlocks) {
    const label = decodeHtml(m[1]).trim();
    const sectionHint = decodeHtml(m[2]).replace(/^Sections?:?\s*/i, "").trim();

    if (SPECIALTY_VENDOR_ONLY_LABELS.has(label.toLowerCase())) {
      lastMetLifeStadiumParseStats.skippedVendorOnly += 1;
      continue;
    }

    if (DRINK_RE.test(label) || GENERIC_SKIP_RE.test(label)) {
      if (GENERIC_SKIP_RE.test(label)) {
        lastMetLifeStadiumParseStats.skippedGeneric += 1;
      } else {
        lastMetLifeStadiumParseStats.skippedBeverages += 1;
      }
      continue;
    }

    for (const part of label.split(/,\s*/)) {
      const canonical = canonicalItemName(part);
      if (!canonical) {
        lastMetLifeStadiumParseStats.skippedGeneric += 1;
        continue;
      }

      const vendor =
        SPECIALTY_ITEM_VENDOR[canonical] ??
        SPECIALTY_ITEM_VENDOR[part] ??
        (blockVendor === "Vegetarian" || blockVendor === "Gluten Free"
          ? blockVendor
          : blockVendor);

      items.push({
        name: canonical,
        vendor: vendor === "Vegetarian" || vendor === "Gluten Free" ? "MetLife Stadium" : vendor,
        vendorHint: sectionHint ? `Sections ${sectionHint}` : undefined,
        fare: inferFare(canonical),
        dietary: inferDietary(canonical, vendor, blockVendor)
      });
    }
  }

  return items;
}

function parseStandMenu(stand: ParsedStand): RawItem[] {
  const { vendor, sectionHint, menuText } = stand;
  const items: RawItem[] = [];
  const names = new Set<string>();

  const overrides = vendorMenuOverrides(vendor);
  if (overrides) {
    for (const name of overrides) {
      names.add(name);
    }
  } else {
    for (const segment of splitMenuSegments(menuText)) {
      const canonical = canonicalItemName(segment);
      if (!canonical) {
        if (DRINK_RE.test(segment)) {
          lastMetLifeStadiumParseStats.skippedBeverages += 1;
        } else if (segment.trim()) {
          lastMetLifeStadiumParseStats.skippedGeneric += 1;
        }
        continue;
      }
      names.add(canonical);
    }
  }

  for (const name of names) {
    if (isVendorOnlyName(name, vendor)) {
      lastMetLifeStadiumParseStats.skippedVendorOnly += 1;
      continue;
    }

    items.push({
      name,
      vendor,
      vendorHint: sectionHint ? `Sections ${sectionHint}` : undefined,
      fare: inferFare(name),
      dietary: inferDietary(name, vendor, vendor)
    });
  }

  return items;
}

export function parseMetLifeDiningHtml(html: string): RawItem[] {
  const rawItems: RawItem[] = [];
  const beerMarker = html.search(
    /<div class="title">Beer<\/div>/i
  );
  const foodHtml =
    beerMarker >= 0 ? html.slice(0, beerMarker) : html;

  const blocks = foodHtml.split(/<div class="entry/gi).slice(1);

  for (const block of blocks) {
    const chunk = `<div class="entry${block}`;

    const vendor = extractVendor(chunk);
    if (!vendor) continue;

    if (VENDOR_ONLY_RE.test(vendor) || BEVERAGE_VENDOR_RE.test(vendor)) {
      lastMetLifeStadiumParseStats.skippedVendorOnly += 1;
      continue;
    }

    const sectionHint = extractSectionHint(chunk);
    const paragraphs = extractMenuParagraphs(chunk);
    const menuText = paragraphs.join(" ");

    if (vendor === "Vegetarian" || vendor === "Gluten Free" || vendor === "Kosher") {
      lastMetLifeStadiumParseStats.standsParsed += 1;
      rawItems.push(...parseSpecialtyBlock(chunk, vendor));
      continue;
    }

    if (!menuText || /^sections?\s+closed/i.test(menuText)) {
      lastMetLifeStadiumParseStats.skippedVendorOnly += 1;
      continue;
    }

    lastMetLifeStadiumParseStats.standsParsed += 1;
    rawItems.push(...parseStandMenu({ vendor, sectionHint, menuText }));
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

    lastMetLifeStadiumParseStats.deduped += 1;
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

export async function parseMetLifeStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastMetLifeStadiumParseStats = {
    standsParsed: 0,
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
    throw new Error(`Failed to fetch MetLife dining page: ${res.status}`);
  }
  const html = await res.text();

  const rawItems = parseMetLifeDiningHtml(html);
  const items = mergeRawItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastMetLifeStadiumParseStats.skippedBeverages
  };
}
