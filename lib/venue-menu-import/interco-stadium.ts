/**
 * Inter&Co Stadium (Orlando City SC — MLS, Orlando Pride — NWSL) menu parser.
 *
 * The official vendors page is a Squarespace gallery of Orlando-made partners
 * (logos + outbound links only) — no item-level stadium menus, PDFs, or APIs.
 *
 * Menu rows are curated from:
 *   - Image alt text + gallery links on interco-stadium.com/vendors
 *   - Orlando City 2026 Orlando Made expansion (Feb 2026)
 *   - Orlando City / Pride 2024 partner item announcements
 *   - MLS venue import notes (sections + signature dishes)
 *   - Stadium Journey concourse descriptions (legacy Exploria naming)
 *
 * Vendor names are never FoodItem rows. Signature dishes are included only when
 * the food identity is explicit in an official or venue-import source.
 *
 * Sources:
 *   https://www.interco-stadium.com/vendors
 *   https://www.orlandocitysc.com/news/inter-co-stadium-expands-award-winning-orlando-made-concessions-program-with-new-local-partners-for-2026-season
 *   https://www.orlandocitysc.com/pride/news/orlando-made-food-beverage-program-adds-good-salt-restaurant-group-and-papi-smash-d-burger-to-inter-co-stadium-lineup
 *
 * DB venue slug: `inter-co-stadium` (import CLI uses `interco-stadium`).
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "interco-stadium";
const VENUE_NAME = "Inter&Co Stadium";
const SOURCE_URL = "https://www.interco-stadium.com/vendors";
const ORLANDO_CITY_2026_URL =
  "https://www.orlandocitysc.com/news/inter-co-stadium-expands-award-winning-orlando-made-concessions-program-with-new-local-partners-for-2026-season";

/** Resolved via apply.ts alias to existing `inter-co-stadium` venue row. */
export const INTERCO_STADIUM_DB_SLUG = "inter-co-stadium";

/** Vendors on /vendors with no item-level menu on the stadium site (logo gallery only). */
export const VENDOR_ONLY_ON_STATIC_PAGE = [
  "4 Rivers Smokehouse",
  "The COOP",
  "A Southern Affair",
  "Black Rooster Taqueria",
  "Cholo Dogs",
  "Sus Hi Eatstation",
  "Teak Neighborhood Grill",
  "Harrell's Hot Dogs + Cold Cones",
  "Kappy's Subs"
] as const;

export let lastIntercoStadiumParseStats = {
  skippedVendorOnly: VENDOR_ONLY_ON_STATIC_PAGE.length,
  skippedBeverages: 0,
  skippedGeneric: 0,
  vendorsOnPage: 0
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
  sourceUrl?: string;
};

