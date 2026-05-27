/**
 * Dignity Health Sports Park (LA Galaxy — MLS) menu parser.
 *
 * Official concessions pages are image/PDF only — no item-level HTML or API:
 *   - https://www.lagalaxy.com/stadium/concessions (map + F&B list PNGs)
 *   - https://www.dignityhealthsportspark.com/plan-your-visit/concessions
 *     → Concessions-2026.pdf (image-based, no extractable text)
 *
 * Menu rows are curated from the 2026 "Food & Beverage Locations" graphic
 * (MLS CDN PNG), the 2026 concessions map (stand/section hints), and named
 * Nongshim Station dishes from the Feb 2025 DHSP partnership announcement.
 *
 * NWSL: Angel City FC plays at BMO Stadium — not imported here.
 * Rugby: not tagged (no shared-tenant rugby registry entry).
 *
 * Vendor/stand names are vendorName / vendorLocationHint only — never FoodItem rows.
 *
 * Sources:
 *   https://www.lagalaxy.com/stadium/concessions
 *   https://www.dignityhealthsportspark.com/assets/doc/Concessions-2026-82a850de44.pdf
 *   https://www.dignityhealthsportspark.com/news/detail/nongshim-named-an-official-partner-of-the-la-galaxy-and-dignity-health-sports-park
 *
 * Re-verify each season; Levy rotates Mac Cheezy's specials and roaming carts.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "dignity-health-sports-park";
const VENUE_NAME = "Dignity Health Sports Park";
const SOURCE_URL = "https://www.lagalaxy.com/stadium/concessions";
const NONGSHIM_SOURCE_URL =
  "https://www.dignityhealthsportspark.com/news/detail/nongshim-named-an-official-partner-of-the-la-galaxy-and-dignity-health-sports-park";

/** MLS CDN 2026 F&B list (same asset linked from lagalaxy.com). */
const FB_LIST_IMAGE_URL =
  "https://images.mlssoccer.com/image/private/t_keep-aspect-ratio-e-desktop_2x/f_png/mls-lag/xq8uoxyrus67kgp4h7pu.png";

export let lastDignityHealthSportsParkParseStats = {
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0
};

/** Documented exclusions from 2026 F&B graphic (not imported as FoodItem rows). */
export const CURATION_SKIPPED_VENDOR_ONLY = [
  "Locals Only (Stand 3.5 — craft beer / peanuts)",
  "Galaxy Go (Stand 14 — packaged alcohol / RTD / sodas / snacks)",
  "Sweet Café (Stand 11 — desserts / frozen drinks / coffee)",
  "Breeze Bar cocktails on tap (Stand 10)",
  "Corner Cantina / Soonhari / Jameson / Upper Deck / West / Golden Road bars",
  "Rock & Brews / Kona / Hornitos (not on 2026 stand list)",
  "Planet Popcorn (roaming — popcorn only)",
  "Home Brewed (roaming — coffee)",
  "Cinco (roaming — vendor name only on map)"
] as const;

export const CURATION_SKIPPED_BEVERAGES = [
  "Draft beer / craft beer / packaged beer / seltzers / RTD cocktails",
  "Margaritas / cocktails on tap / sake bar pours",
  "Fountain soda / water / assorted sodas",
  "Frozen drinks / coffee"
] as const;

