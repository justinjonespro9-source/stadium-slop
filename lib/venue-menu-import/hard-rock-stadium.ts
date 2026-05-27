/**
 * Hard Rock Stadium (Miami Dolphins, FIFA World Cup 2026, F1 / Miami Open) menu parser.
 *
 * The official concessions page is Avada/Fusion WordPress with `.post-card` vendor
 * tiles (name, cuisine, sections, keyword tags). There are no per-item menus in
 * HTML, JSON, or WP REST — only PDF concession maps and a Fuse.js search index.
 * CHEQ ordering menus are event-gated and not scraped.
 *
 * Food rows are curated from NFL 2026 import headlines/partners, stand keyword
 * hints on the live page, and documented stadium press (Fuku, Coyo Taco, etc.).
 * Re-fetch when `post-card` count or map PDF URLs change.
 *
 * Source: https://www.hardrockstadium.com/concessions/
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "hard-rock-stadium";
const VENUE_NAME = "Hard Rock Stadium";
const SOURCE_URL = "https://www.hardrockstadium.com/concessions/";

const FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

/** Level concession map PDFs linked from the concessions page (audit). */
const CONCESSION_MAP_PDFS = [
  "STA023_ConcessionMap_100Level.pdf",
  "STA023_ConcessionMap_200Level.pdf",
  "STA023_ConcessionMap_300Level.pdf"
] as const;

export let lastHardRockStadiumParseStats = {
  postCardCount: 0,
  standsWithKeywordTags: 0,
  hasConcessionMaps: false,
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  deduped: 0,
  curatedItemCount: 0
};

export const CURATION_SKIPPED_VENDOR_ONLY = [
  "Zuma (full-service restaurant — no public item list)",
  "The AMEX Lounge (lounge space)",
  "Piper-Heidsieck Champagne Garden (wine / cocktails)",
  "Fan Favorites / Carvery / Craft Provisions (unnamed stadium fare)",
  "Wynwood Walkthrough (grab-and-go snacks without named dishes)",
  "CANTALOUPE & Pepsi Food Zone (generic popcorn / nachos / pretzels)",
  "Benihana / Italian Vice / Ella Cafe (category keywords only)",
  "Halal & Kosher Awareness (operations copy, not a dish)"
] as const;

export const CURATION_SKIPPED_BEVERAGES = [
  "The Miami Daydream cocktail / mocktail",
  "Cuban cocktails (Café La Trova bar copy)",
  "Beer / wine / champagne / coffee / boba tea / lemonade",
  "Organic Draft Beer / Organic Vodka Lemonade (Organic Coup)"
] as const;

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

function item(
  name: string,
  vendor: string,
  opts: {
    description?: string;
    fare?: VenueMenuFare;
    vendorHint?: string;
    dietary?: VenueMenuDietaryTag[];
  } = {}
): RawItem {
  return {
    name,
    vendor,
    description: opts.description,
    fare: opts.fare ?? "Meals",
    vendorHint: opts.vendorHint,
    dietary: opts.dietary ?? []
  };
}

