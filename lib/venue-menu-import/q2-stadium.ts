/**
 * Q2 Stadium (Austin FC — MLS) menu parser.
 *
 * Manually transcribed from five official club menu images on the Austin FC
 * website. All menus are produced by 512 Food Co., the stadium's F&B partner.
 * The menus are matchday-specific but represent the general seasonal offerings.
 *
 * Items are deduplicated across the four club areas (East Club, Lexus Club,
 * Q2 Field Club, The Porch). The club area is stored in vendorHint.
 *
 * Dietary icons from the menus:
 *   V  = Vegetarian       → mapped to Vegetarian
 *   VG = Vegan            → mapped to Vegan
 *   AVG = Avoiding Gluten → mapped to Gluten Free
 *   N  = Contains Nuts    → not mapped (no tag in our system)
 *   SF = Contains Shellfish → not mapped
 *
 * Source: https://www.austinfc.com/stadium/menus
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "q2-stadium";
const VENUE_NAME = "Q2 Stadium";
const SOURCE_URL = "https://www.austinfc.com/stadium/menus";

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
  // ── Signature Mains ─────────────────────────────────────────────

  {
    name: "Beef Bulgogi Cheeseburger",
    description:
      "Bulgogi marinated all beef patty, provolone, house kimchi slaw, sambal chili aioli, french fries; GF bun available",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "East Club",
    dietary: ["Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Pork Bahn Mi Sandwich",
    description:
      "Toasted hoagie roll, gochujang pulled pork, pickled vegetables, cilantro mayo, Thai basil salad",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "East Club",
    tags: ["mls"]
  },
  {
    name: "Mongolian Beef Tacos",
    description:
      "Soy, ginger & garlic marinated steak, local Austin tortillas, peppers & onions, pickled cucumber slaw, Thai chili salsa; veggie/corn tortillas available",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "East Club, Lexus Club (512 Co. Taqueria), Q2 Field Club (Taqueria)",
    dietary: ["Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Crispy Kickin' Chicken",
    description: "Sweet chili sauce + french fries",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "East Club",
    tags: ["mls"]
  },
  {
    name: "Cochinita Pibil Tacos",
    description:
      "Citrus & achiote marinated bone-in shoulder, pickled red onions, gangster habanero salsa, local Austin tortillas",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "The Porch",
    tags: ["mls"]
  },

  // ── Salads ──────────────────────────────────────────────────────

  {
    name: "Verde Citrus Crunch Salad",
    description:
      "Spinach & radicchio, snow peas, mandarin oranges, carrots & daikon, sunflower seeds, wonton chips",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "All clubs (East Club, Lexus Club, Q2 Field Club, The Porch)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Soba Noodle Salad",
    description:
      "Soba noodles, English cucumbers, mango watermelon radish, edamame peas, red cabbage, soy ginger scallion vinaigrette",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "All clubs",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },

  // ── Chophouse / Proteins ────────────────────────────────────────

  {
    name: "Grilled Teriyaki Chicken",
    description:
      "Marinated chicken breast, sweet teriyaki sauce, toasted sesame seeds, pickled vegetables",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (Verde Chophouse)",
    tags: ["mls"]
  },
  {
    name: "Stir Fry Noodles",
    description:
      "Stir fry noodles, chopped cabbage, shiitake mushrooms, red peppers, shredded carrots, yakisoba sauce; vegan noodles upon request",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (Verde Chophouse)",
    tags: ["mls"]
  },
  {
    name: "Grilled Teriyaki Beef",
    description: "Soy ginger beef tenderloin, spicy teriyaki glaze",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Ranch + Sea)",
    tags: ["mls"]
  },
  {
    name: "Sweet & Spicy Salmon",
    description:
      "Tamari & garlic marinated salmon, sweet & savory honey glaze, fresno chilies, green onion",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Ranch + Sea)",
    tags: ["mls"]
  },
  {
    name: "Gochujang Fried Wings",
    description:
      "Lemongrass & star anise brined chicken wings, gochujang glaze, cilantro salad",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Austin + Provisions)",
    tags: ["mls"]
  },

  // ── Sides / Vegetable Dishes ────────────────────────────────────

  {
    name: "Sichuan Fried Green Beans",
    description: "Blistered haricot verts, sichuan pepper oil",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (Verde Chophouse)",
    dietary: ["Vegetarian", "Vegan", "Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Vegetable Egg Rolls",
    description: "Sambal sweet chili glaze",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (Verde Chophouse)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Sesame Garlic Roasted Asparagus",
    description:
      "Roasted asparagus tips, sesame garlic oil, toasted sesame seeds",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Ranch + Sea)",
    dietary: ["Vegetarian", "Vegan", "Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Steam Buns",
    description: "Sweet chili sauce",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Ranch + Sea)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Black Bean Yakisoba Noodles",
    description:
      "Napa cabbage, white onions, scallions, zucchini squash, black bean sauce, pickled daikon",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Austin + Provisions)",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },

  // ── Nachos ──────────────────────────────────────────────────────

  {
    name: "Sambal Heat Nachos",
    description:
      "Sambal chili queso, pineapple pico, Thai chili salsa, garlic crema, jalapeños",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "East Club",
    dietary: ["Vegetarian", "Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Soy-Licious Nachos",
    description:
      "Sambal chili queso, sriracha pulled pork, wasabi aioli, Thai chili salsa",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Austin + Provisions)",
    dietary: ["Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Locked & Loaded Nachos",
    description:
      "ATX three cheese queso, chili con carne, pico de gallo, pickled jalapeños, siete salsa",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "The Porch",
    dietary: ["Gluten Free"],
    tags: ["mls"]
  },

  // ── Pizza (ATX Pies) ────────────────────────────────────────────

  {
    name: "Pork Belly Bahn Mi Pizza",
    description:
      "Pie of the Match: sriracha mayo, mozzarella provolone, gochujang fried pork belly, pickled carrots & daikon, Thai basil salad, cilantro aioli",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (ATX Pies)",
    tags: ["mls"]
  },
  {
    name: "Three Cheese Pizza",
    description:
      "House-made pizza sauce, fresh mozzarella, provolone, parmesan",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (ATX Pies), Q2 Field Club",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Chef's Veggie Pizza",
    description: "House-made pizza sauce, market veggies, parmesan",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (ATX Pies)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Pepperoni Pizza",
    description: "House-made pizza sauce, 512 cheese blend",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (ATX Pies), Q2 Field Club",
    tags: ["mls"]
  },

  // ── Hot Dogs / Sausage ──────────────────────────────────────────

  {
    name: "Jumbo Grilled Hot Dog",
    description: "Vegan dog and gluten-free bun available on request",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "East Club, The Porch",
    dietary: ["Gluten Free"],
    tags: ["mls"]
  },
  {
    name: "Green Chile Sausage",
    fare: "Meals",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club, Q2 Field Club",
    tags: ["mls"]
  },

  // ── Snacks ──────────────────────────────────────────────────────

  {
    name: "Pitchside Snacks & Dips",
    description: "Toasted crostinis + bahn mi dip",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "East Club, Lexus Club",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "House-Made Salsa & Tortilla Chips",
    fare: "Snacks",
    vendor: "512 Food Co.",
    vendorHint: "The Porch",
    dietary: ["Vegetarian", "Vegan", "Gluten Free"],
    tags: ["mls"]
  },

  // ── Desserts ────────────────────────────────────────────────────

  {
    name: "Five Spice Cake",
    description: "Ginger buttercream + fresh mango",
    fare: "Desserts",
    vendor: "512 Food Co.",
    vendorHint: "East Club, Lexus Club (Confection Shop), Q2 Field Club",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Lemon Bars",
    description: "With assorted berries",
    fare: "Desserts",
    vendor: "512 Food Co.",
    vendorHint: "Lexus Club (Confection Shop)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Assorted Cookies & Brownies",
    description:
      "Oatmeal raisin, chocolate chunk, peanut butter, sugar cookies",
    fare: "Desserts",
    vendor: "512 Food Co.",
    vendorHint: "All clubs",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Mango Coconut Gelato",
    fare: "Desserts",
    vendor: "512 Food Co.",
    vendorHint: "Q2 Field Club (Gelato Cart)",
    dietary: ["Vegetarian", "Gluten Free"],
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

export async function parseQ2StadiumMenu(
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
