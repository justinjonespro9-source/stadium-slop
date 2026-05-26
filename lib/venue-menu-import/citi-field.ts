/**
 * Citi Field (New York Mets) menu parser.
 *
 * Source: https://www.mlb.com/mets/ballpark/citi-field-dining-guide
 * Curated static dataset from the official Mets Dining Guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "citi-field";
const VENUE_NAME = "Citi Field";
const SOURCE_URL =
  "https://www.mlb.com/mets/ballpark/citi-field-dining-guide";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── Adam Richman's Burger Hall of Fame (Section 105) ───────────
  {
    name: "Adam's Classic",
    description:
      "Pat LaFrieda burger, American cheese, shredded lettuce, tomato, onions, pickles, secret sauce, Martin's Potato Roll",
    fare: "Meals",
    vendor: "Adam Richman's Burger Hall of Fame",
    vendorHint: "Section 105"
  },
  {
    name: "The Caprese",
    description:
      "Pat LaFrieda Meatball Grind Patty, heirloom tomato, fresh mozzarella, basil aioli, garlic butter ciabatta",
    fare: "Meals",
    vendor: "Adam Richman's Burger Hall of Fame",
    vendorHint: "Section 105"
  },

  // ── Amazin' Chicken Co. (Taste of the City) ────────────────────
  {
    name: "Cheesy Tater Kegs",
    description: "Three cheese blend",
    fare: "Snacks",
    vendor: "Amazin' Chicken Co.",
    vendorHint: "Taste of the City"
  },
  {
    name: "Chicken Dog",
    description:
      "Chicken tender, hot honey, ballpark sauce, lettuce, tomato, Martin's hot dog roll",
    fare: "Meals",
    vendor: "Amazin' Chicken Co.",
    vendorHint: "Taste of the City"
  },
  {
    name: "Amazin' Chicken Tenders",
    description: "House breaded General Tso's tenders with dipping sauce",
    fare: "Meals",
    vendor: "Amazin' Chicken Co.",
    vendorHint: "Taste of the City"
  },
  {
    name: "Amazin' Chicken Bucket",
    description:
      "House breaded General Tso's tenders, Cheesy Tater Kegs, dipping sauce",
    fare: "Meals",
    vendor: "Amazin' Chicken Co.",
    vendorHint: "Taste of the City"
  },

  // ── Amazin' Deli (Section 139, 414) ────────────────────────────
  {
    name: "Chopped Cheese",
    description:
      "Pat LaFrieda's chopped beef, American cheese, lettuce, tomato, ballpark sauce, hoagie",
    fare: "Meals",
    vendor: "Amazin' Deli",
    vendorHint: "Sections 139, 414"
  },
  {
    name: "Chopped Italian",
    description:
      "Premio Italian sausage, braised peppers & onions, pesto aioli, hoagie",
    fare: "Meals",
    vendor: "Amazin' Deli",
    vendorHint: "Sections 139, 414; also Clover Home Plate Club"
  },
  {
    name: "B.E.C",
    description:
      "Griddled eggs, crispy bacon, melted American cheese on buttered Kaiser roll (day games only)",
    fare: "Meals",
    vendor: "Amazin' Deli",
    vendorHint: "Sections 139, 414"
  },

  // ── Beyond Nightlife Sushi (World's Fare Market, Section 105) ──
  {
    name: "Garlic Edamame",
    fare: "Snacks",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Vegan"]
  },
  {
    name: "Kani Salad",
    description: "Shredded crab stick, cucumber, masago, spring mix",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "1st Base Roll",
    description: "Creamy salmon, avocado topped with Scottish salmon",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "Rainbow Roll",
    description: "Crab, cucumber, wrapped with salmon, tuna, avocado, shrimp",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "3rd Base Roll",
    description: "Ebi shrimp, cucumber, topped with spicy crab",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "Nigiri Sampler",
    description: "Tuna, salmon, shrimp, yellowtail",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "Sushi Burrito",
    description:
      "Spicy salmon, masago, spicy tuna, avocado, cucumber in soy paper",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },
  {
    name: "Classic Sushi Rolls",
    description: "California, Spicy Tuna, Salmon Avocado, or Vegetable",
    fare: "Meals",
    vendor: "Beyond Nightlife Sushi",
    vendorHint: "World's Fare Market (Section 105)"
  },

  // ── Big Mozz (Section 119, 336) ────────────────────────────────
  {
    name: "Big Mozz Mozzarella Sticks",
    description: "Fresh parm, parsley, marinara sauce",
    fare: "Snacks",
    vendor: "Big Mozz",
    vendorHint:
      "Home Plate Market (Section 119), Market on Milagro Tequila Porch (Section 336)"
  },

  // ── Chiddy's Cheesesteaks (Section 132, 410) ──────────────────
  {
    name: "The Citi Fielder Cheesesteak",
    description: "Steak, sautéed onions, Cheese Whiz on a roll",
    fare: "Meals",
    vendor: "Chiddy's Cheesesteaks",
    vendorHint: "Sections 132, 410"
  },

  // ── Coca-Cola Food Truck – Taqueria Ramirez ────────────────────
  {
    name: "Nopales Tacos",
    description:
      "Two tacos with sautéed Mexican cactus, onions, garlic, guajillo, cotija cheese",
    fare: "Meals",
    vendor: "Taqueria Ramirez",
    vendorHint: "Coca-Cola Corner (Opening Day – July 12)"
  },
  {
    name: "Suadero Tacos",
    description: "Two tacos with slow cooked beef confit, traditional salsas",
    fare: "Meals",
    vendor: "Taqueria Ramirez",
    vendorHint: "Coca-Cola Corner (Opening Day – July 12)"
  },

  // ── Cookie Crumz (Section 119, 336) ────────────────────────────
  {
    name: "Chunky Dunk Cookie",
    description: "Classic chocolate chip with milk & dark chocolate chips",
    fare: "Desserts",
    vendor: "Cookie Crumz",
    vendorHint:
      "Home Plate Market (Section 119), Market on Milagro Tequila Porch (Section 336)"
  },
  {
    name: "The Fun Met I Cookie",
    description: "White chocolate chip with blue and orange sprinkles",
    fare: "Desserts",
    vendor: "Cookie Crumz",
    vendorHint:
      "Home Plate Market (Section 119), Market on Milagro Tequila Porch (Section 336)"
  },

  // ── Dole Whip (Sections 135, 150, 417) ────────────────────────
  {
    name: "Dole Whip",
    description: "Pineapple and strawberry soft serve",
    fare: "Desserts",
    vendor: "Dole Whip",
    vendorHint: "Sections 135, 150, 417, Heineken Diamond Lounge",
    dietary: ["Vegan"]
  },
  {
    name: "Apple Pie Nachos",
    description:
      "Cinnamon sugar tortillas, apple pie compote, powdered sugar, vanilla gelato",
    fare: "Desserts",
    vendor: "Dole Whip",
    vendorHint: "Sections 150, 322"
  },

  // ── Eat The Cave (Hudson Whiskey NY Club, Clover) ──────────────
  {
    name: "Beef & Cheese Nada",
    description:
      "Seasoned beef & melted cheese in a golden crispy pastry crust",
    fare: "Meals",
    vendor: "Eat The Cave",
    vendorHint: "Hudson Whiskey NY Club, Clover Home Plate Club"
  },
  {
    name: "The Vegan Nada",
    description:
      "Rice, cilantro, sweet pumpkin, chickpeas, potato in crispy pastry crust",
    fare: "Meals",
    vendor: "Eat The Cave",
    vendorHint: "Hudson Whiskey NY Club, Clover Home Plate Club",
    dietary: ["Vegan"]
  },

  // ── French Dip Sandwich (Section 133) ──────────────────────────
  {
    name: "French Dip Sandwich",
    description:
      "Shaved peppercorn crusted prime rib, caramelized onions, Boursin horseradish, melted provolone, onion ciabatta, au jus",
    fare: "Meals",
    vendorHint: "Section 133"
  },

  // ── Fuku (Section 119, 336) ────────────────────────────────────
  {
    name: "Fuku Spicy Fried Chicken Sando",
    description:
      "Crispy habanero brined chicken breast, pickles, Fuku mayo, Martin's Potato Roll",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint:
      "Home Plate Market (Section 119), Market on Milagro Tequila Porch (Section 336)"
  },

  // ── Gluten Friendly Stand (Section 105) ────────────────────────
  {
    name: "Gluten Friendly Burger",
    description:
      "Pat LaFrieda beef patty, American cheese, lettuce, tomato, onion, GF bun",
    fare: "Meals",
    vendor: "Gluten Friendly",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Gluten Friendly Ballpark Dog",
    description: "Nathan's Famous on a GF bun",
    fare: "Meals",
    vendor: "Gluten Friendly",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Gluten Friendly Chicken Tenders & Fries",
    description: "Rice flour breaded chicken tenders with assorted dipping sauces",
    fare: "Meals",
    vendor: "Gluten Friendly",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Gluten Friendly Pastrami",
    description: "On GF multigrain bread with mustard and pickle spear",
    fare: "Meals",
    vendor: "Gluten Friendly",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Southwest Turkey Burger",
    description:
      "Sazon spiced turkey patty, avocado slaw, pepper jack, ancho pepper mayo, GF bun",
    fare: "Meals",
    vendor: "Gluten Friendly",
    vendorHint: "World's Fare Market (Section 105)",
    dietary: ["Gluten Free"]
  },

  // ── Gyro Jimmy's Greek Grill (Section 139) ────────────────────
  {
    name: "Traditional Beef & Lamb Gyro",
    description:
      "Beef & lamb gyro in Greek pita with tzatziki, lettuce, tomato, onion, fries",
    fare: "Meals",
    vendor: "Gyro Jimmy's Greek Grill",
    vendorHint: "Section 139"
  },
  {
    name: "Chicken Gyro",
    description:
      "Chicken gyro in Greek pita with tzatziki, lettuce, tomato, onion, fries",
    fare: "Meals",
    vendor: "Gyro Jimmy's Greek Grill",
    vendorHint: "Section 139"
  },

  // ── Hot Pastrami on Rye ────────────────────────────────────────
  {
    name: "Hot Pastrami on Rye",
    description:
      "Hand carved, piled high on rye bread with deli mustard and kosher dill pickle",
    fare: "Meals",
    vendor: "Hot Pastrami on Rye",
    vendorHint: "Sections 115, 119, 138, CC, HDL, 408, 417"
  },

  // ── Legacy Catering by Mookie Wilson (Hudson Whiskey NY Club) ──
  {
    name: "Mookie's Smoked Pulled Chicken",
    description: "Classic golden BBQ sauce",
    fare: "Meals",
    vendor: "Legacy Catering by Mookie Wilson",
    vendorHint: "Hudson Whiskey NY Club"
  },
  {
    name: "Mookie's Smoked Sliced Pork Sandwich",
    description: "Tangy vinegar sauce & bread & butter pickles",
    fare: "Meals",
    vendor: "Legacy Catering by Mookie Wilson",
    vendorHint: "Hudson Whiskey NY Club"
  },
  {
    name: "Mookie's Sweet Corn on the Cob",
    description: "Butter basted",
    fare: "Snacks",
    vendor: "Legacy Catering by Mookie Wilson",
    vendorHint: "Hudson Whiskey NY Club"
  },
  {
    name: "Mookie's Mac & Cheese",
    description: "Southern style baked",
    fare: "Meals",
    vendor: "Legacy Catering by Mookie Wilson",
    vendorHint: "Hudson Whiskey NY Club"
  },

  // ── Lobster Shack (Section 105, 415) ───────────────────────────
  {
    name: "Chilled Fresh Maine Lobster Roll",
    description: "Fresh lobster, lemon & parsley aioli, split top bun, Bayside chips",
    fare: "Meals",
    vendor: "Lobster Shack",
    vendorHint: "Sections 105, 415"
  },
  {
    name: "Hot East Shore Lobster Roll",
    description: "Fresh lobster dipped in warm butter, lemon, split top bun, Bayside chips",
    fare: "Meals",
    vendor: "Lobster Shack",
    vendorHint: "Sections 105, 415"
  },

  // ── Metropolitan Fry Factory (Taste of the City) ───────────────
  {
    name: "Fried Pickles",
    description: "Crunchy breaded dill pickle spears with dill ranch",
    fare: "Snacks",
    vendor: "Metropolitan Fry Factory",
    vendorHint: "Taste of the City"
  },
  {
    name: "Hand Cut Fries",
    description: "Pickle Spice or Big Apple Blend seasoning",
    fare: "Snacks",
    vendor: "Metropolitan Fry Factory",
    vendorHint: "Taste of the City"
  },
  {
    name: "Oreo Churros",
    description:
      "Cream filled, rolled in cookies & cream crumb with crème anglaise",
    fare: "Desserts",
    vendor: "Metropolitan Fry Factory",
    vendorHint: "Taste of the City"
  },

  // ── Mister Softee (multiple sections) ──────────────────────────
  {
    name: "Mister Softee Ice Cream",
    description: "Cup, Helmet, or Home Run Apple",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Throughout Citi Field — 20+ locations"
  },

  // ── Mr. & Mrs. Met's Candy Shop (Section 306) ─────────────────
  {
    name: "Chocolate Covered Strawberries",
    fare: "Desserts",
    vendor: "Mr. & Mrs. Met's Candy Shop",
    vendorHint: "Excelsior Level, Section 306"
  },
  {
    name: "Home Run Candy Apple",
    fare: "Desserts",
    vendor: "Mr. & Mrs. Met's Candy Shop",
    vendorHint: "Excelsior Level, Section 306"
  },
  {
    name: "Mr. Met Chocolate Whoopie Pie",
    fare: "Desserts",
    vendor: "Mr. & Mrs. Met's Candy Shop",
    vendorHint: "Excelsior Level, Section 306; also Walk-Off Café"
  },
  {
    name: "Hildebrandt Blue & Orange Skies Ice Cream",
    description:
      "Citi Field exclusive: M&M's and marshmallow in vanilla ice cream",
    fare: "Desserts",
    vendor: "Mr. & Mrs. Met's Candy Shop",
    vendorHint: "Excelsior Level, Section 306"
  },

  // ── Nachos (multiple locations) ────────────────────────────────
  {
    name: "Nachos Grande",
    description: "With beef or chicken",
    fare: "Snacks",
    vendor: "Nachos",
    vendorHint: "WFM, Section 128, Taste of the City, 305, HDL, 414, 428"
  },

  // ── Napoli's Pizza Co. ─────────────────────────────────────────
  {
    name: "Napoli's Round Cheese Pizza",
    description: "Pizza sauce, grande mozzarella, pecorino romano",
    fare: "Meals",
    vendor: "Napoli's Pizza Co.",
    vendorHint: "Section 102, HDL, Metro Market, Section 412, Clover",
    dietary: ["Vegetarian"]
  },
  {
    name: "Napoli's Pepperoni Pizza",
    description:
      "Pizza sauce, grande mozzarella, crispy cup & char pepperoni, pecorino",
    fare: "Meals",
    vendor: "Napoli's Pizza Co.",
    vendorHint: "Section 102, HDL, Metro Market, Section 412, Clover"
  },
  {
    name: "Napoli's Signature Sicilian",
    description:
      "Premio Italian sausage, braised peppers & onions, provolone & mozzarella, pesto aioli, giardiniera (monthly rotating special)",
    fare: "Meals",
    vendor: "Napoli's Pizza Co.",
    vendorHint: "Section 102, HDL, Metro Market, Section 412, Clover"
  },

  // ── Naz's Halal Food (Section 119) ─────────────────────────────
  {
    name: "Naz's Chicken Platter",
    description:
      "Marinated chicken gyro over basmati rice with lettuce, tomato, cucumber salad",
    fare: "Meals",
    vendor: "Naz's Halal Food",
    vendorHint: "Section 119"
  },
  {
    name: "Naz's Lamb Platter",
    description:
      "Marinated lamb gyro over basmati rice with lettuce, tomato, cucumber salad",
    fare: "Meals",
    vendor: "Naz's Halal Food",
    vendorHint: "Section 119"
  },

  // ── New York Panini (Metro Market) ─────────────────────────────
  {
    name: "Verrazano Panini",
    description:
      "Breaded chicken cutlet, fresh mozzarella, vodka sauce on ciabatta",
    fare: "Meals",
    vendor: "New York Panini",
    vendorHint: "Metro Market (Excelsior Level)"
  },
  {
    name: "Flatbush Panini",
    description:
      "Cracked pepper turkey, fresh mozzarella, crushed BBQ chips, spicy mayo on ciabatta",
    fare: "Meals",
    vendor: "New York Panini",
    vendorHint: "Metro Market (Excelsior Level)"
  },

  // ── Pat LaFrieda Meat Purveyors ────────────────────────────────
  {
    name: "Pat LaFrieda's Original Steak Sandwich",
    description:
      "100% Black Angus hand-cut beef, Vermont Monterey Jack, sautéed Vidalia onion, au jus, toasted French baguette",
    fare: "Meals",
    vendor: "Pat LaFrieda Meat Purveyors",
    vendorHint: "Taste of the City, Section 416, Clover"
  },
  {
    name: "Pat LaFrieda's Loaded Fries",
    description:
      "Sidewinder fries topped with Black Angus beef, white cheddar sauce, sautéed Vidalia onions, au jus, scallions",
    fare: "Meals",
    vendor: "Pat LaFrieda Meat Purveyors",
    vendorHint: "Taste of the City, Section 416, Clover"
  },
  {
    name: "Pat LaFrieda's Prime Jerky",
    fare: "Snacks",
    vendor: "Pat LaFrieda Meat Purveyors",
    vendorHint: "Taste of the City, Section 416, Clover"
  },

  // ── Pig Beach BBQ (Section 135) ────────────────────────────────
  {
    name: "Pig Beach Smoked Brisket Sandwich",
    description:
      "Pickles, crispy onions, classic red BBQ sauce on Martin's Potato Roll",
    fare: "Meals",
    vendor: "Pig Beach BBQ",
    vendorHint: "Section 135"
  },
  {
    name: "Pig Beach Pulled Pork Sandwich",
    description: "Tangy vinegar sauce & purple slaw",
    fare: "Meals",
    vendor: "Pig Beach BBQ",
    vendorHint: "Section 135"
  },
  {
    name: "Pig Beach Loaded Cornbread",
    description:
      "Warm house baked cornbread, cheddar cheese sauce, BBQ sauce, pulled pork",
    fare: "Meals",
    vendor: "Pig Beach BBQ",
    vendorHint: "Section 135"
  },
  {
    name: "Pig Beach Platter",
    description:
      "Smoked brisket, pulled pork shoulder, purple slaw, aged cheddar mac & cheese",
    fare: "Meals",
    vendor: "Pig Beach BBQ",
    vendorHint: "Section 135"
  },

  // ── Prime Kosher Sports (Section 141, 119, 408) ────────────────
  {
    name: "Kosher Pulled Brisket Nacho",
    fare: "Meals",
    vendor: "Prime Kosher Sports",
    vendorHint: "Sections 119, 408"
  },
  {
    name: "Kosher Pulled BBQ Sandwich",
    fare: "Meals",
    vendor: "Prime Kosher Sports",
    vendorHint: "Taste of the City (Section 141), Sections 119, 408"
  },
  {
    name: "Kosher Hot Sausage",
    fare: "Meals",
    vendor: "Prime Kosher Sports",
    vendorHint: "Taste of the City, Section 408"
  },
  {
    name: "Kosher Steak Sandwich",
    fare: "Meals",
    vendor: "Prime Kosher Sports",
    vendorHint: "Taste of the City"
  },
  {
    name: "Kosher Knish",
    fare: "Snacks",
    vendor: "Prime Kosher Sports",
    vendorHint: "Taste of the City, Section 408"
  },

  // ── Premio Sausage ─────────────────────────────────────────────
  {
    name: "Premio Hot or Sweet Sausage",
    fare: "Meals",
    vendor: "Premio",
    vendorHint:
      "Sections 107, 115, 120, 134, CC, 309, HDL, 403, 415, 421, 432"
  },

  // ── Roast Pork Sandwich (Clover Home Plate) ────────────────────
  {
    name: "Roast Pork Sandwich",
    description:
      "14-hour porchetta rubbed roast pork, Italian long hot & broccoli rabe relish, roasted garlic aioli, melted provolone, seeded semolina",
    fare: "Meals",
    vendorHint: "Clover Home Plate Marketplace"
  },

  // ── Seoul Bird (Metro Market) ──────────────────────────────────
  {
    name: "Kimchi Fried Rice",
    description:
      "Toasted short grain Korean rice with fried veggies & kimchi (add Seoul Bird chicken optional)",
    fare: "Meals",
    vendor: "Seoul Bird",
    vendorHint: "Metro Market (Excelsior Level)"
  },

  // ── Shake Shack (Taste of the City) ────────────────────────────
  {
    name: "ShackBurger",
    description:
      "Angus beef cheeseburger with lettuce, tomato, ShackSauce on toasted potato bun",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "Shack Stack",
    description:
      "Angus beef cheeseburger topped with 'Shroom Burger, lettuce, tomato, ShackSauce",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "SmokeShack",
    description:
      "Angus beef cheeseburger with applewood-smoked bacon, chopped cherry peppers, ShackSauce",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "'Shroom Burger",
    description:
      "Crisp-fried portobello mushroom filled with melted Muenster & cheddar, lettuce, tomato, ShackSauce",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City",
    dietary: ["Vegetarian"]
  },
  {
    name: "Shake Shack Fries",
    description: "Crispy crinkle cut fries",
    fare: "Snacks",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "Shake Shack Cheese Fries",
    description: "Crispy crinkle cuts topped with cheese sauce",
    fare: "Snacks",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "Shake Shack Black & White Shake",
    description: "Chocolate fudge sauce with house-made vanilla frozen custard",
    fare: "Desserts",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "Shake Shack Apple Pie Shake",
    description: "Vanilla frozen custard with apple pie mix-in, topped with sprinkles",
    fare: "Desserts",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "Mets MVP Shake",
    description:
      "Double cookies + cream: vanilla custard with chocolate and chocolate chip cookies, cookie crumble, sprinkles",
    fare: "Desserts",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },
  {
    name: "NY Bulgogi Cheesesteak Spring Roll",
    description:
      "Bulgogi marinated beef, kimchi, sharp cheddar, pickled jalapeños, gochujang-sriracha mayo",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: "Taste of the City"
  },

  // ── Swingin' Wings (Section 103) ───────────────────────────────
  {
    name: "Amazin' Bone-In Wings",
    description:
      "Mild Buffalo, BBQ, or Thai Chili sauce with celery sticks and blue cheese or ranch",
    fare: "Meals",
    vendor: "Swingin' Wings",
    vendorHint: "Section 103"
  },

  // ── Taste of Queens – The Queensboro ───────────────────────────
  {
    name: "Jerk Chicken Sandwich",
    description:
      "Jerk-spiced chicken with cabbage and pickled onions on potato bun",
    fare: "Meals",
    vendor: "Taste of Queens – The Queensboro",
    vendorHint: "Taste of the City (Opening Day – July 12)"
  },
  {
    name: "Kimchi Reuben",
    description:
      "Corned beef, Swiss, fennel kimchi, red cabbage-apple slaw on rye",
    fare: "Meals",
    vendor: "Taste of Queens – The Queensboro",
    vendorHint: "Taste of the City (Opening Day – July 12)"
  },

  // ── Vegan City (Section 105) ───────────────────────────────────
  {
    name: "Vegan City Burger",
    description: "Impossible patty, vegan cheese fondue, pico de gallo",
    fare: "Meals",
    vendor: "Vegan City",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },
  {
    name: "Vegan City Dog",
    description: "Jackfruit chili, vegan cheese fondue",
    fare: "Meals",
    vendor: "Vegan City",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },
  {
    name: "Beyond Sausage and Peppers",
    description: "Impossible Italian sausage, onions, peppers, sausage roll",
    fare: "Meals",
    vendor: "Vegan City",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },
  {
    name: "Vegan City Nacho",
    description:
      "Jackfruit, vegan cheese fondue, pico, roasted salsa, guacamole",
    fare: "Meals",
    vendor: "Vegan City",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },
  {
    name: "Mushroom Melt",
    description:
      "Wild mushrooms, caramelized onions, vegan cheese sauce, hero roll",
    fare: "Meals",
    vendor: "Vegan City",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },

  // ── Walk-Off Café (Section 131, 417) ───────────────────────────
  {
    name: "Walk-Off Cookie Bucket",
    description: "20 mini chocolate chip cookies served warm in a bucket",
    fare: "Desserts",
    vendor: "Walk-Off Café",
    vendorHint: "Sections 131, 417"
  },

  // ── Wok N' Roll (Taste of the City) ────────────────────────────
  {
    name: "Wok N' Roll Cities to Citi Field",
    description:
      "Rotating opposing-team-inspired dishes: Chimichanga, Al Pastor, Hotdish, Hatch Green Chili, Half-Smoke, Coney Dog, Skyline Chili, Toasted Ravioli, Fried Chicken & Biscuit, Philly Cheesesteak, BBQ Pulled Pork, Clam Chowder, and more",
    fare: "Meals",
    vendor: "Wok N' Roll",
    vendorHint: "Taste of the City (rotating schedule by opponent)"
  },

  // ── Zeppole (Section 130) ─────────────────────────────────────
  {
    name: "Zeppole",
    description: "Traditional Italian fried dough tossed in powdered sugar",
    fare: "Desserts",
    vendorHint: "Section 130"
  },

  // ── From dietary sections (unique items) ───────────────────────
  {
    name: "White Chocolate Macadamia Nut Cookie",
    fare: "Desserts",
    vendor: "Vegan City",
    vendorHint: "Section 106",
    dietary: ["Vegan"]
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendorHint: "Section 105",
    dietary: ["Vegetarian"]
  }
];

export async function parseCitiFieldMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = MENU_DATA.map((raw) => ({
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food" as const,
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  }));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
