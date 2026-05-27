/**
 * TQL Stadium (FC Cincinnati — MLS) menu parser.
 *
 * Cross-referenced from two official sources:
 *   1. 2026 new-food article — explicit item names, descriptions, vendors,
 *      section locations for 12 new concession and premium items
 *   2. Concessions guide — vendor names, section numbers, dietary notes
 *
 * The new-food article provides full item-level detail for 2026 additions.
 * The concessions guide adds existing vendors with universally tied food
 * identities (LaRosa's → pizza, Gomez → tacos, etc.).
 *
 * Vendor/stand names are stored as vendorName metadata only.
 *
 * Sources:
 *   https://www.fccincinnati.com/news/new-food-beverages-and-merchandise-to-be-offered-at-tql-stadium
 *   https://www.fccincinnati.com/matchday/concessions-guide
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "tql-stadium";
const VENUE_NAME = "TQL Stadium";
const SOURCE_URL =
  "https://www.fccincinnati.com/news/new-food-beverages-and-merchandise-to-be-offered-at-tql-stadium";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const MENU_DATA: RawItem[] = [
  // ── 2026 New Concessions Items ──────────────────────────────────

  {
    name: "Olimpico Burger",
    description: "Beef patties, smoked pimento cheese, bacon, pretzel bun",
    fare: "Meals",
    vendor: "Seven Hills Grill",
    vendorHint: "Section 112",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "bibigo Korean Fried Chicken Wings",
    description:
      "Bone-in crispy chicken wings tossed with Korean BBQ sauce; wasabi ranch on the side",
    fare: "Meals",
    vendor: "bibigo",
    vendorHint: "Section 104",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Buffalo Chicken Nachos",
    description: "Buffalo chicken, ranch, nacho cheese, green onions",
    fare: "Snacks",
    vendor: "Rhine Roost",
    vendorHint: "Section 125",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Pulled Pork Poppers",
    description: "Pulled pork, cheese corn fritters, BBQ sauce",
    fare: "Snacks",
    vendor: "Smokehaus",
    vendorHint: "Section 114",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Buffalo Cauliflower Wrap",
    description:
      "Fried cauliflower, quinoa, celery, vegan ranch, spinach tortilla",
    fare: "Meals",
    vendor: "Queen City Eats",
    vendorHint: "Section 124",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "new-in-2026"]
  },

  // ── 2026 New Premium Items ──────────────────────────────────────

  {
    name: "Jerk Chicken Bowl",
    description:
      "Coconut rice & peas, marinated chopped jerk chicken, reggae slaw, signature white sauce and jerk sauce",
    fare: "Meals",
    vendor: "Jay's Nyam & Jam",
    vendorHint: "CTI Cincinnatus Club (Premium)",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Fried Chicken Sandwich with Loaded Tots",
    fare: "Meals",
    vendor: "Alfio's Buon Cibo",
    vendorHint: "First Financial Club South Stand (Premium)",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Ancho Braised Birria",
    description:
      "Slow-braised beef birria with birria consomme, cilantro, onions",
    fare: "Meals",
    vendorHint: "All-Inclusive Clubs (Premium)",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Gooey Butter Cake",
    fare: "Desserts",
    vendorHint: "All-Inclusive Clubs (Premium)",
    dietary: ["Vegetarian"],
    tags: ["mls", "new-in-2026", "local-specialty"]
  },
  {
    name: "Carne Asada Deviled Eggs",
    description: "Ribeye steak, tajin, chimichurri",
    fare: "Snacks",
    vendorHint: "The Speakeasy (Premium)",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Goetta Sliders",
    description:
      "Crispy goetta, lettuce, tomato, aioli; goetta is a Cincinnati-original sausage",
    fare: "Meals",
    vendorHint: "Suites (Premium)",
    tags: ["mls", "new-in-2026", "local-specialty"]
  },
  {
    name: "Big Bella",
    description:
      "Mortadella, pistachio cream, mozzarella, arugula, focaccia",
    fare: "Meals",
    vendorHint: "Suites (Premium)",
    tags: ["mls", "new-in-2026"]
  },

  // ── Existing Concessions (from guide, universally tied items) ───

  {
    name: "Pizza",
    description: "Cincinnati's own LaRosa's",
    fare: "Meals",
    vendor: "LaRosa's Pizzeria",
    vendorHint: "Sections 103, 129",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Tacos",
    fare: "Meals",
    vendor: "Gomez Tacos",
    vendorHint: "Section 106",
    tags: ["mls"]
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendor: "'Nati Nacho",
    vendorHint: "Sections 107, 126",
    tags: ["mls"]
  },
  {
    name: "Pretzel",
    fare: "Snacks",
    vendorHint: "Specialty Pretzel Cart (Sec. 126), Draft Beer and Pretzel Cart (Sec. E4)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Bundt Cakes",
    fare: "Desserts",
    vendor: "Nothing Bundt Cakes",
    vendorHint: "Section 110",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Sections E1/E2, 130",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  }
];

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  };
}

export async function parseTqlStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items: VenueMenuSourceItem[] = MENU_DATA.map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
