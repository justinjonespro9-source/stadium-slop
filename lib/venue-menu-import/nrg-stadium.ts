/**
 * NRG Stadium (Houston Texans, FIFA World Cup 2026) menu parser.
 *
 * The official concessions page is an NFL club CMS landing page with
 * level concession map images (Cloudinary PNGs) and merch/bar copy only.
 * No item-level HTML, JSON, accordions, or ordering API on the public page.
 *
 * Menu rows are curated from `data/league-import/nfl-venues-import.cleaned.csv`,
 * 2025–2026 Aramark/Texans press (Houston Chronicle, KHOU), and DiningOut guides.
 * Re-fetch map image IDs when the page updates.
 *
 * Source: https://www.houstontexans.com/game-day/concessions-and-merch
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "nrg-stadium";
const VENUE_NAME = "NRG Stadium";
const SOURCE_URL =
  "https://www.houstontexans.com/game-day/concessions-and-merch";

/** Cloudinary map asset IDs observed on the concessions page (audit). */
const CONCESSION_MAP_IDS = [
  "ydli095nfzht9nofbnus",
  "wsiqkooxd4gsrsjcs7dq",
  "ki6lui9dxx9tzzuknz8c"
] as const;

export let lastNrgStadiumParseStats = {
  concessionMapCount: 0,
  hasExtractableMenuText: false,
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedMerch: 0,
  skippedGeneric: 0,
  deduped: 0
};

export const CURATION_SKIPPED_VENDOR_ONLY = [
  "Bud Light Cantina / Lounge (bar atmosphere only)",
  "BMW Lone Star Ballroom (venue space, not a dish)",
  "Crown Royal Saloon (bar)",
  "ARAMARK Non-Profit Program (operations copy)"
] as const;

export const CURATION_SKIPPED_BEVERAGES = [
  "Dirty H-Town Soda",
  "Hugorita Float",
  "Frozen margaritas",
  "Maui Wowi smoothies / coffee",
  "Beer / liquor / cocktail stands"
] as const;