const MENU_DATA: RawItem[] = [
  // ── 4 Rivers Smokehouse (Section 31) ───────────────────────────────

  {
    name: "Beef Brisket Sandwich",
    description: "Signature sweet BBQ sauce on hyper-tender brisket",
    fare: "Meals",
    vendor: "4 Rivers Smokehouse",
    vendorHint: "Section 31",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "4 Rivers Smokehouse",
    vendorHint: "Section 31",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pulled Chicken Sandwich",
    fare: "Meals",
    vendor: "4 Rivers Smokehouse",
    vendorHint: "Section 31",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pulled Pork Nachos",
    fare: "Snacks",
    vendor: "4 Rivers Smokehouse",
    vendorHint: "Section 31",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pulled Chicken Nachos",
    fare: "Snacks",
    vendor: "4 Rivers Smokehouse",
    vendorHint: "Section 31",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── The COOP by 4 Rivers (Section 9) ─────────────────────────────

  {
    name: "Southern Fried Chicken Basket",
    description: "Ultra-crispy fried chicken with homestyle sides",
    fare: "Meals",
    vendor: "The COOP by 4 Rivers",
    vendorHint: "Section 9",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },

  // ── Black Rooster Taqueria ───────────────────────────────────────

  {
    name: "Tacos",
    description: "Mexican street tacos (chicken or pork)",
    fare: "Meals",
    vendor: "Black Rooster Taqueria",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Loaded Nachos",
    fare: "Snacks",
    vendor: "Black Rooster Taqueria",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Chips and Salsa",
    fare: "Snacks",
    vendor: "Black Rooster Taqueria",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Chips and Guacamole",
    fare: "Snacks",
    vendor: "Black Rooster Taqueria",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pork Carnitas Tamales",
    fare: "Meals",
    vendor: "Black Rooster Taqueria",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Cholo Dogs (portable program + founding vendor) ───────────────

  {
    name: "Footlong Hot Dog",
    fare: "Meals",
    vendor: "Cholo Dogs",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Harrell's Hot Dogs ───────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Harrell's Hot Dogs",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Bratwurst",
    description: "With peppers, onions, and yellow mustard",
    fare: "Meals",
    vendor: "Harrell's Hot Dogs",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Teak Neighborhood Grill ──────────────────────────────────────

  {
    name: "The Brace",
    description: "Double-smashed burger with ghost pepper cheese",
    fare: "Meals",
    vendor: "Teak Neighborhood Grill",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Kappy's Subs (Heineken Market Food Hall) ─────────────────────

  {
    name: "Cheesesteak",
    description: "Famous Maitland diner cheesesteak",
    fare: "Meals",
    vendor: "Kappy's Subs",
    vendorHint: "Heineken Market Food Hall",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },

  // ── 2026 permanent additions (Orlando City announcement) ─────────

  {
    name: "Wagyu Bison Burger",
    description: "Signature wagyu bison burger with hand-cut fries",
    fare: "Meals",
    vendor: "The Hangry Bison Burgers & Bourbon",
    vendorHint: "Section 30",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Cuban Sandwich",
    fare: "Meals",
    vendor: "Zaza Cuban Comfort Food & Coffee",
    vendorHint: "Section 18",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Papa Rellena",
    fare: "Snacks",
    vendor: "Zaza Cuban Comfort Food & Coffee",
    vendorHint: "Section 18",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },

  // ── Heineken Market Food Hall (2026 renovations) ─────────────────

  {
    name: "California Roll",
    fare: "Meals",
    vendor: "Kaido Sushi",
    vendorHint: "Heineken Market Food Hall",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Veggie Roll",
    fare: "Meals",
    vendor: "Kaido Sushi",
    vendorHint: "Heineken Market Food Hall",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Crepe",
    description: "Sweet and savory crepes (Crepe Me Up)",
    fare: "Meals",
    vendor: "Crepe Me Up",
    vendorHint: "Heineken Market Food Hall",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Italian Sausage",
    fare: "Meals",
    vendor: "Orlando Provisions",
    vendorHint: "Heineken Market Food Hall",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Polish Sausage",
    fare: "Meals",
    vendor: "Orlando Provisions",
    vendorHint: "Heineken Market Food Hall",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Smash Burger",
    description: "Latin-inspired smash burger",
    fare: "Meals",
    vendor: "Papi Smash'd Burger",
    vendorHint: "Heineken Market Food Hall; rotating carts",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Returning Orlando Made partners (2026 announcement) ────────────

  {
    name: "Veggie Pizza",
    fare: "Meals",
    vendor: "Flippers Pizzeria",
    vendorHint: "Section 36",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Portable program (rotating carts; named dishes only) ─────────

  {
    name: "Shepherd's Pie",
    fare: "Meals",
    vendor: "The Castle Irish Pub",
    vendorHint: "Orlando Made portable program (rotating)",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  },
  {
    name: "Reuben Sandwich",
    fare: "Meals",
    vendor: "The Castle Irish Pub",
    vendorHint: "Orlando Made portable program (rotating)",
    tags: ["mls", "nwsl", "local-specialty"],
    sourceUrl: ORLANDO_CITY_2026_URL
  }
];

function countVendorsOnPage(html: string): number {
  const re =
    /alt="([^"]+)"[^>]*class="gallery-grid-image-link"|<a[^>]+class="gallery-grid-image-link"[^>]*>[\s\S]*?alt="([^"]+)"/gi;
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const name = (m[1] || m[2] || "").trim();
    if (name && !name.includes("Inter")) names.add(name);
  }
  const altRe = /alt="(4 Rivers Smokehouse|The COOP|Black Rooster[^"]+|Cholo Dogs|Sus Hi Eatstation|Teak[^"]+|Harrell[^"]+|Kappy[^"]+)"/gi;
  while ((m = altRe.exec(html)) !== null) {
    names.add(m[1].trim());
  }
  return names.size;
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
    }
    if (raw.vendor && existing.vendor && existing.vendor !== raw.vendor) {
      existing.vendor = `${existing.vendor} / ${raw.vendor}`;
    } else if (raw.vendor && !existing.vendor) {
      existing.vendor = raw.vendor;
    }
    if (raw.vendorHint && raw.vendorHint !== existing.vendorHint) {
      existing.vendorHint = [existing.vendorHint, raw.vendorHint]
        .filter(Boolean)
        .join("; ");
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
      sourceUrl: raw.sourceUrl ?? SOURCE_URL
    }));
}

export async function parseIntercoStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  let vendorsOnPage = 0;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "StadiumSlop/1.0 (venue menu import)"
      }
    });
    if (response.ok) {
      const html = await response.text();
      vendorsOnPage = countVendorsOnPage(html);
    }
  } catch {
    vendorsOnPage = VENDOR_ONLY_ON_STATIC_PAGE.length;
  }

  lastIntercoStadiumParseStats = {
    skippedVendorOnly: VENDOR_ONLY_ON_STATIC_PAGE.length,
    skippedBeverages: 0,
    skippedGeneric: 0,
    vendorsOnPage: vendorsOnPage || VENDOR_ONLY_ON_STATIC_PAGE.length
  };

  const items = mergeItems(MENU_DATA);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastIntercoStadiumParseStats.skippedBeverages
  };
}
