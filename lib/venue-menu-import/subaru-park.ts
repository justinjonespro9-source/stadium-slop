/**
 * Subaru Park (Philadelphia Union — MLS) menu parser.
 *
 * The official concessions page lists vendor names and section locations only,
 * with no item-level menus. Items are cross-referenced from two sources:
 *   1. Concessions page — vendor names, section numbers
 *   2. 2026 season announcement — explicit new menu items per vendor
 *
 * Several vendors (Corner Pie, Rita's, Cheryl's Southern Style Cuisine) were
 * listed in the user's expected vendor list but do not appear on either source
 * page. These are omitted. Items like Wings, Pizza, Water Ice, and Sausage
 * were expected but not confirmed by the official sources.
 *
 * Vendor/stand names are stored as vendorName metadata only.
 * Chickie's and Pete's Crabfries and Philly Pretzel Factory's Soft Pretzels
 * are included based on universally known vendor identity (confirmed by Visit
 * Philadelphia and the vendor brand itself).
 *
 * Sources:
 *   https://www.philadelphiaunion.com/stadium/concessions
 *   https://www.philadelphiaunion.com/news/philadelphia-union-announce-new-additions-and-upgrades-at-subaru-park-for-2026-season
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "subaru-park";
const VENUE_NAME = "Subaru Park";
const SOURCE_URL =
  "https://www.philadelphiaunion.com/stadium/concessions";

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
  // ── Chickie's and Pete's (Sections 108, 117, 129) ──────────────

  {
    name: "Crabfries",
    description: "Chickie's and Pete's signature crinkle-cut fries with crab seasoning and cheese sauce",
    fare: "Snacks",
    vendor: "Chickie's and Pete's",
    vendorHint: "Sections 108, 117, 129",
    tags: ["mls"]
  },

  // ── Philly Pretzel Factory (Sections 112, 125) ──────────────────

  {
    name: "Soft Pretzel",
    fare: "Snacks",
    vendor: "Philly Pretzel Factory",
    vendorHint: "Sections 112, 125",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },

  // ── Primo Hoagies (Section 125) — from 2026 announcement ───────

  {
    name: "Turkey Diablo Hoagie",
    description: "New for 2026",
    fare: "Meals",
    vendor: "Primo Hoagies",
    vendorHint: "Section 125",
    tags: ["mls"]
  },
  {
    name: "Italian Diablo Hoagie",
    description: "New for 2026",
    fare: "Meals",
    vendor: "Primo Hoagies",
    vendorHint: "Section 125",
    tags: ["mls"]
  },

  // ── PJ Whelihan's (Sections 101, 122) — from 2026 announcement ─

  {
    name: "OG Smashburger",
    description: "New for 2026",
    fare: "Meals",
    vendor: "PJ Whelihan's",
    vendorHint: "Sections 101, 122",
    tags: ["mls"]
  },
  {
    name: "Buffalo Chicken Wrap",
    description: "New for 2026",
    fare: "Meals",
    vendor: "PJ Whelihan's",
    vendorHint: "Sections 101, 122",
    tags: ["mls"]
  },

  // ── Hatfield (Section 104, 126) — from 2026 announcement ───────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Hatfield (Sec. 104, Heineken Deck), Section 126",
    tags: ["mls"]
  },
  {
    name: "Footlong Hot Dog",
    description: "New for 2026",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Hatfield (Sec. 104, Heineken Deck), Section 126",
    tags: ["mls"]
  },
  {
    name: "Loaded Chili Footlong Dog",
    description: "New for 2026",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Section 104",
    tags: ["mls"]
  },
  {
    name: "Union Match Day Chili",
    description: "New for 2026",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Section 104",
    tags: ["mls"]
  },
  {
    name: "Roast Pork Sandwich",
    description: "Philly classic; new for 2026",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Hatfield (Sec. 104, Heineken Deck), Section 126",
    tags: ["mls"]
  },

  // ── Specialty Desserts ──────────────────────────────────────────

  {
    name: "Phang Souvenir Ice Cream Cup",
    description: "Specialty souvenir offering",
    fare: "Desserts",
    vendorHint: "Sections 104, 112, 120",
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

export async function parseSubaruParkMenu(
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
