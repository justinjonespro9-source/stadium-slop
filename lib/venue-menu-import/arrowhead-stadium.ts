/**
 * GEHA Field at Arrowhead Stadium (Kansas City Chiefs — NFL) menu parser.
 *
 * The amenities index is a client-rendered SPA; item-level menus live on per-stand
 * `/amenities/detail/{slug}` pages with a `Food:` line in server HTML (fetchable).
 * `/concessions` mirrors the amenities shell. No PDF flipbook or ordering API.
 *
 * Menu rows are parsed from official detail pages plus 2026 NFL venue import
 * headline items where stands use vendor-only copy on the site (e.g. Italian Stallion).
 *
 * Vendor/stand names are vendorName / vendorLocationHint only — never FoodItem rows.
 *
 * Source: https://www.gehafieldatarrowhead.com/amenities
 * Detail pages: https://www.gehafieldatarrowhead.com/amenities/detail/{slug}
 *
 * DB resolve: CLI slug `arrowhead-stadium` → `geha-field-at-arrowhead-stadium` (apply alias).
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "arrowhead-stadium";
const VENUE_NAME = "GEHA Field at Arrowhead Stadium";
const SOURCE_URL = "https://www.gehafieldatarrowhead.com/amenities";
const DETAIL_BASE = "https://www.gehafieldatarrowhead.com/amenities/detail";

/** Food stands with item-level `Food:` copy on detail pages. */
export const FOOD_AMENITY_SLUGS = [
  "arrowhead-eats",
  "burger-kitchen",
  "chef-j-bbq",
  "chickie-and-petes",
  "connected-concepts",
  "coop",
  "cowtown",
  "dynasty",
  "flame-grill",
  "kc-dilla",
  "kc-style-bbq",
  "kingdom-classics",
  "kingdom-grill",
  "kingdom-kantina",
  "mac-shack",
  "smoak-bbq",
  "the-italian-sausage-company",
  "victory-burger",
  "wings-and-rings"
] as const;

export let lastArrowheadStadiumParseStats = {
  detailPagesFetched: 0,
  detailPagesWithFood: 0,
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0
};

export const CURATION_SKIPPED_VENDOR_ONLY = [
  "The Italian Sausage Company (Gourmet Sausages only on detail page)",
  "Sheridan (custard stand — no food line in HTML; CSV headline only)",
  "Fans First Booths ($5 hot dogs / popcorn value)",
  "Grab-N-Go / Beverage Express / Chiefs Bar / KC Cocktails / Hy-Vee Bar",
  "Ford Fan Zone (self-checkout beer/snacks)",
  "The World Stage Bar"
] as const;

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function item(
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
  const tags = ["nfl", "world-cup-host"];
  if (opts.local !== false) tags.push("local-specialty");
  return {
    name,
    vendor,
    description: opts.description,
    fare: opts.fare ?? "Meals",
    vendorHint: opts.vendorHint,
    dietary: opts.dietary ?? [],
    tags
  };
}