const MENU_DATA: RawItem[] = [
  // ── Headline / NFL import ───────────────────────────────────────────

  item("The Beef Hammer", "Stadium Concessions", {
    description:
      "Slow-braised beef shank on the bone with horseradish gremolata (serves ~4)",
    vendorHint: "Sections 104 and 306"
  }),
  item("Salmon Mosaic", "72 Club", {
    description:
      "Nori-wrapped miso-cured salmon, soy-wasabi emulsion, caviar, puffed rice paper",
    vendorHint: "72 Club exclusive"
  }),
  item("South Florida Mofongo", "South Florida Mofongo", {
    description:
      "Mashed green plantains with garlic, olive oil, and pork cracklings; shrimp or braised pork topping",
    vendorHint: "Sections 122 and 214"
  }),
  item("Caramelized Foie Gras Slider", "72 Club", {
    description:
      "Foie gras, caramelized onion jam, and Comté on brioche",
    vendorHint: "72 Club"
  }),

  // ── Local partners (NFL import + press) ───────────────────────────

  item("Famous Empanadas", "Café La Trova", {
    description: "Michelle Bernstein Little Havana empanadas",
    vendorHint: "Section 134"
  }),
  item("Leeks and Bacon Pizza", "Miami Slice", {
    description: "Artisan NY-style slice",
    vendorHint: "Section 114"
  }),
  item("Guava & Cheese Donut", "The Salty Donut", {
    description: "Brioche donut with guava and cheese",
    fare: "Desserts",
    vendorHint: "Sections 102 and 328"
  }),
  item("Cochinita Pibil Taco", "Coyo Taco", {
    description: "Yucatán-style slow-roasted pork taco",
    vendorHint: "Multiple sections"
  }),
  item("Street Corn", "Coyo Taco", {
    description: "Mexican street-style elote",
    fare: "Snacks",
    vendorHint: "Multiple sections"
  }),
  item("Fresh Guacamole", "Coyo Taco", {
    description: "Made-to-order smashed guacamole",
    fare: "Snacks",
    vendorHint: "Multiple sections"
  }),

  // ── Wholesome Wonders / dietary ─────────────────────────────────────

  item("Citrus Quinoa Salad", "Wholesome Wonders", {
    description: "Grilled tofu, edamame, and ponzu",
    vendorHint: "Section 119",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Maroulosalata Greek Goddess Salad", "Wholesome Wonders", {
    description: "Greek village-style salad",
    vendorHint: "Section 119",
    dietary: ["Vegetarian"]
  }),
  item("Key Lime Pie Souvenir Jar", "Wholesome Wonders", {
    description: "Key lime pie in a reusable stadium glass",
    fare: "Desserts",
    vendorHint: "Section 119",
    dietary: ["Gluten Free"]
  }),

  // ── Fuku (page + press) ─────────────────────────────────────────────

  item("Spicy Fried Chicken Sandwich", "Fuku", {
    description: "Buttermilk fried chicken thigh with habanero heat and Korean chili sauce",
    vendorHint: "Sections 145 and 319"
  }),
  item("Fuku CBR", "Fuku", {
    description: "Fried chicken with bacon, ranch, and pickles",
    vendorHint: "Sections 145 and 319"
  }),
  item("Chicken Tenders", "Fuku", {
    vendorHint: "Sections 145 and 319"
  }),
  item("Waffle Fries", "Fuku", {
    fare: "Snacks",
    vendorHint: "Sections 145 and 319"
  }),

  // ── Miami / Latin stands (page sections) ────────────────────────────

  item("Cheeseburger", "Cheeseburger Baby", {
    description: "Classic Miami cheeseburger",
    vendorHint: "Sections 114 and 233"
  }),
  item("Choripan", "Novecento", {
    description: "Argentine sausage sandwich",
    vendorHint: "Section 134"
  }),
  item("Empanadas", "Novecento", {
    vendorHint: "Section 134"
  }),
  item("Cuban Empanadas", "Sol Cubano", {
    vendorHint: "Sections 120, 242, and 317"
  }),
  item("Croquetas", "Sol Cubano", {
    description: "Cuban ham croquettes",
    fare: "Snacks",
    vendorHint: "Sections 120, 242, and 317"
  }),
  item("Medianoche Sandwich", "Cafe La Carreta", {
    description: "Cuban sweet bread sandwich",
    vendorHint: "Section 246"
  }),
  item("Ceviche", "Lcky Chckn", {
    description: "Vietnamese-style ceviche",
    vendorHint: "Section 347"
  }),
  item("Bao Bun", "Lcky Chckn", {
    vendorHint: "Section 347"
  }),
  item("Churros", "Talkin Tacos", {
    fare: "Desserts",
    vendorHint: "Sections 231 and 341"
  }),
  item("Street Tacos", "Talkin Tacos", {
    vendorHint: "Sections 231 and 341"
  }),
  item("Gyoza", "Sushi Maki", {
    fare: "Snacks",
    vendorHint: "Section 244"
  }),
  item("Poke Bowl", "Sushi Maki", {
    vendorHint: "Section 244"
  }),
  item("Shula Burger", "Shula Burger", {
    vendorHint: "Sections 222 and 250"
  }),
  item("Smashburger", "Fatboy Smashburgers", {
    vendorHint: "Section 106"
  }),
  item("Crispy Chicken Sandwich", "Crisppi's Chicken", {
    vendorHint: "Sections 102 and 329"
  }),
  item("Nacho Bowl", "Tostitos Nacho Bar", {
    description: "Loaded Tostitos nacho bowl",
    fare: "Snacks",
    vendorHint: "Section 119"
  }),
  item("Pulled Pork Sandwich", "Sobe Q", {
    description: "South Florida barbecue",
    vendorHint: "Sections 104, 132, 219, 247, and 313"
  }),
  item("Acai Bowl", "Sweet Cream", {
    fare: "Desserts",
    vendorHint: "Section 217"
  }),
  item("Bubble Waffle", "Puffles Ice Cream & Waffles", {
    fare: "Desserts",
    vendorHint: "Sections 245 and 318"
  }),
  item("Personal Pepperoni Pizza", "Little Caesars", {
    vendorHint: "Sections 142 and 345"
  }),
  item("Artisan Pizza", "Crust Artisan Pizza", {
    vendorHint: "Sections 222 and 250"
  }),
  item("Loaded Waffle Fries", "Granny B'z", {
    fare: "Snacks",
    vendorHint: "Section 304"
  }),
  item("Stacked Sandwich", "Stacked", {
    description: "Fresh-built sandwich",
    vendorHint: "Sections 205, 214, and 242"
  }),
  item("Stadium Hot Dog", "Magic City Dogs", {
    vendorHint: "Sections 101, 114, and 129"
  })
];