export const CURATION_SKIPPED_MERCH = [
  "Houston Texans Team Shop",
  "Novelty / merchandise stands"
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
    local?: boolean;
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
  // ── Headline / NFL import ─────────────────────────────────────────

  item("Trill Town Loaded Fries", "Trill Burgers", {
    description:
      "Crinkle fries with chopped smashburger patties, Trill Sauce, caramelized onions, and American cheese",
    vendorHint: "Sections 115, 135, 520, 548"
  }),
  item("Seafood Boudin Wings", "STUFF'd Wings", {
    description: "Jumbo wings stuffed with seafood boudin and dirty rice filling",
    vendorHint: "Section 510"
  }),
  item("Mediterranean Nachos", "Craft Pita", {
    description:
      "Pita chips with roasted chicken, hummus, feta, cucumber-tomato salad, spicy tahini",
    vendorHint: "Sections 310, 338"
  }),
  item("Brisket Tallow Popcorn", "Truth BBQ", {
    description: "Popcorn tossed in house brisket tallow and Truth rub",
    fare: "Snacks",
    vendorHint: "Sections 109, 129"
  }),
  item("The Vincent", "America's Pie Kitchen & Grille", {
    description:
      "Chicken cutlet, fresh mozzarella, fried pepperoni, vodka sauce, hot honey on a seeded roll",
    vendorHint: "Section 114"
  }),
  item("Maui BBQ Meat Pie", "G'Day Gourmet", {
    description: "Savory meat pie with roast pork in Huli Huli BBQ sauce",
    vendorHint: "Section 111"
  }),
  item("Kielbasa Pierogie Special", "The Pierogie Place", {
    description:
      "Potato and cheese pierogies with caramelized onions, Dietz & Watson kielbasa, sour cream",
    vendorHint: "Section 134"
  }),
  item("Kelly Green Jumbo Cookie", "Stadium Treats", {
    description: "Large sugar cookie with kelly green frosting",
    fare: "Desserts",
    vendorHint: "Various markets",
    local: false
  }),
  item("Honey Butter Tenders", "Love & Honey Fried Chicken", {
    description: "Signature honey butter chicken tenders with cornbread",
    vendorHint: "Section 108"
  }),

  // ── Trill Burgers ─────────────────────────────────────────────────

  item("OG Trill Burger", "Trill Burgers", {
    description: "Bun B smashburger with Trill Sauce",
    vendorHint: "Sections 115, 135, 520, 548"
  }),
  item("Vegan OG Burger", "Trill Burgers", {
    description: "Proprietary soy-free plant-based patty",
    vendorHint: "Sections 115, 135, 520, 548",
    dietary: ["Vegan", "Vegetarian"]
  }),

  // ── Truth BBQ ─────────────────────────────────────────────────────

  item("Chopped Brisket Sandwich", "Truth BBQ", {
    vendorHint: "Sections 109, 129"
  }),
  item("BBQ Brisket Nachos", "Truth BBQ", {
    vendorHint: "Sections 109, 129"
  }),
  item("Truth Dog", "Truth BBQ", {
    description: "BBQ hot dog",
    vendorHint: "Sections 109, 129"
  }),
  item("Pulled Pork Sandwich", "Truth BBQ", {
    vendorHint: "Sections 109, 129"
  }),
  item("Hickory-Smoked Ribs", "Truth BBQ", {
    vendorHint: "Sections 309, 337 (club level)"
  }),
  item("Truth Sausage", "Truth BBQ", {
    vendorHint: "Sections 309, 337 (club level)"
  }),
  item("Banana Pudding", "Truth BBQ", {
    fare: "Desserts",
    vendorHint: "Sections 309, 337 (club level)"
  }),

  // ── El Tiempo Cantina ─────────────────────────────────────────────

  item("Sizzling Fajita Tacos", "El Tiempo Cantina", {
    vendorHint: "Sections 118, 138, 501, 527"
  }),
  item("Fully Loaded Nachos", "El Tiempo Cantina", {
    description: "Nachos served in a souvenir Texans helmet",
    fare: "Snacks",
    vendorHint: "Sections 118, 138, 501, 527"
  }),

  // ── Craft Pita ────────────────────────────────────────────────────

  item("Chicken Kabob", "Craft Pita", {
    vendorHint: "Sections 310, 338"
  }),
  item("Gyro Pita", "Craft Pita", {
    vendorHint: "Sections 310, 338"
  }),

  // ── Philly Flats ──────────────────────────────────────────────────

  item("Cheesesteak", "Philly Flats", {
    vendorHint: "Sections 112, 536"
  }),
  item("Trash Can Fries", "Philly Flats", {
    fare: "Snacks",
    vendorHint: "Sections 112, 536"
  }),

  // ── America's Pie ─────────────────────────────────────────────────

  item("Cheesesteak Eggroll", "America's Pie Kitchen & Grille", {
    vendorHint: "Section 114"
  }),
  item("Nachos", "America's Pie Kitchen & Grille", {
    fare: "Snacks",
    vendorHint: "Section 114"
  }),

  // ── Pierogie Place ─────────────────────────────────────────────────

  item("Traditional Pierogi", "The Pierogie Place", {
    vendorHint: "Section 134"
  }),
  item("Bacon Pierogi", "The Pierogie Place", {
    vendorHint: "Section 134"
  }),
  item("Jalapeño Pierogi", "The Pierogie Place", {
    vendorHint: "Section 134"
  }),

  // ── Wing Kitchen / STUFF'd ─────────────────────────────────────────

  item("Bone-In Wings", "The Wing Kitchen", {
    vendorHint: "Section 108"
  }),
  item("Boneless Wings", "The Wing Kitchen", {
    vendorHint: "Section 108"
  }),

  // ── Hugo's (club) ─────────────────────────────────────────────────

  item("Brisket Tacos", "Hugo's", {
    vendorHint: "Sections 309, 337"
  }),
  item("Street Corn", "Hugo's", {
    fare: "Snacks",
    vendorHint: "Sections 309, 337"
  }),
  item("Chicken Taquitos", "Hugo's", {
    vendorHint: "Sections 309, 337"
  }),

  // ── 2025 Aramark additions (press) ────────────────────────────────

  item("Chicken Wonton Nachos", "Asian Fusion", {
    vendorHint: "Main concourses"
  }),
  item("Asian Infusion Beef Teriyaki Tacos", "Asian Fusion", {
    vendorHint: "Main concourses"
  }),
  item("Loaded General Tso Stack Fry", "Asian Fusion", {
    description: "General Tso chicken over waffle fries with white queso",
    fare: "Snacks",
    vendorHint: "Main concourses"
  }),
  item("Bang Bang Bites", "Asian Fusion", {
    fare: "Snacks",
    vendorHint: "Main concourses"
  }),
  item("Hula Hog Nachos", "Texas Smokehouse", {
    description:
      "Smoked pulled pork, nacho cheese, mango pico, sour cream, fried onions on Tostitos",
    fare: "Snacks",
    vendorHint: "Sections 305, 314, 333, 342"
  }),
  item("Most Valuable Porky", "Texas Smokehouse", {
    description:
      "Pulled pork, BBQ sauce, fried mac and cheese wedges, coleslaw, potato bun, sidewinder fries",
    vendorHint: "Sections 305, 314, 333, 342"
  }),
  item("Pigskin Pile Up", "Texas Smokehouse", {
    description: "Chicken tenders, sidewinder fries, bourbon rolls, mac and cheese wedge",
    fare: "Snacks",
    vendorHint: "Sections 305, 314, 333, 342"
  }),
  item("Wagyu Chopped Cheesesteak", "Chris Shepherd", {
    description:
      "Ground wagyu, nacho cheese, grilled onions and peppers, hoagie, sidewinder fries",
    vendorHint: "Sections 305, 314, 333, 342"
  }),
  item("Strawberry Cheesecake Dessert Pretzel", "Stadium Treats", {
    fare: "Desserts"
  })
];

