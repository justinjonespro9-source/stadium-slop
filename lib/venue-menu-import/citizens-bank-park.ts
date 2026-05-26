/**
 * Citizens Bank Park (Philadelphia Phillies) menu parser.
 *
 * Source: https://www.mlb.com/phillies/ballpark/information/concessions
 * Curated static dataset from the official Phillies concessions guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "citizens-bank-park";
const VENUE_NAME = "Citizens Bank Park";
const SOURCE_URL =
  "https://www.mlb.com/phillies/ballpark/information/concessions";

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
  // ── 1883 Burger Co (Sections 108, 207) ─────────────────────────
  {
    name: "1883 Smash Burger",
    description:
      "Two Pat LaFrieda blend patties, yellow American cheese, Grillo's Pickles, sweet heat sauce, Liscio's potato roll",
    fare: "Meals",
    vendor: "1883 Burger Co",
    vendorHint: "Sections 108, 207"
  },
  {
    name: "Big Mozz Sticks",
    fare: "Snacks",
    vendor: "1883 Burger Co",
    vendorHint: "Sections 108, 207; also Coca-Cola Corner"
  },

  // ── Bull's BBQ (Left Field Plaza) ──────────────────────────────
  {
    name: "Bull's BBQ Pulled Pork",
    description: "Available as platter with two sides",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza"
  },
  {
    name: "Bull's BBQ Sliced Smoked Turkey Sandwich",
    description: "Available as platter with two sides",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza"
  },
  {
    name: "Burnt Ends Cheesesteak",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza"
  },
  {
    name: "Bull's BBQ Ribs",
    description: "Available as platter with two sides",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza"
  },
  {
    name: "Bull Dog Kielbasa Sandwich",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza"
  },
  {
    name: "Bull's Sampler Platter",
    description:
      "Signature pulled pork, burnt ends, smoked turkey, baked beans, creamy coleslaw, classic white bread",
    fare: "Meals",
    vendor: "Bull's BBQ",
    vendorHint: "Left Field Plaza",
    tags: ["New in 2026"]
  },

  // ── Campo's (Ashburn Alley) ────────────────────────────────────
  {
    name: "Campo's Cheesesteak",
    fare: "Meals",
    vendor: "Campo's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "Campo's Chicken Cheesesteak",
    fare: "Meals",
    vendor: "Campo's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "Campo's Veggie Steak",
    fare: "Meals",
    vendor: "Campo's",
    vendorHint: "Ashburn Alley",
    dietary: ["Vegetarian"]
  },
  {
    name: "The Heater",
    fare: "Meals",
    vendor: "Campo's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "The Sweeper",
    description:
      "Jesús Luzardo's signature: ribeye steak, pizza sauce, provolone, pepperoni (available only when Luzardo pitches)",
    fare: "Meals",
    vendor: "Campo's",
    vendorHint: "Ashburn Alley",
    tags: ["New in 2026"]
  },

  // ── Chickie's & Pete's (Ashburn Alley + multiple sections) ────
  {
    name: "Chickie's & Pete's Crabfries",
    fare: "Snacks",
    vendor: "Chickie's & Pete's",
    vendorHint:
      "Ashburn Alley, Sections 126, 139, 208, 219, 225, 319, 329"
  },
  {
    name: "Chickie's & Pete's Chicken Tenders",
    fare: "Meals",
    vendor: "Chickie's & Pete's",
    vendorHint: "Ashburn Alley, Sections 126, 139"
  },

  // ── Coca-Cola Corner (Left Field Plaza) ────────────────────────
  {
    name: "Sánchez Sliders",
    fare: "Meals",
    vendor: "Coca-Cola Corner",
    vendorHint: "Left Field Plaza",
    tags: ["New in 2026"]
  },
  {
    name: "Schwarbomb Sundae",
    description: "Soft-serve sundae",
    fare: "Desserts",
    vendor: "Coca-Cola Corner",
    vendorHint: "Left Field Plaza",
    tags: ["New in 2026"]
  },

  // ── Colbie's Southern Kissed Chicken (Section 120) ─────────────
  {
    name: "Colbie's Original Chicken Sandwich",
    fare: "Meals",
    vendor: "Colbie's Southern Kissed Chicken",
    vendorHint: "Section 120"
  },
  {
    name: "Nashville Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "Colbie's Southern Kissed Chicken",
    vendorHint: "Section 120"
  },
  {
    name: "The Big Piece",
    description: "Ryan Howard's favorite chicken sandwich",
    fare: "Meals",
    vendor: "Colbie's Southern Kissed Chicken",
    vendorHint: "Section 120"
  },
  {
    name: "Peach Spoon Pie",
    fare: "Desserts",
    vendor: "Colbie's Southern Kissed Chicken",
    vendorHint: "Section 120"
  },

  // ── Federal Donuts & Chicken (Section 140) ─────────────────────
  {
    name: "Federal Donuts Chicken Sandwich",
    description: "Famous boneless chicken breast sandwich",
    fare: "Meals",
    vendor: "Federal Donuts & Chicken",
    vendorHint: "Section 140"
  },
  {
    name: "Federal Donuts Chicken Tenders",
    description:
      "Crispy hand-battered tenders with Everything Rooster dipping sauce & honey donut",
    fare: "Meals",
    vendor: "Federal Donuts & Chicken",
    vendorHint: "Section 140"
  },
  {
    name: "Federal Donuts",
    description: "Freshly made donuts",
    fare: "Desserts",
    vendor: "Federal Donuts & Chicken",
    vendorHint: "Section 140"
  },

  // ── Freddy's Frozen Custard & Steakburgers (Section 126) ──────
  {
    name: "Freddy's Steakburger",
    description: "Ballpark debut for the national chain",
    fare: "Meals",
    vendor: "Freddy's Frozen Custard & Steakburgers",
    vendorHint: "Section 126",
    tags: ["New in 2026"]
  },
  {
    name: "Freddy's Frozen Custard",
    fare: "Desserts",
    vendor: "Freddy's Frozen Custard & Steakburgers",
    vendorHint: "Section 126",
    tags: ["New in 2026"]
  },

  // ── Greens & Grains (Section 125) ──────────────────────────────
  {
    name: "Greens & Grains Gyro",
    description: "Plant-based gyro",
    fare: "Meals",
    vendor: "Greens & Grains",
    vendorHint: "Section 125",
    dietary: ["Vegan"]
  },
  {
    name: "Buffalo Chik'n Hoagie",
    description: "Citizens Bank Park exclusive",
    fare: "Meals",
    vendor: "Greens & Grains",
    vendorHint: "Section 125",
    dietary: ["Vegan"]
  },

  // ── Hatfield (Sections 135, 209, 114, 129, 314 + Coca-Cola Corner) ─
  {
    name: "Hatfield Italian Sausage",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint:
      "Hatfield Grill (Sections 135, 209), Coca-Cola Corner, Hatfield Classics Grill"
  },
  {
    name: "Hatfield Phootlong Dog",
    description: "Jumbo Phillies Frank on Liscio's Bakery potato roll",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint: "Hatfield Classics Grill (Sections 114, 129, 314)",
    tags: ["New in 2026"]
  },
  {
    name: "Phillies Frank",
    fare: "Meals",
    vendor: "Hatfield",
    vendorHint:
      "Throughout Citizens Bank Park — Hatfield Grill, Ballpark Favorites, Coca-Cola Corner, and more"
  },

  // ── Kosher Grill (Section 124) ─────────────────────────────────
  {
    name: "Kosher Hot Dog",
    fare: "Meals",
    vendor: "Kosher Grill",
    vendorHint: "Section 124"
  },

  // ── LaScala's Fire (NEW!, Philadelphia Insurance Club) ─────────
  {
    name: "LaScala's Fire Italian-American Classics",
    description: "Reimagined Italian-American classics",
    fare: "Meals",
    vendor: "LaScala's Fire",
    vendorHint: "Philadelphia Insurance Club",
    tags: ["New in 2026"]
  },

  // ── Manco & Manco Pizza (Ashburn Alley, Sections 110, 137, 204, 321, Pass & Stow) ─
  {
    name: "Manco & Manco Personal Pie",
    description: "Jersey Shore classic personal pizza",
    fare: "Meals",
    vendor: "Manco & Manco Pizza",
    vendorHint:
      "Ashburn Alley, Sections 110, 137, 204, 321, Pass and Stow"
  },

  // ── Old City Creamery (Sections 110, 137, 205, 322, 330) ──────
  {
    name: "Old City Creamery Ice Cream Cap",
    description:
      "Richman's soft-serve in miniature Phillies cap with variety of toppings",
    fare: "Desserts",
    vendor: "Old City Creamery",
    vendorHint: "Sections 110, 137, 205, 322, 330; also Coca-Cola Corner"
  },

  // ── P.J. Whelihan's (Ashburn Alley) ───────────────────────────
  {
    name: "P.J. Whelihan's Boneless Wings",
    fare: "Meals",
    vendor: "P.J. Whelihan's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "P.J. Whelihan's Buffalo Wrap",
    fare: "Meals",
    vendor: "P.J. Whelihan's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "Cheesesteak Egg Rolls",
    fare: "Snacks",
    vendor: "P.J. Whelihan's",
    vendorHint: "Ashburn Alley"
  },

  // ── Schar Gluten-Free Stand (Section 122) ──────────────────────
  {
    name: "Schar Gluten-Free Hot Dog",
    fare: "Meals",
    vendor: "Schar Gluten-Free Stand",
    vendorHint: "Section 122",
    dietary: ["Gluten Free"]
  },
  {
    name: "Schar Gluten-Free Cheesesteak",
    fare: "Meals",
    vendor: "Schar Gluten-Free Stand",
    vendorHint: "Section 122",
    dietary: ["Gluten Free"]
  },
  {
    name: "Schar Gluten-Free Turkey Club",
    fare: "Meals",
    vendor: "Schar Gluten-Free Stand",
    vendorHint: "Section 122",
    dietary: ["Gluten Free"]
  },
  {
    name: "Gluten-Free Brownie",
    fare: "Desserts",
    vendor: "Schar Gluten-Free Stand",
    vendorHint: "Section 122",
    dietary: ["Gluten Free"]
  },

  // ── Tony Luke's (Ashburn Alley) ────────────────────────────────
  {
    name: "Tony Luke's Cheesesteak",
    fare: "Meals",
    vendor: "Tony Luke's",
    vendorHint: "Ashburn Alley"
  },
  {
    name: "Tony Luke's Roast Pork Sandwich",
    description: "Old Philly-style roast pork",
    fare: "Meals",
    vendor: "Tony Luke's",
    vendorHint: "Ashburn Alley"
  },

  // ── Uncle Charlie's Steaks (Sections 109, 206, 319) ───────────
  {
    name: "Uncle Charlie's Cheesesteak",
    description:
      "Classic Philly-style on Liscio's seeded rolls with Herr's Kettle Chips",
    fare: "Meals",
    vendor: "Uncle Charlie's Steaks",
    vendorHint: "Sections 109, 206, 319"
  },

  // ── Portable Stands ────────────────────────────────────────────
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 108, 128, 138, 206, 323"
  },
  {
    name: "Philadelphia Water Ice",
    description: "Philly's famous water ice, variety of flavors",
    fare: "Desserts",
    vendorHint:
      "Ashburn Alley, Sections 118, 134, 207, 318"
  },

  // ── Wilt's Chocolate Smothered Berries (Section 111) ───────────
  {
    name: "Wilt's Chocolate Smothered Berries",
    description:
      "Reading Terminal Market viral sensation: fresh strawberries smothered in proprietary milk chocolate",
    fare: "Desserts",
    vendor: "Wilt's Chocolate Smothered Berries",
    vendorHint: "Section 111",
    tags: ["New in 2026"]
  }
];

export async function parseCitizensBankParkMenu(
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
