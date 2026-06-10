/**
 * Madison Square Garden (New York Knicks / Rangers) menu parser.
 *
 * Curated from the official MSG Food & Drink page (vendor + section map)
 * with item-level entries for named MSG Eats partners and Daily concepts.
 * Alcohol-only bars, generic snacks, and beverage grab-and-go are excluded.
 *
 * Source: https://www.msg.com/madison-square-garden/food-drink
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "madison-square-garden";
const VENUE_NAME = "Madison Square Garden";
const SOURCE_URL = "https://www.msg.com/madison-square-garden/food-drink";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function levelHint(level: string, section: string): string {
  return `${level} · Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  // ── Carnegie Deli ───────────────────────────────────────────────

  {
    name: "Pastrami Sandwich",
    description:
      "Carnegie Deli classic hot pastrami on rye; last NYC Carnegie Deli outpost at MSG",
    fare: "Meals",
    vendor: "Carnegie Deli",
    vendorHint: `${levelHint("100 Level", "105")}; ${levelHint("200 Level", "219")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Corned Beef Sandwich",
    description: "Carnegie Deli towering corned beef on rye",
    fare: "Meals",
    vendor: "Carnegie Deli",
    vendorHint: `${levelHint("100 Level", "105")}; ${levelHint("200 Level", "219")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },

  // ── Mighty Quinn's Barbeque ─────────────────────────────────────

  {
    name: "St. Louis Rib Plate",
    description: "Mighty Quinn's BBQ rib plate with house cornbread and slaw",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${levelHint("100 Level", "105")}; ${levelHint("200 Level", "204")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Brisket Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${levelHint("100 Level", "105")}; ${levelHint("200 Level", "204")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${levelHint("100 Level", "105")}; ${levelHint("200 Level", "204")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },

  // ── Pat LaFrieda ────────────────────────────────────────────────

  {
    name: "Pat LaFrieda\u2019s Prime Rib",
    description: "Shaved prime rib with au jus on a locally baked baguette",
    fare: "Meals",
    vendor: "Pat LaFrieda",
    vendorHint: `${levelHint("100 Level", "107")}; ${levelHint("200 Level", "203")}`,
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },

  // ── Daily Burger ────────────────────────────────────────────────

  {
    name: "Daily Burger",
    description:
      "Pat LaFrieda brisket, short rib, and chuck blend with bacon jam and cheese sauce on a flatbread roll",
    fare: "Meals",
    vendor: "Daily Burger",
    vendorHint: `${levelHint("100 Level", "106 & 116")}; ${levelHint("200 Level", "210")}; ${levelHint("Chase Bridge", "305")}`,
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Daily Burger Fries",
    description: "Thick-cut fries served at Daily Burger stands",
    fare: "Snacks",
    vendor: "Daily Burger",
    vendorHint: `${levelHint("100 Level", "106 & 116")}; ${levelHint("200 Level", "210")}; ${levelHint("Chase Bridge", "305")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },

  // ── Paulie Gee's Pizza ──────────────────────────────────────────

  {
    name: "Paulie Gee's Pizza Slice",
    description: "Wood-fired style pizza from the Greenpoint, Brooklyn institution",
    fare: "Meals",
    vendor: "Paulie Gee's Pizza",
    vendorHint: `${levelHint("100 Level", "117")}; ${levelHint("200 Level", "224")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Paulie Gee's Hot Honey Slice",
    description: "Paulie Gee's slice with Mike's Hot Honey drizzle",
    fare: "Meals",
    vendor: "Paulie Gee's Pizza",
    vendorHint: `${levelHint("100 Level", "117")}; ${levelHint("200 Level", "224")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },

  // ── Mike's Hot Honey ──────────────────────────────────────────────

  {
    name: "Hot Honey Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Mike's Hot Honey",
    vendorHint: levelHint("100 Level", "115"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Hot Honey Chicken Tenders",
    fare: "Meals",
    vendor: "Mike's Hot Honey",
    vendorHint: levelHint("100 Level", "115"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Hot Honey Garlic Wings",
    fare: "Meals",
    vendor: "Mike's Hot Honey",
    vendorHint: levelHint("100 Level", "115"),
    tags: ["nba", "nhl"]
  },

  // ── TAO Sushi ─────────────────────────────────────────────────────

  {
    name: "Sushi Roll",
    description: "Pre-made sushi rolls at TAO Sushi",
    fare: "Meals",
    vendor: "TAO Sushi",
    vendorHint: levelHint("100 Level", "118"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Custom Sushi Bowl",
    description: "Build-your-own sushi bowl at TAO Sushi",
    fare: "Meals",
    vendor: "TAO Sushi",
    vendorHint: levelHint("100 Level", "118"),
    tags: ["nba", "nhl"]
  },

  // ── Fuku ────────────────────────────────────────────────────────

  {
    name: "Fuku Spicy Fried Chicken Sandwich",
    description: "David Chang fried chicken sandwich with habanero heat",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: levelHint("100 Level", "119"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Fuku Chicken Fingers",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: levelHint("100 Level", "119"),
    tags: ["nba", "nhl", "local-vendor"]
  },

  // ── Veselka ─────────────────────────────────────────────────────

  {
    name: "Traditional Pierogies",
    description: "East Village Ukrainian diner pierogies with butter and onions",
    fare: "Meals",
    vendor: "Veselka",
    vendorHint: `${levelHint("100 Level", "109")}; ${levelHint("Chase Bridge", "304")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },

  // ── Chicken & Things ────────────────────────────────────────────

  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "Chicken & Things",
    vendorHint: `${levelHint("100 Level", "109")}; ${levelHint("200 Level", "204")}; ${levelHint("Chase Bridge", "304 & 305")}`,
    tags: ["nba", "nhl"]
  },

  // ── MSG Daily concepts ──────────────────────────────────────────

  {
    name: "Daily Pizza Slice",
    fare: "Meals",
    vendor: "Daily Pizza",
    vendorHint: "Various concourse Garden Market locations",
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Loaded Nachos",
    fare: "Meals",
    vendor: "Daily Nachos",
    vendorHint: "Various concourse Garden Market locations",
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Salad",
    fare: "Meals",
    vendor: "Daily Salads",
    vendorHint: "Various concourse Garden Market locations",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Sandwich",
    fare: "Meals",
    vendor: "Daily Sandwich",
    vendorHint: "Various concourse Garden Market locations",
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Chicken Sandwich",
    fare: "Meals",
    vendor: "Daily Chicken",
    vendorHint: "Various concourse Garden Market locations",
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Chicken Tenders",
    fare: "Meals",
    vendor: "Daily Chicken",
    vendorHint: "Various concourse Garden Market locations",
    tags: ["nba", "nhl"]
  },
  {
    name: "Daily Shake",
    fare: "Desserts",
    vendor: "Daily Shake",
    vendorHint: "Various concourse Garden Market locations",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },

  // ── 100 Level specialty stands ────────────────────────────────────

  {
    name: "Chopped Cheese Sandwich",
    description: "NYC bodega-style chopped cheese on crusty bread",
    fare: "Meals",
    vendor: "Monster Energy Bodega",
    vendorHint: levelHint("100 Level", "108"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Brooklyn Dumplings",
    fare: "Meals",
    vendor: "Brooklyn Dumpling Shop",
    vendorHint: levelHint("100 Level", "108"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Luchini Italian Sandwich",
    fare: "Meals",
    vendor: "Luchini Italian Sandwich Shop",
    vendorHint: levelHint("100 Level", "112"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Avenue Cantina Carnitas Tacos",
    fare: "Meals",
    vendor: "Avenue Cantina",
    vendorHint: levelHint("100 Level", "112"),
    tags: ["nba", "nhl"]
  },
  {
    name: "TopDog Show Dog",
    description: "Oversized loaded hot dog; shareable venue specialty",
    fare: "Meals",
    vendor: "TopDog",
    vendorHint: levelHint("100 Level", "112"),
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Shah's Hallah Sandwich",
    description: "Hallah-based sandwich; menu varies",
    fare: "Meals",
    vendor: "Shah's Hallah",
    vendorHint: levelHint("100 Level", "114"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Simply Vegan Bowl",
    fare: "Meals",
    vendor: "Simply Vegan",
    vendorHint: levelHint("100 Level", "116"),
    dietary: ["Vegan", "Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "Rock N' Lobster Roll",
    fare: "Meals",
    vendor: "Rock N' Lobster",
    vendorHint: levelHint("100 Level", "118"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Insomnia Cookie",
    fare: "Desserts",
    vendor: "Insomnia Cookies",
    vendorHint: levelHint("100 Level", "120"),
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },

  // ── 200 Level specialty stands ──────────────────────────────────

  {
    name: "SeoulBird Korean BBQ Bowl",
    fare: "Meals",
    vendor: "SeoulBird Korean BBQ",
    vendorHint: levelHint("200 Level", "210"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "7th Street Burger",
    fare: "Meals",
    vendor: "7th Street Burger",
    vendorHint: levelHint("200 Level", "224"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Garden Melt",
    description: "Grilled cheese melt from Garden Melt stands",
    fare: "Meals",
    vendor: "Garden Melt",
    vendorHint: `${levelHint("200 Level", "216–218")}; ${levelHint("Chase Bridge", "319")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  }
];

function mergeVendorHints(a?: string, b?: string): string | undefined {
  if (!a) {
    return b;
  }
  if (!b || a.includes(b)) {
    return a;
  }
  if (b.includes(a)) {
    return b;
  }
  return `${a}; ${b}`;
}

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();

  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...item });
      continue;
    }

    byName.set(key, {
      ...existing,
      vendorHint: mergeVendorHints(existing.vendorHint, item.vendorHint),
      vendor: existing.vendor ?? item.vendor,
      description: existing.description ?? item.description,
      tags: [...new Set([...(existing.tags ?? []), ...(item.tags ?? [])])]
    });
  }

  return [...byName.values()];
}

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL,
    importTags: raw.tags
  };
}

export async function parseMadisonSquareGardenMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const deduped = dedupeMenuItems(MENU_DATA);
  const items: VenueMenuSourceItem[] = deduped.map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}

export const MADISON_SQUARE_GARDEN_RAW_ITEM_COUNT = MENU_DATA.length;
