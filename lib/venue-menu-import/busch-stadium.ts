/**
 * Busch Stadium (St. Louis Cardinals) menu parser.
 *
 * Source: https://www.mlb.com/cardinals/ballpark/dining-concessions/food
 * Curated static dataset from the official Cardinals A-Z Full Menu.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "busch-stadium";
const VENUE_NAME = "Busch Stadium";
const SOURCE_URL =
  "https://www.mlb.com/cardinals/ballpark/dining-concessions/food";

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
  // ── A ──────────────────────────────────────────────────────────

  {
    name: "Asian Stir Fry",
    description:
      "Fried rice or noodles with choice of shrimp, chicken, pork, or beef and a fortune cookie",
    fare: "Meals",
    vendor: "Asian Action Station",
    vendorHint: "Redbird Club Section 243"
  },

  // ── B ──────────────────────────────────────────────────────────

  {
    name: "Bacon Cheddar Sausage",
    description: "Bacon cheddar sausage with sauerkraut and onions on a hot dog bun",
    fare: "Meals",
    vendor: "Outfield Grill",
    vendorHint: "Section 102"
  },
  {
    name: "Beef Brisket with Chips",
    description:
      "In-house mesquite smoked brisket, carved to order on fresh bakery roll",
    fare: "Meals",
    vendor: "Broadway BBQ / Carvery",
    vendorHint: "Sections 109, 148"
  },
  {
    name: "Big Chicken Tenders",
    description: "4 Big Chicken tenders full of big flavor",
    fare: "Meals",
    vendor: "Big Chicken",
    vendorHint: "Sections 135, 358"
  },
  {
    name: "Big Chicken Nashville Hot",
    description: "Nashville hot chicken and pickles on a brioche bun",
    fare: "Meals",
    vendor: "Big Chicken",
    vendorHint: "Sections 135, 358"
  },
  {
    name: "Big Chicken Original",
    description: "Chicken, BC sauce, pickles on brioche bun",
    fare: "Meals",
    vendor: "Big Chicken",
    vendorHint: "Sections 135, 252, 358"
  },
  {
    name: "Big Chicken & Waffles",
    description:
      "Nashville hot chicken, BC sauce, pickles between warm Belgian waffles",
    fare: "Meals",
    vendor: "Big Chicken",
    vendorHint: "Sections 135, 358"
  },
  {
    name: "Birria Ramen Bowl",
    description:
      "Shredded beef in birria sauce over ramen noodles, onions, cilantro, lime wedge",
    fare: "Meals",
    vendor: "Intentional Wok",
    vendorHint: "Section 103"
  },
  {
    name: "Bratwurst (Jumbo)",
    description: "With sauerkraut and onions on a hot dog bun",
    fare: "Meals",
    vendor: "Outfield Grill",
    vendorHint: "Section 102"
  },
  {
    name: "Bratwurst",
    description: "Traditional bratwurst served on bun",
    fare: "Meals",
    vendorHint:
      "Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club, Left Field Pavilion, Terrace Grille"
  },
  {
    name: "Brisket Dog",
    description:
      "Jumbo hot dog topped with chopped brisket, BBQ sauce, toasted onions on Fazio bun",
    fare: "Meals",
    vendor: "Outfield Grill",
    vendorHint: "Section 102"
  },

  // ── C ──────────────────────────────────────────────────────────

  {
    name: "Carvery Sandwich Plate",
    description:
      "Assorted house-prepared meats carved to order on fresh bun, chips, garden salad",
    fare: "Meals",
    vendor: "Redbird Carvery / Sandwich Showdown",
    vendorHint: "Sections 148, 249"
  },
  {
    name: "Cheeseburger",
    description: "All-beef patty topped with American cheese",
    fare: "Meals",
    vendorHint:
      "Gashouse Grills, Dizzy's Diners, Redbird Club, Left Field Pavilion"
  },
  {
    name: "Chicken Egg Rolls",
    fare: "Snacks",
    vendor: "Intentional Wok",
    vendorHint: "Section 103"
  },
  {
    name: "Chicken Tenders",
    description: "Four breaded chicken tenders",
    fare: "Meals",
    vendorHint:
      "Outfield Grill, Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club, Left Field Pavilion"
  },
  {
    name: "Crumbl Cookies",
    description:
      "Fresh-baked cookies with a Busch Stadium exclusive cookie; closed Sundays",
    fare: "Desserts",
    vendor: "Crumbl Cookies",
    vendorHint: "Portable Section 136; markets"
  },

  // ── D ──────────────────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    description: "Cup, 9 oz, or Souvenir Cardinals Helmet",
    fare: "Desserts",
    vendorHint: "Sections 138, 154, 199, 230, 266B, 451"
  },
  {
    name: "Dingers Donuts",
    description:
      "Tray of 8 or helmet of 25 homemade donuts with self-served toppings",
    fare: "Desserts",
    vendor: "Dingers Donuts",
    vendorHint: "Section 152"
  },
  {
    name: "Dulce Pop",
    description: "Handmade natural pops, variety of flavors",
    fare: "Desserts",
    vendorHint: "Carts near Sections 108, 152, 240, 446"
  },

  // ── F ──────────────────────────────────────────────────────────

  {
    name: "Freddy's Chicken Bacon Swiss Sandwich",
    description: "Grilled chicken breast, Swiss cheese, bacon on toasted bun",
    fare: "Meals",
    vendor: "Freddy's",
    vendorHint: "Section 432"
  },
  {
    name: "Freddy's Double Steakburger",
    description: "With or without bacon",
    fare: "Meals",
    vendor: "Freddy's",
    vendorHint: "Section 432"
  },
  {
    name: "Freddy's Frozen Custard",
    fare: "Desserts",
    vendor: "Freddy's",
    vendorHint: "Section 101"
  },
  {
    name: "Freddy's Fries",
    fare: "Snacks",
    vendor: "Freddy's",
    vendorHint: "Section 432"
  },
  {
    name: "Freddy's Tater Tots",
    fare: "Snacks",
    vendor: "Freddy's",
    vendorHint: "Section 432"
  },
  {
    name: "Fried Gooey Butter Cake",
    description:
      "Classic gooey butter cake covered with warm funnel cake, choice of toppings",
    fare: "Desserts",
    vendor: "Gashouse Grill",
    vendorHint: "Section 150"
  },

  // ── G ──────────────────────────────────────────────────────────

  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "Dizzy's Diner",
    vendorHint: "Section 161"
  },

  // ── H ──────────────────────────────────────────────────────────

  {
    name: "Bacon Wrapped Hot Dog",
    description:
      "Jumbo hot dog wrapped in Applewood smoked bacon, baked beans, pico de gallo, spicy aioli, crispy fried onions",
    fare: "Meals",
    vendorHint: "Sections 147, 189, 250, 440"
  },
  {
    name: "Hot Dog Burnt Ends",
    description:
      "Smoked all-beef hot dogs cut into bite-size pieces, glazed with BBQ sauce, side of potato salad",
    fare: "Meals",
    vendor: "Broadway BBQ",
    vendorHint: "Section 109"
  },
  {
    name: "Jumbo Hot Dog",
    description: "All-beef jumbo hot dog",
    fare: "Meals",
    vendorHint:
      "Throughout — Outfield Grill, Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club, Left Field Pavilion, Triple Play, Hot Dog stands"
  },
  {
    name: "Topp Dog",
    description:
      "Build-your-own jumbo sausages: grilled onions, julienne peppers, sauerkraut, nacho cheese, pico, pepper jack, pickles, giardiniera",
    fare: "Meals",
    vendor: "Topp Dog",
    vendorHint: "Section 132, Top of the 5th Section 189"
  },

  // ── I ──────────────────────────────────────────────────────────

  {
    name: "Ben & Jerry's Ice Cream",
    fare: "Desserts",
    vendor: "Ben & Jerry's",
    vendorHint: "Sections 138, 149, 265, 446"
  },

  // ── K ──────────────────────────────────────────────────────────

  {
    name: "Kids Meal",
    description: "Hot dog, drink, chips or applesauce",
    fare: "Meals",
    vendorHint: "Kids Corner Section 107"
  },

  // ── M ──────────────────────────────────────────────────────────

  {
    name: "Made in the Lou",
    description:
      "Rotating local St. Louis restaurants: Kanoa's Hawaiian Grill, K-bop, The Fattened Caf, Taste-D-Burger STL, Gulf Shores",
    fare: "Meals",
    vendorHint: "Section 146"
  },
  {
    name: "Mayo Ketchup Cheese Arepa",
    description: "Corn cake stuffed with cheese",
    fare: "Meals",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168"
  },
  {
    name: "Mayo Ketchup Empanadas",
    description: "Hand-rolled flour dough filled with beef or chicken",
    fare: "Meals",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168"
  },
  {
    name: "Mayo Ketchup Nutella Empanadas",
    description: "Puff pastry filled with Nutella",
    fare: "Desserts",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168"
  },
  {
    name: "Mayo Ketchup Cuban Sandwich",
    description:
      "Roasted pork, ham, Swiss-American cheese, dill pickles, mustard on pressed Cuban bread",
    fare: "Meals",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168"
  },
  {
    name: "Mayo Ketchup Maduros",
    description: "Fried sweet plantains",
    fare: "Snacks",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168",
    dietary: ["Vegan"]
  },
  {
    name: "Mayo Ketchup Venezuelan Dog",
    description:
      "All-beef hot dog, caramelized onions, cabbage, bacon sauce, garlic cilantro sauce, potato sticks, parmesan on Pan Pa Ti bread",
    fare: "Meals",
    vendor: "Mayo Ketchup",
    vendorHint: "Section 168"
  },

  // ── N ──────────────────────────────────────────────────────────

  {
    name: "Nachos",
    description: "Corn tortilla chips, nacho cheese, jalapeños",
    fare: "Snacks",
    vendorHint:
      "Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club, Left Field Pavilion, Triple Play",
    dietary: ["Gluten Free"]
  },
  {
    name: "STL BBQ Nachos",
    description:
      "House-smoked pulled pork, BBQ sauce, Monterey Jack cheese sauce, jalapeños, banana peppers",
    fare: "Meals",
    vendor: "Broadway BBQ",
    vendorHint: "Section 109"
  },
  {
    name: "El Birdos Nachos",
    description:
      "Signature top-your-own nachos: nacho cheese, diced onions, black olives, sour cream, salsa, pepperoncini, jalapeños; add beef or pork",
    fare: "Meals",
    vendor: "El Birdos Nachos",
    vendorHint: "Sections 131, 152, 189, 251, 452"
  },
  {
    name: "Nacho Helmet",
    description:
      "Souvenir helmet with taco meat, nacho cheese, salsa, jalapeños",
    fare: "Meals",
    vendorHint:
      "Gashouse Grills, Dizzy's, Ballpark Favorites, Left Field Pavilion",
    dietary: ["Gluten Free"]
  },
  {
    name: "Nacho Supreme",
    description: "Taco meat, nacho cheese, salsa; option to add sour cream",
    fare: "Meals",
    vendorHint:
      "Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club, Left Field Pavilion",
    dietary: ["Gluten Free"]
  },
  {
    name: "Supreme Nacho Fries",
    description:
      "French fries with nacho meat, cheese, salsa, jalapeños, sour cream",
    fare: "Meals",
    vendorHint: "Sections 169, 233, 266, 450"
  },

  // ── P ──────────────────────────────────────────────────────────

  {
    name: "Pizza Hand Tossed",
    description:
      "House tomato basil sauce; cheese, pepperoni, or pepperoni & sausage",
    fare: "Meals",
    vendor: "Redbird Club Cucina Italiano",
    vendorHint: "Section 250"
  },
  {
    name: "Mega Pizza Slice",
    description: "Mega-sized slice in pepperoni or cheese",
    fare: "Meals",
    vendorHint: "Dizzy's Section 139, Ballpark Favorites 162, 437"
  },
  {
    name: "Bavarian Pretzel",
    description: "Freshly baked 7 oz soft pretzel; option to add cheese",
    fare: "Snacks",
    vendorHint:
      "Gashouse Grills, Dizzy's Diners, Ballpark Favorites, Redbird Club Pretzelry, Left Field Pavilion, Triple Play"
  },
  {
    name: "Pulled Pork Basket with Chips",
    description:
      "St. Louis style smoked pork butt, 24hr marinated, 14hr smoked, on fresh bakery roll",
    fare: "Meals",
    vendor: "Broadway BBQ",
    vendorHint: "Section 109"
  },

  // ── R ──────────────────────────────────────────────────────────

  {
    name: "Red Hot Sausage",
    description: "Sausage links with sauerkraut and onions on a hot dog bun",
    fare: "Meals",
    vendor: "Outfield Grill",
    vendorHint: "Section 102"
  },

  // ── S ──────────────────────────────────────────────────────────

  {
    name: "St. Louis Slinger Dog",
    description:
      "Jumbo hot dog, hashbrowns, nacho meat, nacho cheese, egg; topped with onion, peppers, pepper jack",
    fare: "Meals",
    vendor: "Topp Dog",
    vendorHint: "Section 132"
  },
  {
    name: "Steamed Pork Pot Stickers",
    fare: "Snacks",
    vendor: "Intentional Wok",
    vendorHint: "Section 103"
  },
  {
    name: "Stuie's Corned Beef Sandwich",
    description: "Kosher corned beef on bread with potato salad",
    fare: "Meals",
    vendor: "Stuie's / Kohn's Kosher",
    vendorHint: "Section 147"
  },
  {
    name: "Stuie's Killer Pastrami Sandwich",
    description: "Kohn's Kosher pastrami with potato salad",
    fare: "Meals",
    vendor: "Stuie's / Kohn's Kosher",
    vendorHint: "Section 147"
  },
  {
    name: "Stuie's Knockwurst",
    description: "Traditional German knockwurst",
    fare: "Meals",
    vendor: "Stuie's / Kohn's Kosher",
    vendorHint: "Section 147"
  },
  {
    name: "Stuie's Pastrami Dog",
    fare: "Meals",
    vendor: "Stuie's / Kohn's Kosher",
    vendorHint: "Section 147"
  },

  // ── T ──────────────────────────────────────────────────────────

  {
    name: "Tater Tots",
    fare: "Snacks",
    vendor: "Crowd the Plate",
    vendorHint: "Section 148"
  },
  {
    name: "Triple Play BBQ Party Box",
    description: "Pulled pork, brisket, turkey with cornbread and potato salad",
    fare: "Meals",
    vendor: "Broadway BBQ",
    vendorHint: "Section 109"
  },
  {
    name: "Turkey Basket with Chips",
    description:
      "St. Louis style smoked turkey, 14hr smoked, sliced on fresh bakery roll",
    fare: "Meals",
    vendor: "Broadway BBQ",
    vendorHint: "Section 109"
  },

  // ── U ──────────────────────────────────────────────────────────

  {
    name: "Ultimate Stadium Nacho Tater Tots",
    description:
      "Crispy tater tots, white cheddar, pico de gallo, pickled jalapeños, cojita, sour cream, green onions; add beef or pork",
    fare: "Meals",
    vendor: "Crowd the Plate",
    vendorHint: "Section 148",
    dietary: ["Gluten Free"]
  },

  // ── W ──────────────────────────────────────────────────────────

  {
    name: "Wachos",
    description:
      "Custard nachos — crispy waffle chips, vanilla or chocolate custard, Oreo crumbles, sprinkles, chocolate & strawberry syrup in a souvenir hat",
    fare: "Desserts",
    vendor: "Dingers Donuts",
    vendorHint: "Section 152"
  },
  {
    name: "Wok Bowl",
    description: "Choice of white or fried rice, protein, vegetables, sauce",
    fare: "Meals",
    vendor: "Intentional Wok",
    vendorHint: "Section 103"
  }
];

export async function parseBuschStadiumMenu(
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