export const CURATION_SKIPPED_GENERIC = [
  "Assorted snacks (multiple stands)",
  "Popcorn (Eats Stand 3)",
  "Peanuts (Locals Only)",
  "Chips-only / salsa & guacamole without a named entrée row",
  "Rotating mac & cheese flavor names (import single Mac and Cheese)",
  "Specialty Sandwiches (Melissa's — no item names on source)",
  "Desserts (Sweet Café — category only)"
] as const;

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
  // ── Nongshim Station (Stand 1) ─────────────────────────────────────

  {
    name: "Galaxy Ramyun Bowl",
    description: "Signature Shin ramyun bowl at Nongshim Station",
    fare: "Meals",
    vendor: "Nongshim",
    vendorHint: "Stand 1, East concourse (main concourse)",
    tags: ["mls", "local-specialty"],
    sourceUrl: NONGSHIM_SOURCE_URL
  },
  {
    name: "Cozmos Toomba Noodle Bowl",
    description: "Toomba-style ramyun noodle bowl",
    fare: "Meals",
    vendor: "Nongshim",
    vendorHint: "Stand 1, East concourse",
    tags: ["mls", "local-specialty"],
    sourceUrl: NONGSHIM_SOURCE_URL
  },
  {
    name: "The Pitch Vegan Ramyun Bowl",
    description: "Plant-based ramyun bowl",
    fare: "Meals",
    vendor: "Nongshim",
    vendorHint: "Stand 1, East concourse",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "local-specialty"],
    sourceUrl: NONGSHIM_SOURCE_URL
  },
  {
    name: "Ramyun Burrito",
    description: "Ramyun filling in a burrito format",
    fare: "Meals",
    vendor: "Nongshim",
    vendorHint: "Stand 1, East concourse",
    tags: ["mls", "local-specialty"],
    sourceUrl: NONGSHIM_SOURCE_URL
  },

  // ── Eats (Stands 2, 17) ──────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Eats",
    vendorHint: "Stand 2 (East concourse); Stand 17 (West concourse)",
    tags: ["mls"]
  },

  // ── Avo Eats (Stand 4 + roaming cart) ─────────────────────────────

  {
    name: "Quesadilla",
    fare: "Meals",
    vendor: "Avo Eats",
    vendorHint: "Stand 4, East concourse; Avo Eats cart (West)",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Burrito",
    fare: "Meals",
    vendor: "Avo Eats",
    vendorHint: "Stand 4, East concourse; Avo Eats cart (West)",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Avo Eats",
    vendorHint: "Stand 4; Taqueria Stand 15",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },

  // ── Pi LA (Stands 5, 6, 16) ───────────────────────────────────────

  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Pi LA",
    vendorHint: "Stands 5, 6 (East); Stand 16 (West)",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Pi LA",
    vendorHint: "Stands 5, 6 (East); Stand 16 (West)",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Antipasto Salad",
    fare: "Snacks",
    vendor: "Pi LA",
    vendorHint: "Stands 5, 6 (East); Stand 16 (West)",
    tags: ["mls", "local-specialty"]
  },

  // ── Mac Cheezy's (Stand 7) ────────────────────────────────────────

  {
    name: "Mac and Cheese",
    description: "Rotating mac & cheese specials (stand menu varies by match)",
    fare: "Meals",
    vendor: "Mac Cheezy's",
    vendorHint: "Stand 7, East concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Frank & Frankie's (Stand 8) ───────────────────────────────────

  {
    name: "Specialty Hot Dog",
    fare: "Meals",
    vendor: "Frank & Frankie's",
    vendorHint: "Stand 8, East concourse",
    tags: ["mls"]
  },
  {
    name: "Italian Sausage",
    fare: "Meals",
    vendor: "Frank & Frankie's",
    vendorHint: "Stand 8, East concourse",
    tags: ["mls"]
  },

  // ── Melissa's (Stand 9) ───────────────────────────────────────────

  {
    name: "Vegan Crunch Wrap",
    fare: "Meals",
    vendor: "Melissa's",
    vendorHint: "Stand 9, East concourse",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Fruit Cup",
    fare: "Snacks",
    vendor: "Melissa's",
    vendorHint: "Stand 9, East concourse",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls"]
  },

  // ── Breeze Bar (Stand 10) ─────────────────────────────────────────

  {
    name: "Fish Tacos",
    fare: "Meals",
    vendor: "Breeze Bar",
    vendorHint: "Stand 10, East concourse",
    tags: ["mls", "local-specialty"]
  },

  // ── Prime Burger Co. (Stand 12 / map: Stand 13 south) ─────────────

  {
    name: "Burger",
    fare: "Meals",
    vendor: "Prime Burger Co.",
    vendorHint: "Stand 12, East concourse",
    tags: ["mls"]
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendor: "Prime Burger Co.",
    vendorHint: "Stand 12, East concourse",
    tags: ["mls"]
  },

  // ── Seoul Chicken (Stand 13 per F&B list) ─────────────────────────

  {
    name: "Korean Fried Chicken",
    fare: "Meals",
    vendor: "Seoul Chicken",
    vendorHint: "Stand 13 (F&B list); South concourse cart (2026 map)",
    tags: ["mls", "local-specialty"]
  },

  // ── Taqueria (Stand 15) ───────────────────────────────────────────

  {
    name: "Street Tacos",
    fare: "Meals",
    vendor: "Taqueria",
    vendorHint: "Stand 15, West concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Loaded Nachos",
    fare: "Snacks",
    vendor: "Taqueria",
    vendorHint: "Stand 15, West concourse",
    tags: ["mls", "local-specialty"]
  },

  // ── Roaming / map-only specialty vendors ──────────────────────────

  {
    name: "Pupusa",
    description: "Salvadoran pupusa (cheese, beans, protein in masa)",
    fare: "Meals",
    vendor: "Pupusas with a Purpose",
    vendorHint: "South concourse (AFJA truck)",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Cookie",
    fare: "Desserts",
    vendor: "Cathy's Cookies",
    vendorHint: "East Terrace (Section 139 area)",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Wings",
    fare: "Snacks",
    vendor: "CJ's Wings",
    vendorHint: "East outer concourse",
    tags: ["mls"]
  },
  {
    name: "Italian Ice",
    fare: "Desserts",
    vendor: "Buongusto",
    vendorHint: "East inner concourse (Section 126/226)",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Yakitori",
    fare: "Snacks",
    vendor: "Yakitori",
    vendorHint: "East inner concourse (Section 136/236)",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Angus Beef Brisket",
    fare: "Meals",
    vendor: "My Father's Barbeque",
    vendorHint: "South concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Smoked Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "My Father's Barbeque",
    vendorHint: "South concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "BBQ Chicken Plate",
    description: "BBQ chicken plate with Texas toast and two sides",
    fare: "Meals",
    vendor: "My Father's Barbeque",
    vendorHint: "South concourse",
    tags: ["mls", "local-specialty"]
  }
];

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<string, RawItem>();

  for (const raw of rawItems) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, raw);
      continue;
    }
    if (!existing.description && raw.description) {
      existing.description = raw.description;
    }
    if (!existing.vendor && raw.vendor) existing.vendor = raw.vendor;
    if (raw.vendorHint && raw.vendorHint !== existing.vendorHint) {
      existing.vendorHint = [existing.vendorHint, raw.vendorHint]
        .filter(Boolean)
        .join("; ");
    }
    const tagSet = new Set([...(existing.tags ?? []), ...(raw.tags ?? [])]);
    existing.tags = [...tagSet];
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

export async function parseDignityHealthSportsParkMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastDignityHealthSportsParkParseStats = {
    skippedVendorOnly: CURATION_SKIPPED_VENDOR_ONLY.length,
    skippedBeverages: CURATION_SKIPPED_BEVERAGES.length,
    skippedGeneric: CURATION_SKIPPED_GENERIC.length
  };

  // Confirm primary page still serves concessions assets (image/PDF shell).
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "StadiumSlop/1.0 (venue menu import)"
      }
    });
    if (!response.ok) {
      console.warn(
        `[dignity-health-sports-park] concessions page returned ${response.status}; using curated menu`
      );
    }
  } catch {
    console.warn(
      "[dignity-health-sports-park] could not reach concessions page; using curated menu"
    );
  }

  const items = mergeItems(MENU_DATA);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastDignityHealthSportsParkParseStats.skippedBeverages
  };
}

/** @internal Reference for re-verification against MLS CDN asset. */
export const DIGNITY_HEALTH_SPORTS_PARK_FB_LIST_URL = FB_LIST_IMAGE_URL;