function decodeHtml(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type HardRockParsedStand = {
  title: string;
  sections: string;
  keys: string;
  levels: string;
};

export function parseHardRockPostCards(html: string): HardRockParsedStand[] {
  const cardRe = /<li class="[^"]*post-card[^"]*"[\s\S]*?<\/li>/gi;
  const stands: HardRockParsedStand[] = [];
  const seen = new Set<string>();

  for (const block of html.match(cardRe) ?? []) {
    const title = decodeHtml(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "");
    if (!title || seen.has(title)) continue;
    seen.add(title);

    const sections = decodeHtml(
      block.match(/class="[^"]*sections"[^>]*>[\s\S]*?<p>([^<]+)/i)?.[1] ?? ""
    );
    const keys = decodeHtml(
      block.match(/class="[^"]*keys"[^>]*>[\s\S]*?<p>([^<]+)/i)?.[1] ?? ""
    );
    const levels = decodeHtml(
      block.match(/location-filter[\s\S]*?<p>([^<]+)/i)?.[1] ?? ""
    );

    stands.push({ title, sections, keys, levels });
  }

  return stands;
}

export function auditHardRockStadiumConcessionsHtml(html: string): {
  postCardCount: number;
  standsWithKeywordTags: number;
  concessionMapPdfCount: number;
} {
  const stands = parseHardRockPostCards(html);
  return {
    postCardCount: stands.length,
    standsWithKeywordTags: stands.filter((s) => s.keys.length > 0).length,
    concessionMapPdfCount: CONCESSION_MAP_PDFS.filter((id) => html.includes(id))
      .length
  };
}

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
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

  for (const raw of rawItems) {
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

    lastHardRockStadiumParseStats.deduped += 1;
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

export async function parseHardRockStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastHardRockStadiumParseStats = {
    postCardCount: 0,
    standsWithKeywordTags: 0,
    hasConcessionMaps: false,
    skippedVendorOnly: CURATION_SKIPPED_VENDOR_ONLY.length,
    skippedBeverages: CURATION_SKIPPED_BEVERAGES.length,
    skippedGeneric: 0,
    deduped: 0,
    curatedItemCount: MENU_DATA.length
  };

  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch Hard Rock concessions page: ${res.status}`
    );
  }
  const html = await res.text();
  const audit = auditHardRockStadiumConcessionsHtml(html);
  lastHardRockStadiumParseStats.postCardCount = audit.postCardCount;
  lastHardRockStadiumParseStats.standsWithKeywordTags =
    audit.standsWithKeywordTags;
  lastHardRockStadiumParseStats.hasConcessionMaps =
    audit.concessionMapPdfCount >= CONCESSION_MAP_PDFS.length;

  if (audit.postCardCount < 30) {
    console.warn(
      `[hard-rock-stadium] Expected ~38 post-card stands; found ${audit.postCardCount}`
    );
  }
  if (audit.concessionMapPdfCount < CONCESSION_MAP_PDFS.length) {
    console.warn(
      "[hard-rock-stadium] Concession map PDF links changed; re-verify sections"
    );
  }

  const items = mergeItems(MENU_DATA);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastHardRockStadiumParseStats.skippedBeverages
  };
}
