/**
 * Wrigley Field (Chicago Cubs) menu parser.
 *
 * Source: https://www.mlb.com/cubs/ballpark/concessions
 * The official MLB concessions page is JS-rendered and returns no static
 * content. This curated dataset is assembled from:
 *   - https://www.mlb.com/stories/chicago-cubs-ballpark-food-2026
 *   - Media tasting coverage (Bleed Cubbie Blue, Secret Chicago, Dean's Team)
 *
 * LIMITATION: This is a conservative import of confirmed 2026 new items and
 * the dedicated gluten-free stand. The full Wrigley Field concessions list
 * (classic hot dogs, nachos, pizza, etc.) is not available as static HTML
 * from the official source. Future passes should revisit the official page
 * or incorporate the MLB Ballpark app data when available.
 *
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "wrigley-field";
const VENUE_NAME = "Wrigley Field";
const SOURCE_URL = "https://www.mlb.com/cubs/ballpark/concessions";

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
  // ── New for 2026 — Marquee Classics (Section 117) ─────────────

  {
    name: "Bao Wow Dog",
    description:
      "Chargrilled Vienna Beef hot dog in a soft bao bun, tangy Heinz mustard slaw, crispy tempura sport peppers, Fresno peppers, sriracha aioli, served with fries",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "Tostada Stack",
    description:
      "Crispy tostadas layered with Hatch green chili beef, refried beans, queso fresco, Pico de Gallo, crema, topped with fried egg, side of salsa roja",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "Chicken & Churros",
    description:
      "Crispy fried chicken thighs brined in pickle juice, golden brown churros, ancho syrup, fresh strawberries",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "Double Diamond Waffle Fries",
    description:
      "Seasoned waffle fries, braised beef short rib in red wine sauce, creamy Fontina cheese sauce, bacon, mushrooms, fried onions, scallions — served in a home-plate container",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "The Kingston",
    description:
      "Jerk-spiced grilled chicken sandwich, pineapple salsa, spicy slaw, pickled red onion, garlic aioli on brioche bun",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "The Rami",
    description:
      "Hand-cut pastrami, Swiss cheese, coleslaw on rye bread, creamy Russian dressing, pickle spear",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },
  {
    name: "Dill Pickle Tater Tots",
    description:
      "Tangy salt and vinegar seasoned tater tots, fresh dill, dill pickle dip",
    fare: "Snacks",
    vendor: "Marquee Classics",
    vendorHint: "Section 117",
    tags: ["New in 2026"]
  },

  // ── Gluten-Free Stand — Park St. Grill / Clark Street Grill (Section 112) ─

  {
    name: "GF Chicken Tender Basket",
    description:
      "Gluten-free chicken tenders with thick-cut fries and BBQ sauce",
    fare: "Meals",
    vendor: "Park St. Grill (Gluten-Free Stand)",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "GF Garlic Parmesan Fries",
    description:
      "Thick-cut fries, garlic aioli, shaved parmesan, fresh parsley",
    fare: "Snacks",
    vendor: "Park St. Grill (Gluten-Free Stand)",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "Homemade Kettle Chips",
    description: "Individually packaged, gluten-free",
    fare: "Snacks",
    vendor: "Park St. Grill (Gluten-Free Stand)",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "Brown Butter Rice Crispy Treat",
    description: "Individually packaged, gluten-free",
    fare: "Desserts",
    vendor: "Park St. Grill (Gluten-Free Stand)",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "Chocolate Brownie",
    description: "Individually packaged, gluten-free",
    fare: "Desserts",
    vendor: "Park St. Grill (Gluten-Free Stand)",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },

  // ── Kids Sundays (Section 121) ─────────────────────────────────

  {
    name: "Build-Your-Own Mac & Cheese",
    description:
      "Kraft mac & cheese with add-ons: bacon, crispy chicken, hot dogs, BBQ sauce, ranch, Cheetos, Doritos (Kids Sundays only)",
    fare: "Meals",
    vendor: "Mac & Cheese Cart",
    vendorHint: "Section 121 (Sundays only)",
    tags: ["New in 2026"]
  }
];

export async function parseWrigleyFieldMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    const dietaryTags = raw.dietary ?? [];
    const extraTags = raw.tags ?? [];

    items.push({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food",
      vendorName: raw.vendor,
      vendorLocationHint: raw.vendorHint,
      dietaryTags,
      sourceUrl: SOURCE_URL
    });

    if (extraTags.length > 0) {
      const last = items[items.length - 1];
      last.dietaryTags = [
        ...dietaryTags,
        ...extraTags.filter((t): t is VenueMenuDietaryTag =>
          ["Gluten Free", "Lactose Free", "Vegan", "Vegetarian"].includes(t)
        )
      ];
    }
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