const MENU_DATA: RawItem[] = [
  // ── 2026 headline (NFL import + press) ─────────────────────────────

  item('The "Loudest" Mac and Cheese', "Mac Shack", {
    description:
      "White cheddar mac with Buffalo chicken or plain crispy chicken (Chef Rocco Whalen)",
    vendorHint: "Sections 103 and 123"
  }),
  item("Catfish Po' Boy", "Arrowhead Eats", {
    description: "Cornmeal catfish on Gambino's roll with tartar, lettuce, and tomato",
    vendorHint: "Sections 103 and 123"
  }),
  item("Fluffy Tacos", "Arrowhead Eats", {
    description:
      "Fried flatbread with spiced beef, cheddar, lettuce, pico, crema, and white queso",
    vendorHint: "Sections 103, 123, 510, and 532"
  }),
  item("Elote Corn", "Kingdom Classics", {
    description: "Chili-lime corn with cotija and cilantro",
    fare: "Snacks",
    vendorHint: "Kingdom Classics",
    dietary: ["Vegetarian"]
  }),
  item("Funnel Cake Apple Pie", "Kingdom Classics", {
    description: "Funnel cake fries with apple filling, cinnamon sugar, and caramel",
    fare: "Desserts",
    vendorHint: "Sections 101, 121, 132, 520, and 546"
  }),

  // ── Smoak BBQ ──────────────────────────────────────────────────────

  item("Sliced Brisket Sandwich", "Smoak BBQ", {
    vendorHint: "Sections 101, 121, and 520"
  }),
  item("Pulled Pork Sandwich", "Smoak BBQ", {
    vendorHint: "Sections 131 and 316"
  }),
  item("Big Red Sandwich", "Smoak BBQ", {
    vendorHint: "Sections 131 and 316"
  }),
  item("Loaded BBQ Fries", "Smoak BBQ", {
    fare: "Snacks",
    vendorHint: "Sections 131 and 316"
  }),
  item("BBQ Tacos", "Smoak BBQ", {
    vendorHint: "Sections 131 and 316"
  }),

  // ── Mac Shack ──────────────────────────────────────────────────────

  item("BBQ Burnt End Mac and Cheese", "Mac Shack", {
    vendorHint: "Sections 103, 312, 321, and 345"
  }),
  item("Three Cheese Mac and Cheese", "Mac Shack", {
    dietary: ["Vegetarian"],
    vendorHint: "Sections 103, 312, 321, and 345"
  }),
  item("Taco Mac and Cheese", "Mac Shack", {
    vendorHint: "Sections 103, 312, 321, and 345"
  }),

  // ── Connected Concepts ─────────────────────────────────────────────

  item("Coop Tenders", "Connected Concepts", {
    vendorHint: "Section 111"
  }),
  item("Hatch Chile Chicken Nacho", "Connected Concepts", {
    fare: "Snacks",
    vendorHint: "Section 111"
  }),
  item("Downtown Burger", "Connected Concepts", {
    vendorHint: "Section 111"
  }),
  item("Crab Fries with Cheese", "Connected Concepts", {
    fare: "Snacks",
    vendorHint: "Section 111"
  }),

  // ── Chef J BBQ ─────────────────────────────────────────────────────

  item("BBQ Brisket Sandwich", "Chef J BBQ", {
    vendorHint: "Section 107"
  }),
  item("Loaded BBQ Tots", "Chef J BBQ", {
    fare: "Snacks",
    vendorHint: "Section 107"
  }),

  // ── KC Style BBQ (club) ────────────────────────────────────────────

  item("Bone-in Short Rib", "KC Style BBQ", {
    description: "Gluten-free upon request",
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),
  item("Korean BBQ Pork Belly Rice Bowl", "KC Style BBQ", {
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),
  item("BBQ Chicken Salad", "KC Style BBQ", {
    dietary: ["Vegetarian"],
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),
  item("Smoked Brisket Sandwich", "KC Style BBQ", {
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),
  item("Smoked Brisket Nachos", "KC Style BBQ", {
    fare: "Snacks",
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),
  item("KC BBQ Dog", "KC Style BBQ", {
    vendorHint: "Section 215, CommunityAmerica Club Level"
  }),

  // ── Arrowhead Eats ─────────────────────────────────────────────────

  item("Short Rib Melt", "Arrowhead Eats", {
    vendorHint: "Section 103"
  }),
  item("Picadillo Empanadas", "Arrowhead Eats", {
    vendorHint: "Section 103"
  }),

  // ── The Italian Sausage Company ────────────────────────────────────

  item("Italian Stallion", "The Italian Sausage Company", {
    description: "Spicy sausage with peppers, onions, and marinara",
    vendorHint: "Sections 109 and 130"
  }),
  item("Sheridan's Frozen Custard Concrete", "Sheridan's Frozen Custard", {
    description: "Dense custard concrete in souvenir mini-helmet",
    fare: "Desserts",
    vendorHint: "Sections 106, 108, 111, and upper levels"
  }),

  // ── KC Dilla ───────────────────────────────────────────────────────

  item("Steak Quesadilla", "KC Dilla", {
    vendorHint: "Sections 135 and 323"
  }),
  item("Chicken Quesadilla", "KC Dilla", {
    vendorHint: "Sections 135 and 323"
  }),
  item("Cheese Quesadilla", "KC Dilla", {
    dietary: ["Vegetarian"],
    vendorHint: "Sections 135 and 323"
  }),
  item("Black Bean and Corn Quesadilla", "KC Dilla", {
    dietary: ["Vegetarian"],
    vendorHint: "Section 118"
  }),

  // ── Coop ───────────────────────────────────────────────────────────

  item("Inferno Sandwich", "Coop", {
    vendorHint: "Sections 112, 121, 126, 136, 303, 327, and 339"
  }),
  item("Loaded Fries", "Coop", {
    fare: "Snacks",
    vendorHint: "Sections 112, 121, 126, 136, 303, 327, and 339"
  }),
  item("Peach Cobbler Eggroll", "Coop", {
    description: "Peach cobbler eggroll with ice cream",
    fare: "Desserts",
    vendorHint: "Sections 112, 121, 126, 136, 303, 327, and 339"
  }),

  // ── Burger Kitchen ─────────────────────────────────────────────────

  item("Smokehouse Burger", "Burger Kitchen", {
    vendorHint: "Sections 102 and 116"
  }),
  item("Bacon Cheeseburger", "Burger Kitchen", {
    vendorHint: "Sections 102 and 116"
  }),
  item("Corn Dog", "Burger Kitchen", {
    vendorHint: "Sections 102 and 116"
  }),

  // ── Cowtown ────────────────────────────────────────────────────────

  item("Stockyard Burger", "Cowtown", {
    vendorHint: "Sections 321, 327, and 345"
  }),
  item("Out of Town Burger", "Cowtown", {
    vendorHint: "Sections 321, 327, and 345"
  }),

  // ── Dynasty! ─────────────────────────────────────────────────────────

  item("Playmaker Steak Sandwich", "Dynasty!", {
    vendorHint: "Section 335"
  }),
  item("Loaded Mash Potato Bowl", "Dynasty!", {
    vendorHint: "Section 335"
  }),
  item("BBQ Mashed Potato Bowl", "Dynasty!", {
    vendorHint: "Section 335"
  }),

  // ── Chickie and Pete's ───────────────────────────────────────────────

  item("Crabfries with Cheese", "Chickie and Pete's", {
    fare: "Snacks",
    vendorHint: "Sections 108, 122, 130, and 303"
  }),
  item("Philly Cheesesteak", "Chickie and Pete's", {
    vendorHint: "Sections 108, 122, 130, and 303"
  }),
  item("Boneless Buffalo Wings", "Chickie and Pete's", {
    vendorHint: "Sections 108, 122, 130, and 303"
  }),

  // ── Wings and Rings ──────────────────────────────────────────────────

  item("Boneless Chicken Nachos", "Wings and Rings", {
    fare: "Snacks",
    vendorHint: "Section 326"
  }),
  item("Fried Pickles and Cheese Curds", "Wings and Rings", {
    fare: "Snacks",
    vendorHint: "Section 326"
  }),

  // ── Kingdom Grill / Classics ─────────────────────────────────────────

  item("Arrowhead Shaped Nuggets", "Kingdom Grill", {
    fare: "Snacks",
    vendorHint: "Sections 109, 127, 310, and 333"
  }),
  item("Bavarian Bratwurst", "Kingdom Classics", {
    vendorHint: "Sections 101 and 118"
  }),

  // ── Kingdom Kantina ──────────────────────────────────────────────────

  item("Empanadas", "Kingdom Kantina", {
    vendorHint: "Sections 113, 325, and 338"
  }),

  // ── Flame Grill / Victory Burger (club) ─────────────────────────────

  item("Veggie Burger", "Flame Grill", {
    dietary: ["Vegetarian"],
    vendorHint: "Section 210, CommunityAmerica Club Level"
  }),
  item("Crispy Fry Corn Dog", "Flame Grill", {
    vendorHint: "Section 210, CommunityAmerica Club Level"
  }),
  item("Queso Dip Burger", "Victory Burger", {
    vendorHint: "Section 220, CommunityAmerica Club Level"
  }),
  item("Smashburger", "Victory Burger", {
    vendorHint: "Section 220, CommunityAmerica Club Level"
  })
];

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

function parseDetailFoodLine(html: string): string[] {
  const match = html.match(/Food:\s*([^<\n]+)/i);
  if (!match) return [];
  const line = match[1].replace(/\s+/g, " ").trim();
  if (!line) return [];

  const skip = new Set(
    [
      "french fries",
      "popcorn",
      "peanuts",
      "jumbo hot dog",
      "jumbo dog",
      "junior hot dog",
      "hotdog",
      "cheese nachos",
      "nachos",
      "bavarian pretzel with cheese",
      "bavarian pretzel",
      "pretzel bites",
      "souvenir popcorn",
      "popcorn box",
      "large popcorn",
      "small popcorn",
      "giant cookie",
      "chips and queso",
      "gourmet sausages",
      "burger",
      "chicken tenders with fries",
      "chicken tenders and fries",
      "single cheeseburger with fries",
      "double cheeseburger with fries",
      "chiefs grub tub",
      "bbq platter",
      "chicken wings and onion rings",
      "onion rings",
      "curly fries",
      "loaded fries",
      "garlic parm fries",
      "fries",
      "uncrustable",
      "peanut butter and jelly uncrustable"
    ].map((s) => s.toLowerCase())
  );

  const phrases = [
    "BBQ Burnt Ends Mac and Cheese",
    "BBQ Burnt End Mac and Cheese",
    "Three Cheese Mac and Cheese",
    "Taco Mac and Cheese",
    "Hatch Chile Chicken Nacho",
    "Smoked Brisket Nachos",
    "Smoked Brisket Sandwich",
    "BBQ Brisket Sandwich",
    "Pulled Pork Sandwich",
    "Big Red Sandwich",
    "Loaded BBQ Fries",
    "Loaded BBQ Tots",
    "BBQ Tacos",
    "Coop Tenders",
    "Downtown Burger",
    "Crab Fries with Cheese",
    "Bone in Short Rib",
    "Korean BBQ Pork Belly Rice Bowl",
    "BBQ Chicken Salad",
    "KC BBQ Dog",
    "Short Rib Melt",
    "Inferno Sandwich",
    "Peach Cobbler Eggroll with Ice Cream",
    "Smokehouse Burger",
    "Single Bacon Cheeseburger",
    "Stockyard Burger",
    "Out of Town Burger",
    "Playmaker Steak Sandwich",
    "Loaded Mash Potato Bowl",
    "BBQ Mashed Potato Bowl",
    "Crabfries with Cheese",
    "Philly Cheesesteak",
    "Boneless Buffalo Wings",
    "Boneless Chicken Nachos",
    "Fried Pickles and Cheese Curds",
    "Arrowhead Shaped Nuggets",
    "Bavarian Bratwurst",
    "Steak Quesadilla",
    "Chicken Quesadilla",
    "Cheese Quesadilla",
    "Queso Dip Burger",
    "Smashburger",
    "Veggie Burger",
    "Crispy Fry Corn Dog",
    "Picadillo Empanadas",
    "Empanadas"
  ].sort((a, b) => b.length - a.length);

  const found: string[] = [];
  let rest = line;
  for (const phrase of phrases) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (re.test(rest)) {
      const canonical = phrase
        .replace(/BBQ Burnt Ends Mac and Cheese/i, "BBQ Burnt End Mac and Cheese")
        .replace(/Bone in Short Rib/i, "Bone-in Short Rib");
      if (!skip.has(canonical.toLowerCase())) {
        found.push(canonical);
      }
      rest = rest.replace(re, " ");
    }
  }

  return found;
}

export function parseAmenityDetailHtml(
  slug: string,
  html: string
): { vendor: string; vendorHint?: string; items: string[] } | null {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)</i);
  if (!titleMatch) return null;

  const vendor = titleMatch[1].trim();
  const sectionMatch = html.match(/##\s*Section[s]?\s*([^\n#]+)/i);
  const levelMatch = html.match(/Field Level|Club Level|Upper Level/gi);
  const hints: string[] = [];
  if (sectionMatch) hints.push(`Section ${sectionMatch[1].trim()}`);
  if (levelMatch) hints.push([...new Set(levelMatch.map((l) => l.trim()))].join(", "));

  const items = parseDetailFoodLine(html);
  if (items.length === 0) return null;

  return {
    vendor,
    vendorHint: hints.length ? hints.join("; ") : undefined,
    items
  };
}

export async function fetchAmenityDetailItems(): Promise<RawItem[]> {
  const out: RawItem[] = [];
  lastArrowheadStadiumParseStats.detailPagesFetched = 0;
  lastArrowheadStadiumParseStats.detailPagesWithFood = 0;

  for (const slug of FOOD_AMENITY_SLUGS) {
    lastArrowheadStadiumParseStats.detailPagesFetched += 1;
    try {
      const res = await fetch(`${DETAIL_BASE}/${slug}`, {
        headers: {
          Accept: "text/html",
          "User-Agent": "StadiumSlop/1.0 (venue menu import)"
        }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const parsed = parseAmenityDetailHtml(slug, html);
      if (!parsed) continue;
      lastArrowheadStadiumParseStats.detailPagesWithFood += 1;
      for (const name of parsed.items) {
        out.push(
          item(name, parsed.vendor, {
            vendorHint: parsed.vendorHint,
            local: !/philly|crabfries|wings/i.test(name)
          })
        );
      }
    } catch {
      // detail fetch is best-effort; curated MENU_DATA is primary
    }
  }

  return out;
}

export async function parseArrowheadStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastArrowheadStadiumParseStats.skippedVendorOnly =
    CURATION_SKIPPED_VENDOR_ONLY.length;
  lastArrowheadStadiumParseStats.skippedBeverages = 0;
  lastArrowheadStadiumParseStats.skippedGeneric = 0;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "StadiumSlop/1.0 (venue menu import)"
      }
    });
    if (!res.ok) {
      console.warn(`[arrowhead-stadium] amenities page returned ${res.status}`);
    } else {
      const html = await res.text();
      if (!/amenities\/detail\//i.test(html)) {
        console.warn("[arrowhead-stadium] amenities index may be SPA-only in HTML");
      }
    }
  } catch {
    console.warn("[arrowhead-stadium] could not reach amenities page");
  }

  const fetched = await fetchAmenityDetailItems();
  const items = mergeItems([...MENU_DATA, ...fetched]);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastArrowheadStadiumParseStats.skippedBeverages
  };
}