export function auditNrgStadiumConcessionsHtml(html: string): {
  concessionMapIds: string[];
  hasExtractableMenuText: boolean;
} {
  const ids = CONCESSION_MAP_IDS.filter((id) => html.includes(id));
  const hasExtractableMenuText =
    /\b(trill|truth\s+bbq|el\s+tiempo|brisket|cheesesteak|loaded\s+nachos)\b/i.test(
      html
    ) && !/concession\s+guide.*download\s+the\s+houston\s+texans\s+mobile\s+app/i.test(
      html
    );
  return { concessionMapIds: ids, hasExtractableMenuText };
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

    lastNrgStadiumParseStats.deduped += 1;
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

export async function parseNrgStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastNrgStadiumParseStats = {
    concessionMapCount: 0,
    hasExtractableMenuText: false,
    skippedVendorOnly: CURATION_SKIPPED_VENDOR_ONLY.length,
    skippedBeverages: CURATION_SKIPPED_BEVERAGES.length,
    skippedMerch: CURATION_SKIPPED_MERCH.length,
    skippedGeneric: 0,
    deduped: 0
  };

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "StadiumSlop/1.0 (venue-menu-import)"
      }
    });
    if (response.ok) {
      const html = await response.text();
      const audit = auditNrgStadiumConcessionsHtml(html);
      lastNrgStadiumParseStats.concessionMapCount = audit.concessionMapIds.length;
      lastNrgStadiumParseStats.hasExtractableMenuText =
        audit.hasExtractableMenuText;
      if (audit.concessionMapIds.length < CONCESSION_MAP_IDS.length) {
        console.warn(
          `[nrg-stadium] Concession map image IDs changed; re-verify curated menu against new maps`
        );
      }
    } else {
      console.warn(
        `[nrg-stadium] concessions page returned ${response.status}; using curated menu`
      );
    }
  } catch {
    console.warn("[nrg-stadium] could not reach concessions page; using curated menu");
  }

  const items = mergeItems(MENU_DATA);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastNrgStadiumParseStats.skippedBeverages
  };
}
