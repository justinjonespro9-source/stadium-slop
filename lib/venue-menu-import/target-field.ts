/**
 * Target Field (Minnesota Twins) menu parser.
 *
 * Source: https://www.mlb.com/twins/ballpark/concessions
 * Curated static dataset from the official MLB concessions page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "target-field";
const VENUE_NAME = "Target Field";
const SOURCE_URL =
  "https://www.mlb.com/twins/ballpark/concessions#food";

type RawItem = {
  name: string;
  price?: number;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const MENU_DATA: RawItem[] = [
  // ── New in 2026 ────────────────────────────────────────────────
  {
    name: "Tater Tot Nachos",
    fare: "Snacks",
    vendor: "Hrbek's",
    vendorHint: "Section 114",
    tags: ["New in 2026"]
  },
  {
    name: "Bang Bang Chicken Sandwich",
    fare: "Meals",
    vendor: "Keeper's Heart Townball Tavern",
    tags: ["New in 2026"]
  },
  {
    name: "Izakaya Kazama Chocolate Fish on a Stick",
    fare: "Desserts",
    vendor: "Truly on Deck",
    tags: ["New in 2026"]
  },
  {
    name: "Justin's Candied Popcorn Bar",
    fare: "Snacks",
    vendor: "Section 106",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "La Madre Mexican Street Elote",
    fare: "Snacks",
    vendor: "La Madre",
    vendorHint: "Section 110",
    tags: ["New in 2026"]
  },
  {
    name: "No Gluten Way Stacked Burger",
    fare: "Meals",
    vendor: "No Gluten Way",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "No Gluten Way All-Beef Dog",
    fare: "Meals",
    vendor: "No Gluten Way",
    vendorHint: "Section 112",
    dietary: ["Gluten Free"],
    tags: ["New in 2026"]
  },
  {
    name: "Buffalo Chicken Mac & Cheese",
    fare: "Meals",
    vendor: "Mac and Yes Please",
    vendorHint: "Section 113",
    tags: ["New in 2026"]
  },
  {
    name: "Smoked Brisket Mac & Cheese",
    fare: "Meals",
    vendor: "Mac and Yes Please",
    vendorHint: "Section 113",
    tags: ["New in 2026"]
  },
  {
    name: "Kids Mac & Cheese",
    fare: "Meals",
    vendor: "Mac and Yes Please",
    vendorHint: "Section 113",
    tags: ["New in 2026"]
  },
  {
    name: "Grand Slam Shawarma Bowl or Wrap",
    fare: "Meals",
    vendor: "Grand Slam Shawarma",
    vendorHint: "Section 114",
    tags: ["New in 2026"]
  },
  {
    name: "Red Cow Double Barrel Burger",
    fare: "Meals",
    vendor: "Red Cow",
    vendorHint: "Section 233",
    tags: ["New in 2026"]
  },
  {
    name: "Buffalo Chicken Poutine",
    fare: "Snacks",
    vendor: "Truly on Deck",
    tags: ["New in 2026"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Truly on Deck",
    tags: ["New in 2026"]
  },

  // ── Specialties ────────────────────────────────────────────────
  {
    name: "Hot Indian Vegan Channa",
    fare: "Meals",
    vendor: "Hot Indian Foods",
    vendorHint: "Section 120",
    dietary: ["Vegan", "Gluten Free"]
  },
  {
    name: "Hot Indian Chicken Tikka",
    fare: "Meals",
    vendor: "Hot Indian Foods",
    vendorHint: "Section 120"
  },
  {
    name: "Union Hmong Kitchen Sweet and Sour Fried Pork",
    fare: "Meals",
    vendor: "Union Hmong Kitchen",
    vendorHint: "Truly On Deck"
  },

  // ── Hot Dogs and Sausage ───────────────────────────────────────
  {
    name: "Twins Big Dog w/ Chips",
    price: 10.29,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 124, 131, 232, 237, 305, 311"
  },
  {
    name: "Original Twins Dog",
    price: 7.19,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 124, 131, 232, 311, 319"
  },
  {
    name: "Sheboygan Bratwurst",
    price: 10.49,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 124, 131, 232, 237, 305, 311"
  },
  {
    name: "Sheboygan Polish Sausage",
    price: 10.49,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109"
  },
  {
    name: "Kramarczuk's Sausages",
    price: 13.29,
    fare: "Meals",
    vendor: "Kramarczuk's",
    vendorHint: "Sections 101, 112, 312"
  },
  {
    name: "TC Kid's Meal",
    price: 8.49,
    description: "Hot dog with choice of applesauce or chips and Pepsi product",
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 124, 211, 311"
  },
  {
    name: "Kramarczuk's Sampler",
    fare: "Meals",
    vendor: "Kramarczuk's",
    vendorHint: "Sections 101, 112"
  },

  // ── Sandwiches ─────────────────────────────────────────────────
  {
    name: "Burger w/ Fries",
    price: 17.69,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 118, 232, 305, 311, 319"
  },
  {
    name: "Tony O's Cuban Sandwich",
    price: 15.29,
    fare: "Meals",
    vendor: "Tony O's",
    vendorHint: "Section 114, Hrbek's, Thrivent Club"
  },
  {
    name: "Red Cow 60/40 Bacon Burger Sliders",
    price: 17.99,
    fare: "Meals",
    vendor: "Red Cow",
    vendorHint: "Section 126"
  },
  {
    name: "Murray's Steak Sandwich",
    price: 23.29,
    fare: "Meals",
    vendor: "Murray's",
    vendorHint: "Truly On Deck"
  },
  {
    name: "Murray's Smoked Beef Sandwich",
    price: 16.99,
    fare: "Meals",
    vendor: "Murray's",
    vendorHint: "Section 108"
  },
  {
    name: "Tavern Burger",
    price: 17.99,
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly On Deck"
  },
  {
    name: "Northwood Walleye Slider",
    fare: "Meals",
    vendor: "Hrbek's",
    vendorHint: "Hrbek's"
  },
  {
    name: "Royale Cheeseburger Sliders",
    fare: "Meals",
    vendor: "Hrbek's",
    vendorHint: "Hrbek's"
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly On Deck"
  },
  {
    name: "Toasted Turkey Sandwich",
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly On Deck"
  },

  // ── Italian Specialty ──────────────────────────────────────────
  {
    name: "Pizza by the Slice",
    price: 9.49,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 122, 319"
  },
  {
    name: "Pizza Lucé Whole Pie",
    price: 38.59,
    description: "16-inch whole pies from Pizza Lucé",
    fare: "Meals",
    vendor: "Pizza Lucé",
    vendorHint: "Section 234"
  },
  {
    name: "Pizza Lucé Gluten Free Pie",
    price: 28.49,
    description: "10-inch gluten-free pies from Pizza Lucé",
    fare: "Meals",
    vendor: "Pizza Lucé",
    vendorHint: "Section 234",
    dietary: ["Gluten Free"]
  },
  {
    name: "Pizza Lucé Slice",
    price: 9.49,
    fare: "Meals",
    vendor: "Pizza Lucé",
    vendorHint: "Section 234"
  },
  {
    name: "Pizza Lucé Pickle Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Lucé",
    vendorHint: "Section 234"
  },
  {
    name: "Buffalo Chicken Bacon Ranch Flatbread",
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly on Deck"
  },
  {
    name: "Caprese Bruschetta Flatbread",
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly on Deck",
    dietary: ["Vegetarian"]
  },
  {
    name: "Prosciutto and Hot Honey Flatbread",
    fare: "Meals",
    vendor: "Truly on Deck",
    vendorHint: "Truly on Deck"
  },

  // ── Mexican Specialty ──────────────────────────────────────────
  {
    name: "Nachos w/ Cheese",
    price: 9.29,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 111, 124, 131, 230, 306"
  },
  {
    name: "Grande Nacho",
    price: 13.69,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 306, 111, 123, 319"
  },
  {
    name: "Souvenir Helmet Nacho Grande",
    price: 18.99,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 306, 111, 123, 319"
  },
  {
    name: "Beef Tacos",
    price: 11.99,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 305"
  },
  {
    name: "Beef Burrito",
    price: 11.99,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 305"
  },
  {
    name: "La Tapatia Adobo Chicken Tacos",
    price: 7.39,
    fare: "Meals",
    vendor: "La Tapatia",
    vendorHint: "Section 116, Thrivent Club"
  },
  {
    name: "Walking Taco",
    price: 17.09,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 111, 123, 319, Thrivent Club"
  },
  {
    name: "Taco Libre Machete or Bowl",
    fare: "Meals",
    vendor: "Taco Libre",
    vendorHint: "Section 103"
  },

  // ── Soups and Salads ───────────────────────────────────────────
  {
    name: "Chili",
    price: 9.49,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 117"
  },
  {
    name: "Loon Chili",
    fare: "Meals",
    vendor: "Keeper's Heart Townball Tavern",
    vendorHint: "Keeper's Heart Townball Tavern"
  },

  // ── Fryers ─────────────────────────────────────────────────────
  {
    name: "Chicken Tenders w/ Fries",
    price: 15.19,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 118, 232, 305, 311, 319"
  },
  {
    name: "French Fries",
    price: 7.49,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 118, 232, 305, 311, 319",
    dietary: ["Vegetarian"]
  },
  {
    name: "Cheese Curds",
    price: 10.99,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 232, 305"
  },
  {
    name: "Mac's Fish and Chips",
    price: 15.59,
    fare: "Meals",
    vendor: "Townball Tavern",
    vendorHint: "Townball Tavern"
  },
  {
    name: "Corn Dog",
    price: 8.99,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Section 232"
  },
  {
    name: "Waffle Fry Basket",
    fare: "Snacks",
    vendor: "Hrbek's",
    vendorHint: "Hrbek's"
  },
  {
    name: "Loaded Waffle Fries",
    fare: "Snacks",
    vendor: "Keeper's Heart Townball Tavern",
    vendorHint: "Keeper's Heart Townball Tavern"
  },

  // ── Snacks and Candy ───────────────────────────────────────────
  {
    name: "Popcorn",
    price: 6.99,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 124, 126, 305, 319, 232",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Bavarian Pretzel w/ Cheese",
    price: 9.79,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 105, 109, 120, 124, 131, 232, 237, 305"
  },
  {
    name: "Peanuts",
    price: 6.49,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Most Stands",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Cracker Jacks",
    price: 5.99,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Most Stands"
  },
  {
    name: "Cotton Candy",
    price: 7.29,
    fare: "Snacks",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 109, 114, 118, 126, 131, 232, 304, 319",
    dietary: ["Gluten Free"]
  },

  // ── Desserts ───────────────────────────────────────────────────
  {
    name: "Waffle Cone",
    price: 10.19,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 109, 118, 131, 232, 304, 319"
  },
  {
    name: "Ice Cream Helmet",
    price: 12.19,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 109, 118, 131, 232, 304, 319"
  },
  {
    name: "Dippin Dots",
    price: 9.49,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 108, 114, 122, 230, 309, 319"
  },
  {
    name: "Johnny Pops",
    price: 6.99,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Section 126"
  },
  {
    name: "Mini Donuts",
    price: 6.99,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 134, 323"
  },
  {
    name: "Deep Fried Oreos",
    price: 8.49,
    fare: "Desserts",
    vendor: "Hennepin Grille",
    vendorHint: "Section 232"
  },
  {
    name: "Red Velvet Brownie Sundae",
    fare: "Desserts",
    vendor: "Truly on Deck",
    vendorHint: "Truly on Deck"
  },

  // ── Value Menu (food only) ─────────────────────────────────────
  {
    name: "Value Hot Dog",
    price: 3.99,
    description: "Twins Value Menu hot dog",
    fare: "Meals",
    vendor: "Twins Value Menu",
    vendorHint: "Sections 120, 133, 311, 323"
  },
  {
    name: "Value Soft Pretzel",
    price: 4.49,
    description: "Twins Value Menu soft pretzel",
    fare: "Snacks",
    vendor: "Twins Value Menu",
    vendorHint: "Sections 120, 133, 311, 323"
  },
  {
    name: "Ice Cream Novelty",
    price: 3.49,
    fare: "Desserts",
    vendor: "Twins Value Menu",
    vendorHint: "Sections 120, 133, 311, 323"
  },

  // ── Dietary (unique items not captured elsewhere) ──────────────
  {
    name: "Vegan Burger",
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Sections 109, 305",
    dietary: ["Vegan"]
  },
  {
    name: "Baked Potato",
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 117",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Herbivorous Butcher",
    fare: "Meals",
    description: "Plant-based selections from Herbivorous Butcher",
    vendor: "Herbivorous Butcher",
    vendorHint: "Section 126 Market",
    dietary: ["Vegan"]
  },
  {
    name: "Veggie Burrito",
    price: 11.99,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 305",
    dietary: ["Vegetarian"]
  },
  {
    name: "Veggie Taco",
    price: 11.99,
    fare: "Meals",
    vendor: "Hennepin Grille",
    vendorHint: "Section 305",
    dietary: ["Vegetarian"]
  }
];

export async function parseTargetFieldMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    const dietaryTags = raw.dietary ?? [];
    const extraTags = raw.tags ?? [];

    items.push({
      name: raw.name,
      price: raw.price,
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
        ...extraTags.filter((t): t is typeof dietaryTags[number] =>
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
