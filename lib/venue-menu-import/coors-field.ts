/**
 * Coors Field (Colorado Rockies) menu parser.
 *
 * Curated from the official Coors Field Dining Guide plus user-provided
 * official concessions text covering Concessions, Portable Concessions,
 * Healthy Food, and Specialty Items sections.
 *
 * Source: https://www.mlb.com/rockies/ballpark/dining-guide
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "coors-field";
const VENUE_NAME = "Coors Field";
const SOURCE_URL = "https://www.mlb.com/rockies/ballpark/dining-guide";

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
  // ── Hot Dogs / Sausages ────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Rockie Dog",
    description: "Signature Coors Field hot dog",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Veggie Dog",
    fare: "Meals",
    vendorHint: "General concessions",
    dietary: ["Vegetarian"]
  },
  {
    name: "Gluten Friendly Hot Dog",
    fare: "Meals",
    vendorHint: "Section 143",
    dietary: ["Gluten Free"],
    tags: ["healthy"]
  },
  {
    name: "Corn Dogs",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Polidori Chorizo Sausage",
    fare: "Meals",
    vendor: "Polidori Sausage",
    vendorHint: "Sections 107, 149, 321"
  },
  {
    name: "Polidori Hatch Green Chili Sausage",
    fare: "Meals",
    vendor: "Polidori Sausage",
    vendorHint: "Sections 107, 149, 321"
  },
  {
    name: "Polidori Jalapeño Cheddar Sausage",
    fare: "Meals",
    vendor: "Polidori Sausage",
    vendorHint: "Sections 107, 149, 321"
  },
  {
    name: "Polidori Italian Sausage",
    fare: "Meals",
    vendor: "Polidori Sausage",
    vendorHint: "Portable concessions"
  },
  {
    name: "Polidori Italian Pretzel Melt",
    description: "Italian sausage on a pretzel bun",
    fare: "Meals",
    vendor: "Polidori Sausage",
    vendorHint: "Specialty items"
  },
  {
    name: "Bratwurst",
    fare: "Meals",
    vendorHint: "Specialty items"
  },
  {
    name: "Mesquite House Smoked Sausage",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },

  // ── Burgers ────────────────────────────────────────────────────

  {
    name: "Helton Burger",
    description: "Made to order gourmet burgers",
    fare: "Meals",
    vendor: "Helton Burger",
    vendorHint: "Section 153"
  },
  {
    name: "Helton Fries",
    fare: "Snacks",
    vendor: "Helton Burger",
    vendorHint: "Section 153"
  },
  {
    name: "Helton Onion Rings",
    fare: "Snacks",
    vendor: "Helton Burger",
    vendorHint: "Section 153"
  },
  {
    name: "Helton Shakes",
    fare: "Desserts",
    vendor: "Helton Burger",
    vendorHint: "Section 153"
  },
  {
    name: "Double Bacon Smash",
    fare: "Meals",
    vendor: "Smashburger",
    vendorHint: "Section 303 (Rooftop)"
  },
  {
    name: "Double Classic Smash",
    fare: "Meals",
    vendor: "Smashburger",
    vendorHint: "Section 303 (Rooftop)"
  },
  {
    name: "Bacon Smash",
    fare: "Meals",
    vendor: "Smashburger",
    vendorHint: "Section 303 (Rooftop)"
  },
  {
    name: "Classic Smash",
    fare: "Meals",
    vendor: "Smashburger",
    vendorHint: "Section 303 (Rooftop)"
  },
  {
    name: "Smash Tots",
    fare: "Snacks",
    vendor: "Smashburger",
    vendorHint: "Section 303 (Rooftop)"
  },
  {
    name: "Handmade Burgers",
    fare: "Meals",
    vendorHint: "Specialty items"
  },
  {
    name: "Gluten Friendly Hamburger",
    fare: "Meals",
    vendorHint: "Section 143",
    dietary: ["Gluten Free"],
    tags: ["healthy"]
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendorHint: "General concessions",
    dietary: ["Vegetarian"]
  },
  {
    name: "Burguritto",
    description: "Burger-burrito hybrid",
    fare: "Meals",
    vendorHint: "Specialty items"
  },

  // ── Chicken ────────────────────────────────────────────────────

  {
    name: "Birdcall Chicken Sandwich",
    fare: "Meals",
    vendor: "Birdcall Deck",
    vendorHint: "Birdcall Deck"
  },
  {
    name: "Birdcall Chicken Tenders",
    fare: "Meals",
    vendor: "Birdcall Deck",
    vendorHint: "Birdcall Deck"
  },
  {
    name: "Birdcall Loaded Tater Tots",
    fare: "Snacks",
    vendor: "Birdcall Deck",
    vendorHint: "Birdcall Deck"
  },
  {
    name: "Birdcall Chicken Nuggets",
    fare: "Meals",
    vendor: "Birdcall Deck",
    vendorHint: "Birdcall Deck"
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "TLC Chicken",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Gluten Friendly Chicken Sandwich",
    fare: "Meals",
    vendorHint: "Section 143",
    dietary: ["Gluten Free"],
    tags: ["healthy"]
  },

  // ── BBQ — Famous Dave's (Section 152) ──────────────────────────

  {
    name: "Famous Dave's Georgia Chopped Pork Sandwich",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's Texas Red Hot Sandwich",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's BBQ Beef Sandwich",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's BBQ Pulled Chicken Sandwich",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's BBQ Street Tacos",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's BBQ Mac and Cheese",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's Pork Manhandler",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },
  {
    name: "Famous Dave's Ribs",
    description: "Sold by the bone",
    fare: "Meals",
    vendor: "Famous Dave's",
    vendorHint: "Section 152"
  },

  // ── BBQ — GQue (Rooftop 302, Section 331) ─────────────────────

  {
    name: "GQue Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "GQue BBQ",
    vendorHint: "Sections 302 (Rooftop), 331"
  },
  {
    name: "GQue Chopped Brisket Sandwich",
    fare: "Meals",
    vendor: "GQue BBQ",
    vendorHint: "Sections 302 (Rooftop), 331"
  },
  {
    name: "GQue BBQ Mac & Cheese Bowl",
    fare: "Meals",
    vendor: "GQue BBQ",
    vendorHint: "Sections 302 (Rooftop), 331"
  },

  // ── BBQ — Sandlot (Section 113) ────────────────────────────────

  {
    name: "Sandlot Sliced Brisket Sandwich",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },
  {
    name: "Sandlot Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },
  {
    name: "Sandlot Burnt Ends",
    description: "With coleslaw",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },
  {
    name: "Nacho Grande",
    fare: "Snacks",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },
  {
    name: "Sandlot Loaded Baked Potato",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },
  {
    name: "Sandlot Mac N Cheese",
    fare: "Meals",
    vendor: "Sandlot",
    vendorHint: "Section 113"
  },

  // ── Sandwiches — Hall & Worth (Club Level 223/236) ─────────────

  {
    name: "Chicken Caesar Wrap",
    fare: "Meals",
    vendor: "Hall & Worth",
    vendorHint: "Club Level Sections 223, 236"
  },
  {
    name: "Chopped Italian Hoagie",
    fare: "Meals",
    vendor: "Hall & Worth",
    vendorHint: "Club Level Sections 223, 236"
  },
  {
    name: "Chicken Bacon Ranch Sandwich",
    fare: "Meals",
    vendor: "Hall & Worth",
    vendorHint: "Club Level Sections 223, 236"
  },
  {
    name: "Lobster Roll",
    fare: "Meals",
    vendor: "Hall & Worth",
    vendorHint: "Club Level Sections 223, 236"
  },
  {
    name: "Wit Love Cheesesteak",
    fare: "Meals",
    vendorHint: "Specialty items"
  },

  // ── Mexican ────────────────────────────────────────────────────

  {
    name: "505 Southwest Burrito Bowl",
    description: "Made to order burritos, burrito bowls and quesadillas with 505 Southwestern salsas and green chile",
    fare: "Meals",
    vendor: "505 Burrito Bowl",
    vendorHint: "General concessions"
  },
  {
    name: "Tacos",
    fare: "Meals",
    vendorHint: "Portable concessions"
  },
  {
    name: "Smothered Birria Fries",
    fare: "Snacks",
    vendorHint: "General concessions"
  },
  {
    name: "Gluten Friendly Veggie Quesadilla",
    fare: "Meals",
    vendorHint: "Section 143",
    dietary: ["Gluten Free", "Vegetarian"],
    tags: ["healthy"]
  },

  // ── Nachos / Sides ─────────────────────────────────────────────

  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint: "General concessions"
  },
  {
    name: "Monster Nacho",
    fare: "Snacks",
    vendorHint: "General concessions"
  },
  {
    name: "Mac & Cheese",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "Fries",
    fare: "Snacks",
    vendorHint: "General concessions"
  },
  {
    name: "Onion Rings",
    fare: "Snacks",
    vendorHint: "Specialty items"
  },
  {
    name: "Mustache Pretzel",
    fare: "Snacks",
    vendorHint: "Specialty items"
  },

  // ── Pizza ──────────────────────────────────────────────────────

  {
    name: "Personal Pizza",
    fare: "Meals",
    vendorHint: "General concessions"
  },
  {
    name: "John Dough Pizza Co",
    description: "Specialty pizza",
    fare: "Meals",
    vendor: "John Dough Pizza Co",
    vendorHint: "General concessions"
  },
  {
    name: "Pizza Donut",
    fare: "Snacks",
    vendorHint: "Specialty items"
  },

  // ── Salads / Healthy ───────────────────────────────────────────

  {
    name: "Infield Greens Salad",
    description: "Made to order salad with option to add protein",
    fare: "Meals",
    vendorHint: "Section 120",
    dietary: ["Vegetarian", "Gluten Free"],
    tags: ["healthy"]
  },
  {
    name: "Salad Wraps",
    fare: "Meals",
    vendorHint: "General concessions",
    tags: ["healthy"]
  },

  // ── Carving Station (Club Level 218/238) ───────────────────────

  {
    name: "Carving Station",
    description: "Rotational carved meats, baked potato bar, nacho bar, salads made to order",
    fare: "Meals",
    vendor: "Carving Station",
    vendorHint: "Club Level Sections 218, 238"
  },

  // ── Specialty / Colorado Iconic ────────────────────────────────

  {
    name: "Rocky Mountain Oysters",
    description: "Colorado classic — deep fried bull testicles",
    fare: "Meals",
    vendorHint: "Specialty items"
  },
  {
    name: "Berrie Kabobs",
    fare: "Snacks",
    vendorHint: "Specialty items"
  },
  {
    name: "Tornadough",
    description: "Spiral-cut fried dough",
    fare: "Snacks",
    vendorHint: "Specialty items"
  },

  // ── Kids ───────────────────────────────────────────────────────

  {
    name: "Buckaroos Kids Meal",
    fare: "Meals",
    vendorHint: "General concessions"
  },

  // ── Desserts / Sweets ──────────────────────────────────────────

  {
    name: "Soft Serve Ice Cream",
    fare: "Desserts",
    vendorHint: "General concessions"
  },
  {
    name: "Cookie & Creamery",
    description: "Cookies and ice cream",
    fare: "Desserts",
    vendor: "Cookie & Creamery",
    vendorHint: "General concessions"
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Specialty items"
  },
  {
    name: "Funnel Cake",
    fare: "Desserts",
    vendorHint: "Specialty items"
  },
  {
    name: "Milkshakes",
    fare: "Desserts",
    vendorHint: "Specialty items"
  },
  {
    name: "Gluten Friendly Sweet Treat",
    fare: "Desserts",
    vendorHint: "Section 143",
    dietary: ["Gluten Free"],
    tags: ["healthy"]
  },
  {
    name: "Ice Cream Sandwiches",
    fare: "Desserts",
    vendor: "Hall & Worth",
    vendorHint: "Club Level Sections 223, 236"
  },
  {
    name: "Simply Nuts",
    description: "Flavored roasted nuts",
    fare: "Snacks",
    vendorHint: "Specialty items"
  }
];

export async function parseCoorsFieldMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl || SOURCE_URL;

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
      sourceUrl: url
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
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
