/**
 * Great American Ball Park (Cincinnati Reds) menu parser.
 *
 * Source: https://www.mlb.com/reds/ballpark/gabp-food
 * Curated static dataset from the official Reds GABP Food page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "great-american-ball-park";
const VENUE_NAME = "Great American Ball Park";
const SOURCE_URL = "https://www.mlb.com/reds/ballpark/gabp-food";

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
  // ── Featured Items — New in 2026 ──────────────────────────────

  {
    name: "Queen City Classic Burger",
    description:
      "Double all-beef smash burger, American cheese, special sauce, lettuce, tomato on potato roll with colossal crisp fries",
    fare: "Meals",
    vendor: "Fan Zone Food Hub",
    vendorHint: "Section 130",
    tags: ["New in 2026"]
  },
  {
    name: "Queen City Crunch Burger",
    description:
      "Double all-beef smash burger, pimento cheese, crushed Grippo's chips, pickles on potato roll with colossal crisp fries",
    fare: "Meals",
    vendor: "Fan Zone Food Hub",
    vendorHint: "Section 130",
    tags: ["New in 2026"]
  },
  {
    name: "G.L.T. – Goetta, Lettuce & Tomato",
    description:
      "Crispy Glier's goetta patty, shredded lettuce, tomatoes, pickles, American cheese, Woeber's horseradish aioli on slider buns",
    fare: "Meals",
    vendor: "Food Bars",
    vendorHint: "Sections 129, 416",
    tags: ["New in 2026"]
  },
  {
    name: "Glier's Goetta Nachos",
    description:
      "Glier's goetta crumbles, Funacho cheese sauce, chipotle sour cream, pickled jalapeños over tortilla chips",
    fare: "Meals",
    vendor: "Food Bars",
    vendorHint: "Sections 129, 416",
    tags: ["New in 2026"]
  },
  {
    name: "Stadium Burnt Ends",
    description:
      "Bar-S southwest-style sausage pieces fried with sweet BBQ rub and sauce, pickled red onions, white BBQ sauce",
    fare: "Meals",
    vendor: "Porkopolis / Scouts Club",
    vendorHint: "Section 412, Scouts Club",
    tags: ["New in 2026"]
  },
  {
    name: "The Cincy Heat",
    description:
      "Hempler's double-smoked sausage, Italian braised peppers and onions, Woeber's whole grain mustard on hoagie roll",
    fare: "Meals",
    vendor: "Food Bar",
    vendorHint: "Section 109",
    tags: ["New in 2026"]
  },
  {
    name: "Hempler's Jalapeño Cheddar Cajun Bowl",
    description:
      "Hempler's jalapeño cheddar sausage bites, sautéed peppers and onions on dirty Cajun rice, Cajun cream sauce",
    fare: "Meals",
    vendor: "Food Bar",
    vendorHint: "Section 109",
    tags: ["New in 2026"]
  },
  {
    name: "Smoked Brisket Street Corn Bowl",
    description:
      "Montgomery Inn smoked brisket, Mexican street corn, pickled red onions, jalapeños, Cotija cheese, BBQ sauce",
    fare: "Meals",
    vendor: "Mr. Red's Smokehouse",
    vendorHint: "Section 138",
    tags: ["New in 2026"]
  },
  {
    name: "White Chicken Chili Fry Box",
    description:
      "Grilled chicken, hatch green chili queso, white beans, sour cream, pickled red onions, cilantro on colossal crisp fries",
    fare: "Meals",
    vendor: "Frybox",
    vendorHint: "Sections 137, 534",
    tags: ["New in 2026"]
  },
  {
    name: "Frito Chili Fry Box",
    description:
      "Vegetarian Frito chili, Funacho cheese sauce, crushed Fritos, pickled jalapeños, ranch on colossal fries",
    fare: "Meals",
    vendor: "Frybox",
    vendorHint: "Sections 137, 534",
    dietary: ["Vegetarian"],
    tags: ["New in 2026"]
  },
  {
    name: "Tofuego Tacos",
    description:
      "Three flour tortillas, chipotle shredded street tofu, jalapeño aioli, cilantro, pickled red onions, Cotija cheese",
    fare: "Meals",
    vendor: "Los Rojos Taco Cart / Scouts Club",
    vendorHint: "Section 128, Scouts Club",
    dietary: ["Vegetarian"],
    tags: ["New in 2026"]
  },
  {
    name: "Wings & Rings Boneless Wings",
    description:
      "Boneless chicken wings, choice of garlic medium or honey barbecue sauce",
    fare: "Meals",
    vendor: "Wings & Rings",
    vendorHint: "Food Hubs, Sections 112, 130",
    tags: ["New in 2026"]
  },
  {
    name: "Baby Ruth Brownie Sundae",
    description:
      "Baby Ruth chocolate brownies, soft serve ice cream, caramel syrup, whipped cream",
    fare: "Desserts",
    vendor: "Rosie's Ice Cream Stands",
    vendorHint: "Sections 132, 413",
    tags: ["New in 2026"]
  },
  {
    name: "Double Play Donut Parfait",
    description:
      "12 cinnamon sugar donuts, house-made banana pudding, vanilla wafers, Cinnamon Toast Crunch, whipped cream, caramel sauce",
    fare: "Desserts",
    vendor: "Mr. Red's Smokehouse",
    vendorHint: "Section 139",
    tags: ["New in 2026"]
  },

  // ── Concessions — Branded / Named Items ────────────────────────

  {
    name: "All Beef Hot Dog",
    fare: "Meals",
    vendorHint:
      "Sections 105, 113, 117, 130, 137, 143, 402, 405, 511, 514, 516, 525, 532"
  },
  {
    name: "Brat",
    fare: "Meals",
    vendorHint:
      "Sections 105, 113, 117, 130, 137, 143, 402, 405, 511, 514, 516, 525, 532, 534"
  },
  {
    name: "Big Red Smokey",
    fare: "Meals",
    vendorHint:
      "Sections 105, 109, 117, 130, 137, 516, 525, 532, 534"
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint: "Sections 119, 514"
  },
  {
    name: "Chick-fil-A",
    fare: "Meals",
    vendorHint: "Section 119"
  },
  {
    name: "Deluxe Nachos",
    fare: "Snacks",
    vendorHint: "Sections 109, 128, 515"
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Sections 112, 131, 519, 521"
  },
  {
    name: "Graeter's Ice Cream",
    description:
      "Cincinnati ice cream institution — Black Raspberry Chip, Chocolate, Vanilla",
    fare: "Desserts",
    vendor: "Graeter's",
    vendorHint: "Sections 119, 534"
  },
  {
    name: "LaRosa's Pizza",
    description: "Cincinnati's signature pizza",
    fare: "Meals",
    vendor: "LaRosa's",
    vendorHint: "Sections 113, 130, 519, 523"
  },
  {
    name: "Montgomery Inn",
    description: "Cincinnati BBQ — ribs and smoked meats",
    fare: "Meals",
    vendor: "Montgomery Inn",
    vendorHint: "Sections 113, 117, 130, 137, 516"
  },
  {
    name: "Penn Station",
    description: "Fresh-grilled subs",
    fare: "Meals",
    vendor: "Penn Station",
    vendorHint: "Section 112"
  },
  {
    name: "Skyline Chili",
    description: "Cincinnati-style chili — coneys and ways",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: "Sections 103, 116, 130, 518, 535"
  },
  {
    name: "Veggie Dog",
    fare: "Meals",
    vendorHint: "Sections 112, 118, 130, 137, 516, 525",
    dietary: ["Vegetarian"]
  },

  // ── Gluten-Free — distinct items ───────────────────────────────

  {
    name: "Skyline Nachos",
    description: "Skyline Chili on nachos — gluten-free",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: "Sections 102, 114, 129, 517, 535",
    dietary: ["Gluten Free"]
  },
  {
    name: "Kettle Corn",
    description: "Gluten-free",
    fare: "Snacks",
    vendorHint: "Near Main Gate",
    dietary: ["Gluten Free"]
  }
];

export async function parseGreatAmericanBallParkMenu(
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
