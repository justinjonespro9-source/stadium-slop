/**
 * Minnesota State Fair — Fair Finder + official Specialty Sips expansion (2026).
 * Sources:
 *   https://www.mnstatefair.org/fair-finder/food
 *   https://www.mnstatefair.org/new/sips
 *
 * Curated additions only. Does not replace the existing catalog.
 * `new-2026` is applied only to official new Specialty Sips for 2026.
 * Descriptions are original Stadium Slop paraphrases, not official promotional copy.
 * All You Can Drink Milk is included as an iconic Fair-institution exception
 * to the generic dairy exclusion.
 */

import type { FairRawMenuItem } from "../types";

export const MINNESOTA_FAIR_FINDER_2026_EXPANSION: FairRawMenuItem[] = [
  {
    name: "Chocolate Chip Cookies",
    vendor: "Sweet Martha's Cookie Jar",
    description: "The Fair's signature chocolate chip cookies, sold by the bucket.",
    location: "Multiple stands (Dan Patch, Carnes, Underwood)",
    fare: "Desserts"
  },
  {
    name: "Roasted Sweet Corn on the Cob",
    vendor: "Corn Roast",
    description: "Sweet corn roasted in the husk.",
    location: "Southeast corner of Dan Patch Ave. & Nelson St.",
    fare: "Snacks"
  },
  {
    name: "Tiny Tim Mini Donuts",
    vendor: "Tiny Tim Donuts",
    description: "Cinnamon-sugar miniature donuts from the Fair's original mini-donut stand.",
    location: "North side of Carnes Ave. between Chambers & Clough streets",
    fare: "Desserts"
  },
  {
    name: "Walleye On-A-Stick",
    vendor: "Walleye On a Stick",
    description: "Deep-fried Minnesota walleye served on a stick (also offered on a bun or in a boat).",
    location: "Food Building, southeast center section",
    fare: "Meals"
  },
  {
    name: "Original Minneapple Pie",
    vendor: "Minneapple Pie",
    description: "Handmade deep-fried apple pie, the stand's original namesake.",
    location: "South side of Judson Ave. between Nelson & Underwood streets",
    fare: "Desserts"
  },
  {
    name: "Ham Loaf",
    vendor: "Hamline Church Dining Hall",
    description: "Hamline Church's long-running Fair dining-hall ham loaf.",
    location: "North side of Dan Patch Ave. between Underwood & Cooper streets",
    fare: "Meals"
  },
  {
    name: "Pulled Turkey Sandwich",
    vendor: "Turkey to Go",
    description: "Pulled turkey sandwich with optional Ken Davis BBQ sauce, Cajun seasoning, or mayo.",
    location: "East side of Clough St. between Carnes & Judson avenues",
    fare: "Meals"
  },
  {
    name: "Funnel Cakes",
    vendor: "Funnel Cakes",
    description: "Classic funnel cakes with fruit, chocolate, cream cheese, or Nutella toppings.",
    location: "North side of Dan Patch Ave. between Nelson & Underwood streets",
    fare: "Desserts"
  },
  {
    name: "1919 Draft Root Beer",
    vendor: "1919 Root Beer",
    description: "Minnesota-brewed 1919 draft root beer.",
    location: "Southeast corner of Dan Patch Ave. & Underwood St. outside The Garden",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink"
  },
  {
    name: "1919 Root Beer Float",
    vendor: "1919 Root Beer",
    description: "1919 draft root beer float.",
    location: "Southeast corner of Dan Patch Ave. & Underwood St. outside The Garden",
    fare: "Desserts",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink"
  },
  {
    name: "Gyros",
    vendor: "Dino's Gyros",
    description: "The stand's namesake gyro.",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    fare: "Meals"
  },
  {
    name: "Tom Thumb Mini Donuts",
    vendor: "Tom Thumb Donuts",
    description: "Miniature donuts from a long-running Kidway stand.",
    location: "West side of Cooper St. between Wright & Dan Patch avenues, at Kidway",
    fare: "Desserts"
  },
  {
    name: "Lime in the Coconut",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty beer from Millstream Brewing Co (5% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Dill Pickle Kölsch",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty beer from Millstream Brewing Co (4.8% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Orange Shandy",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty beer from Millstream Brewing Co (4% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Rhubarb Shandy",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty beer from Millstream Brewing Co (4% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "S'Mores Beer",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty beer at Giggles' Campfire Grill (5.5% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Raspberry Hard Cider",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty cider at Giggles' Campfire Grill (5.9% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Piña Ciderlada",
    vendor: "Giggles' Campfire Grill",
    description: "Fair-exclusive 21+ specialty cider at Giggles' Campfire Grill (6.4% ABV).",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Strawberry Mojito Cider",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cider at LuLu's Public House (5.9% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Rhubarb Mead",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cider at LuLu's Public House (6% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Idyll Forest Parasol Reserve Summer Blend",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty beer at LuLu's Public House (8% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Piña Colada Cream Ale",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cocktail at LuLu's Public House (5.5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Razz Bod Golden Ale",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cocktail at LuLu's Public House (4.5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "First Place Peach",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cocktail at LuLu's Public House (5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Passion Fruit Guava Tom Collins Seltzer",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty seltzer at LuLu's Public House (5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Sangria Sundae",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty wine at LuLu's Public House (10% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Cherry Limeade Hard Slushie",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cocktail at LuLu's Public House (5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Candyman Blue Raspberry",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty beer at LuLu's Public House (4.1% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Blood Orange Cidermosa",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cider at LuLu's Public House (6.2% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Root Beer Float Hard Slushie",
    vendor: "LuLu's Public House",
    description: "Fair-exclusive 21+ specialty cocktail at LuLu's Public House (5% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Soft Serve Royal Peach Beer",
    vendor: "Pryes Brewing Pavilion",
    description: "Fair-exclusive 21+ specialty cocktail at Pryes Brewing Pavilion (4.8% ABV).",
    location: "At West End Market, south of Schilling Amphitheater",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pink Lemonade Lager",
    vendor: "Dino's Gyros",
    description: "Fair-exclusive 21+ specialty beer at Dino's Gyros (5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Hazy Blueberry Cider",
    vendor: "Dino's Gyros",
    description: "Fair-exclusive 21+ specialty cider at Dino's Gyros (5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Watermelon Sea Salt Lager",
    vendor: "Dino's Gyros",
    description: "Fair-exclusive 21+ specialty beer at Dino's Gyros (4.5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Picklerita",
    vendor: "Dino's Gyros",
    description: "Fair-exclusive 21+ specialty cocktail at Dino's Gyros (5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Bomba Bull Frosé All Day Slushie",
    vendor: "Dino's Gyros",
    description: "Fair-exclusive 21+ specialty cocktail at Dino's Gyros (5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Watermelon Mule",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty cocktail at Andy's Grille (6.5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pineapple Upside-Down Cake Slushy",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty cocktail at Andy's Grille (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Hurricane",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty cocktail at Andy's Grille (6% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Tutti Frutti Bubblegum Hard Slushy",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty cocktail at Andy's Grille (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Chocolate Chip Cookie Beer",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty beer at Andy's Grille (5.2% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Caramel Apple Craft Seltzer",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty seltzer at Andy's Grille (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Dreamsicle Hard Slushy",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty cocktail at Andy's Grille (6% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Boozy Salted Caramel Milkshake",
    vendor: "Andy's Grille",
    description: "Fair-exclusive 21+ specialty alcoholic drink at Andy's Grille (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Nelson streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Hugo Spritz",
    vendor: "The Blue Barn",
    description: "Fair-exclusive 21+ specialty wine at The Blue Barn (6.5% ABV).",
    location: "At West End Market, south of History & Heritage Center",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pink Sour Burst",
    vendor: "The Blue Barn",
    description: "Fair-exclusive 21+ specialty cocktail at The Blue Barn (4.8% ABV).",
    location: "At West End Market, south of History & Heritage Center",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Espressotini Frozen Seltzer",
    vendor: "The Blue Barn",
    description: "Fair-exclusive 21+ specialty cocktail at The Blue Barn (5% ABV).",
    location: "At West End Market, south of History & Heritage Center",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Strawberry Guava Agua Fresca Cider",
    vendor: "The Blue Barn",
    description: "Fair-exclusive 21+ specialty cider at The Blue Barn (4.5% ABV).",
    location: "At West End Market, south of History & Heritage Center",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pomelo Pils",
    vendor: "Mancini's al Fresco",
    description: "Fair-exclusive 21+ specialty beer at Mancini's al Fresco (5.1% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Blood Orange Bellini",
    vendor: "Mancini's al Fresco",
    description: "Fair-exclusive 21+ specialty wine at Mancini's al Fresco (12% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Cherry Lime Freeze",
    vendor: "Mancini's al Fresco",
    description: "Fair-exclusive 21+ specialty cocktail at Mancini's al Fresco (5% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Tropical Boba Burst Hazy",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty beer at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Smooth Sailing Smoothie Seltzer",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty seltzer at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Lemon Blueberry Whiplash",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty cider at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Frozen Pistachio Espresso Martini Hard Seltzer",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty cocktail at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Frozen Dirty Banana Piña Colada Hard Seltzer",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty cocktail at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Key Lime Pie",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty beer at Cafe Caribe (4.5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Paloma Hard Seltzer Cocktail",
    vendor: "Cafe Caribe",
    description: "Fair-exclusive 21+ specialty cocktail at Cafe Caribe (5% ABV).",
    location: "South side of Carnes Ave. between Chambers & Clough streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "RoséMonade",
    vendor: "Coasters",
    description: "Fair-exclusive 21+ specialty wine at Coasters (6% ABV).",
    location: "Southeast corner of Carnes Ave. & Liggett St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Ol’ Fashioned Hard Seltzer Cocktail",
    vendor: "Coasters",
    description: "Fair-exclusive 21+ specialty cocktail at Coasters (7% ABV).",
    location: "Southeast corner of Carnes Ave. & Liggett St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Lemon Drop Martini Slushie",
    vendor: "Coasters",
    description: "Fair-exclusive 21+ specialty cocktail at Coasters (5% ABV).",
    location: "Southeast corner of Carnes Ave. & Liggett St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Mango Heat",
    vendor: "Coasters",
    description: "Fair-exclusive 21+ specialty beer at Coasters (5.1% ABV).",
    location: "Southeast corner of Carnes Ave. & Liggett St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Cosmopolitan Martini Slushie",
    vendor: "Coasters",
    description: "Fair-exclusive 21+ specialty cocktail at Coasters (5% ABV).",
    location: "Southeast corner of Carnes Ave. & Liggett St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Cherry Wine Slushy",
    vendor: "French Crêperie",
    description: "Fair-exclusive 21+ specialty wine at French Crêperie (6% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Blue Raspberry Wine Slushy",
    vendor: "French Crêperie",
    description: "Fair-exclusive 21+ specialty wine at French Crêperie (6% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Grape Ape Wine Slushy",
    vendor: "French Crêperie",
    description: "Fair-exclusive 21+ specialty wine at French Crêperie (6% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Red Sangria Wine Slushy",
    vendor: "French Crêperie",
    description: "Fair-exclusive 21+ specialty wine at French Crêperie (6% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "White Sangria Wine Slushy",
    vendor: "French Crêperie",
    description: "Fair-exclusive 21+ specialty wine at French Crêperie (6% ABV).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Galaxy IPA",
    vendor: "The Frontier",
    description: "Fair-exclusive 21+ specialty beer at The Frontier (6% ABV).",
    location: "South side of Carnes Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Cactus Desert Guava Rosé Cider",
    vendor: "The Frontier",
    description: "Fair-exclusive 21+ specialty cider at The Frontier (5.8% ABV).",
    location: "South side of Carnes Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Huckleberry Haze IPA",
    vendor: "The Frontier",
    description: "Fair-exclusive 21+ specialty beer at The Frontier (6.5% ABV).",
    location: "South side of Carnes Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Miraculum Old Fashioned IPA",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty cocktail at O'Gara's at the Fair (6.4% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Lingonberry Orange Cider",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty cider at O'Gara's at the Fair (5.4% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Lemon Agua Fresca Lager",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty beer at O'Gara's at the Fair (4.5% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Lemon Berry Blitz Slushie",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty cocktail at O'Gara's at the Fair (4.8% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Blood Orange Cream Ale",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty beer at O'Gara's at the Fair (5.5% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "O'Perol Spritz",
    vendor: "O'Gara's at the Fair",
    description: "Fair-exclusive 21+ specialty wine at O'Gara's at the Fair (6.6% ABV).",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Rotating Craft Hard Seltzers",
    vendor: "Minnesota Craft Brewers Guild",
    description: "Fair-exclusive 21+ specialty seltzer at Minnesota Craft Brewers Guild.",
    location: "In the Agriculture Horticulture Building, west side",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Hazy Pineapple Whip",
    vendor: "Luther Auto Pit Stop",
    description: "Fair-exclusive 21+ specialty beer at Luther Auto Pit Stop (5.8% ABV).",
    location: "East side of Cooper St. between Dan Patch and Judson avenues, just south of the Bandshell",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Blue on the Bayou",
    vendor: "Ragin Cajun",
    description: "Fair-exclusive 21+ specialty beer at Ragin Cajun (5% ABV).",
    location: "In The Garden, west wall",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Tropical Hurricane \"The Big Easy\" Hard Slushie",
    vendor: "Ragin Cajun",
    description: "Fair-exclusive 21+ specialty cocktail at Ragin Cajun (5% ABV).",
    location: "In The Garden, west wall",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Cherry Cola Hard Soda",
    vendor: "RC's BBQ",
    description: "Fair-exclusive 21+ specialty alcoholic drink at RC's BBQ (5% ABV).",
    location: "North side of West Dan Patch Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Juicy Apricot Tangerine Hazy IPA",
    vendor: "RC's BBQ",
    description: "Fair-exclusive 21+ specialty beer at RC's BBQ (6.5% ABV).",
    location: "North side of West Dan Patch Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Limapeño Kölsch",
    vendor: "RC's BBQ",
    description: "Fair-exclusive 21+ specialty beer at RC's BBQ (4.2% ABV).",
    location: "North side of West Dan Patch Ave. between Liggett & Chambers streets",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Midway Sparkling Ale",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty beer at Shanghai Henri's (4.9% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pickle Lemonade Cider",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cider at Shanghai Henri's (6.2% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Key Lime Colada Slushie",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cider at Shanghai Henri's (5.9% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pumpkin Spice Apple Cider",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cider at Shanghai Henri's (6% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Shanghai Sunset",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty seltzer at Shanghai Henri's (5% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Baja Breeze Slushie",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cocktail at Shanghai Henri's (6% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Cocktail-Inspired Bloody Mary",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cider at Shanghai Henri's (6% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Big Squeeze Hard Lemonade",
    vendor: "Shanghai Henri's",
    description: "Fair-exclusive 21+ specialty cider at Shanghai Henri's (6% ABV).",
    location: "At the International Bazaar, north section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Berry Slammer Hard Seltzer Cocktail",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty cocktail at Summer Lakes Boat House (7.5% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Wedge-Hammer Hard Seltzer Cocktail",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty cocktail at Summer Lakes Boat House (7.5% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Bama! Lemon Sweet Tea Hard Seltzer Cocktail",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty cocktail at Summer Lakes Boat House (7.5% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Jamberry Bubbler Minnemosa",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty wine at Summer Lakes Boat House (11.5% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Orange Ginger Minnemosa",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty wine at Summer Lakes Boat House (11.5% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Orange Sunset Shandy",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive 21+ specialty beer at Summer Lakes Boat House (4.2% ABV).",
    location: "Southwest corner of Randall Ave. & Underwood St.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Watermelon Sour",
    vendor: "Tejas Express",
    description: "Fair-exclusive 21+ specialty cocktail at Tejas Express (4.8% ABV).",
    location: "In The Garden, north wall",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Mango Habanero Beergarita",
    vendor: "Tejas Express",
    description: "Fair-exclusive 21+ specialty cocktail at Tejas Express (4.9% ABV).",
    location: "In The Garden, north wall",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Churro Cream Ale",
    vendor: "Tejas Express",
    description: "Fair-exclusive 21+ specialty beer at Tejas Express (5.3% ABV).",
    location: "In The Garden, north wall",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Rosé Cider",
    vendor: "The Hangar",
    description: "Fair-exclusive 21+ specialty cider at The Hangar (5.5% ABV).",
    location: "On the northeast corner of Underwood St. and Murphy Ave., at the North End",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Aurora Tropical Drift",
    vendor: "The Hangar",
    description: "Fair-exclusive 21+ specialty beer at The Hangar (6.9% ABV).",
    location: "On the northeast corner of Underwood St. and Murphy Ave., at the North End",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Peach Perfect",
    vendor: "The Hangar",
    description: "Fair-exclusive 21+ specialty beer at The Hangar (4.4% ABV).",
    location: "On the northeast corner of Underwood St. and Murphy Ave., at the North End",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Strawberry Rhubarb Crisp",
    vendor: "The Hangar",
    description: "Fair-exclusive 21+ specialty beer at The Hangar (4.5% ABV).",
    location: "On the northeast corner of Underwood St. and Murphy Ave., at the North End",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Bad Apple Honeycrisp Lager",
    vendor: "The Hangar",
    description: "Fair-exclusive 21+ specialty beer at The Hangar (4.5% ABV).",
    location: "On the northeast corner of Underwood St. and Murphy Ave., at the North End",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Quacker Jack Seltzer",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty cider at The Hideaway Speakeasy (5% ABV).",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Pickle & Vine",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty wine at The Hideaway Speakeasy (12% ABV).",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Boozy Rose Lemonade",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty wine at The Hideaway Speakeasy.",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "THE STINGER!",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty wine at The Hideaway Speakeasy (7% ABV).",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Naughty Shirley",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty wine at The Hideaway Speakeasy (7% ABV).",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Flirty Fruity Bubbles",
    vendor: "The Hideaway Speakeasy",
    description: "Fair-exclusive 21+ specialty wine at The Hideaway Speakeasy (7% ABV).",
    location: "In the Grandstand, upper level, west section",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Citrus Hibiscus Wine Slushie",
    vendor: "Minnesota Wine Country",
    description: "Fair-exclusive 21+ specialty wine at Minnesota Wine Country (5.3% ABV).",
    location: "West side of Underwood St. between Carnes & Judson avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Guava Passion Fruit Wine Slushie",
    vendor: "Minnesota Wine Country",
    description: "Fair-exclusive 21+ specialty wine at Minnesota Wine Country (5.3% ABV).",
    location: "West side of Underwood St. between Carnes & Judson avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Sun Chaser Strawberry Lemonade Seltzer",
    vendor: "Bandstand Concessions",
    description: "Fair-exclusive 21+ specialty seltzer at Bandstand Concessions (5% ABV).",
    location: "Inside the Grandstand Concert Venue",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Sun Chaser Float",
    vendor: "Bandstand Concessions",
    description: "Fair-exclusive 21+ specialty seltzer at Bandstand Concessions (5% ABV).",
    location: "Inside the Grandstand Concert Venue",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Homer Black Pepper IPA",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty beer at Ball Park Cafe (7% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Rare Candy Pink Lemonade Sour",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cocktail at Ball Park Cafe (5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Tropic North",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty beer at Ball Park Cafe (5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Tigers Blood Cider",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cider at Ball Park Cafe (5.9% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Mexican Fruit Cup",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty alcoholic drink at Ball Park Cafe (4.8% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Metrodome IPA",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty beer at Ball Park Cafe (6.5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Frozen Mango Tango",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cocktail at Ball Park Cafe (5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Frozen Strawberry Daiquiri",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cocktail at Ball Park Cafe (5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Mini Donut Beer",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty beer at Ball Park Cafe (4.7% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Minnesota Mule Cider",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cider at Ball Park Cafe (7% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Great Ape Seltzer",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive 21+ specialty cocktail at Ball Park Cafe (5% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Huckleberry West Coast IPA",
    vendor: "Aldo's Burgers",
    description: "Fair-exclusive 21+ specialty beer at Aldo's Burgers.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Tropical Fruit West Coast IPA",
    vendor: "Rooted & Wild by Snack House",
    description: "Fair-exclusive 21+ specialty beer at Rooted & Wild by Snack House.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Old Ranch Hand",
    vendor: "Sabino's Pizza Pies",
    description: "Fair-exclusive 21+ specialty beer at Sabino's Pizza Pies.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Grapefruit West Coast IPA",
    vendor: "Sabino's Pizza Pies",
    description: "Fair-exclusive 21+ specialty beer at Sabino's Pizza Pies.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Paloma Seltzer Slushie",
    vendor: "Swine & Spuds",
    description: "Fair-exclusive 21+ specialty cocktail at Swine & Spuds.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Dill Pickle Seltzer",
    vendor: "Swine & Spuds",
    description: "Fair-exclusive 21+ specialty seltzer at Swine & Spuds.",
    allowBeverage: true,
    beverageCategory: "Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Midway Sunset Mocktail",
    vendor: "Ball Park Cafe",
    description: "Fair-exclusive non-alcoholic mocktail at Ball Park Cafe (0% ABV).",
    location: "East side of Underwood St. between Dan Patch & Carnes avenues",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips"]
  },
  {
    name: "Mango Sunrise",
    vendor: "Afro Deli & Grill",
    description: "Fair-exclusive non-alcoholic specialty sip at Afro Deli & Grill.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "megalodon",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "golden yeti",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "liger",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "big red dog",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "sasquatch",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "babe's lemonade",
    vendor: "dodopop",
    description: "Fair-exclusive non-alcoholic specialty sip at dodopop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Patriotic Boba Lemonade",
    vendor: "Donut Family",
    description: "Fair-exclusive non-alcoholic specialty sip at Donut Family.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Strawberry Chata",
    vendor: "El Burrito Mercado",
    description: "Fair-exclusive non-alcoholic specialty sip at El Burrito Mercado.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Agua de Piña con Mango",
    vendor: "El Burrito Mercado",
    description: "Fair-exclusive non-alcoholic specialty sip at El Burrito Mercado.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Soul Punch",
    vendor: "Jive Turkey BBQ",
    description: "Fair-exclusive non-alcoholic specialty sip at Jive Turkey BBQ.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Yuzu Limoncello Mocktail",
    vendor: "Luigi Fries",
    description: "Fair-exclusive non-alcoholic mocktail at Luigi Fries.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Mangonada Drink",
    vendor: "Midtown Global Market’s El Taco Torro",
    description: "Fair-exclusive non-alcoholic specialty sip at Midtown Global Market’s El Taco Torro.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Watermelon Mint Limeade",
    vendor: "Minnesota Farmers Union Coffee Shop",
    description: "Fair-exclusive non-alcoholic specialty sip at Minnesota Farmers Union Coffee Shop.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Prickly Pear Orange Aguas Fresca",
    vendor: "Paella Depot",
    description: "Fair-exclusive non-alcoholic specialty sip at Paella Depot.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Salted Mango Yuzuade",
    vendor: "Saturday Dumpling Co.",
    description: "Fair-exclusive non-alcoholic specialty sip at Saturday Dumpling Co..",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Berry Slammer Mocktail",
    vendor: "Summer Lakes Boat House",
    description: "Fair-exclusive non-alcoholic mocktail at Summer Lakes Boat House.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Cranberry Mint Lemonade",
    vendor: "Turkey to Go",
    description: "Fair-exclusive non-alcoholic specialty sip at Turkey to Go.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Razzarita Frozen Mocktail",
    vendor: "Urban Glow Mocktails",
    description: "Fair-exclusive non-alcoholic mocktail at Urban Glow Mocktails.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: ["specialty-sips", "new-2026"],
    seasonIntroduced: "2026"
  },
  {
    name: "Gorilla Bread",
    vendor: "LuLu's Public House",
    description: "Cinnamon-caramel roll with cream cheese frosting.",
    location: "West End Market, south of Schilling Amphitheatre",
    fare: "Desserts"
  },
  {
    name: "Walleye Sandwich",
    vendor: "Giggles' Campfire Grill",
    description: "Walleye sandwich from the North Woods stand.",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    fare: "Meals"
  },
  {
    name: "Pork Belly On-A-Stick",
    vendor: "Swine & Spuds",
    description: "Pork belly on a stick.",
    location: "Lee & Rose Warner Coliseum, northeast corner",
    fare: "Snacks"
  },
  {
    name: "Deep-Fried Dilly Dog",
    vendor: "Swine & Spuds",
    description: "Deep-fried dill pickle dog.",
    location: "Lee & Rose Warner Coliseum, northeast corner",
    fare: "Snacks"
  },
  {
    name: "Turkey Legs",
    vendor: "Turkey to Go",
    description: "Smoked turkey legs.",
    location: "East side of Clough St. between Carnes & Judson avenues",
    fare: "Meals"
  },
  {
    name: "Holey Hamloaf Breakfast Sandwich",
    vendor: "Hamline Church Dining Hall",
    description: "Hamloaf, tangy glaze, caramelized onions, cheese, and fried egg-in-a-hole toast.",
    location: "North side of Dan Patch Ave. between Underwood & Cooper streets",
    fare: "Meals"
  },
  {
    name: "Moo-sota Apple Pie Sundae",
    vendor: "Dairy Goodness",
    description: "Named apple-pie sundae (also offered as a malt) at the Dairy Building.",
    location: "Dairy Building, south wall",
    fare: "Desserts"
  },
  {
    name: "Ultimate Minneapple Pie",
    vendor: "Minneapple Pie",
    description: "Loaded version of the original deep-fried apple pie.",
    location: "South side of Judson Ave. between Nelson & Underwood streets",
    fare: "Desserts"
  },
  {
    name: "Minneblueberry Pie",
    vendor: "Minneapple Pie",
    description: "Handmade deep-fried blueberry pie served with vanilla ice cream.",
    location: "South side of Judson Ave. between Nelson & Underwood streets",
    fare: "Desserts"
  },
  {
    name: "Cajun Catfish On-A-Stick",
    vendor: "Walleye On a Stick",
    description: "Cajun catfish on a stick (also on a bun or in a boat).",
    location: "Food Building, southeast center section",
    fare: "Meals"
  },
  {
    name: "Deep-Fried Candy Bars On-A-Stick",
    vendor: "Deep Fried Candy Bars",
    description: "Batter-dipped candy bars on a stick (Snickers, Reese's, Nut Goodie, and more).",
    location: "North side of Carnes Ave. between Nelson & Underwood streets",
    fare: "Desserts"
  },
  {
    name: "S'mores Funnel Cake",
    vendor: "Funnel Cakes",
    description: "Graham-cracker funnel cake with chocolate chunks, marshmallows, and graham crumbs.",
    location: "Food Building, east wall",
    fare: "Desserts"
  },
  {
    name: "Reuben Sandwich",
    vendor: "O'Gara's at the Fair",
    description: "O'Gara's corned-beef Reuben.",
    location: "Southwest corner of Dan Patch Ave. & Cosgrove Street",
    fare: "Meals"
  },
  {
    name: "Island Hopper",
    vendor: "The Hangar",
    description: "Teriyaki chicken breast with rice and pineapple, served in a hollowed pineapple.",
    location: "Northeast corner of Underwood St. & Murphy Ave.",
    fare: "Meals"
  },
  {
    name: "The Wingwalker Donut Flight",
    vendor: "The Hangar",
    description: "Fried cake donuts with Bavarian creme, chocolate custard, or lingonberry jam.",
    location: "Northeast corner of Underwood St. & Murphy Ave.",
    fare: "Desserts"
  },
  {
    name: "Esquites",
    vendor: "El Burrito Mercado",
    description: "Cup of herbed corn kernels with sour cream, Cotija, chile, and lime.",
    location: "International Bazaar, south wall",
    fare: "Snacks"
  },
  {
    name: "Wood-Grilled Mexico City Street Corn",
    vendor: "Tejas Express",
    description: "Corn on the cob with chile mayo, Cotija, and lime.",
    location: "The Garden, north wall",
    fare: "Snacks"
  },
  {
    name: "Falafel On-A-Stick",
    vendor: "Holy Land",
    description: "Falafel served on a stick.",
    location: "International Bazaar, southeast corner",
    fare: "Snacks"
  },
  {
    name: "Gyro On-A-Stick",
    vendor: "Holy Land",
    description: "Gyro served on a stick.",
    location: "International Bazaar, southeast corner",
    fare: "Snacks"
  },
  {
    name: "Lemon Dream Ice Cream Nachos",
    vendor: "1919 Root Beer",
    description: "Waffle chips with Lemon Graham Cracker Swirl ice cream, whipped cream, and cherry.",
    location: "Southeast corner of Dan Patch Ave. & Underwood St. outside The Garden",
    fare: "Desserts"
  },
  {
    name: "Strawberry-Rhubarb Malt",
    vendor: "Dairy Goodness",
    description: "Named strawberry-rhubarb malt at the Dairy Building.",
    location: "Dairy Building, south wall",
    fare: "Desserts"
  },
  {
    name: "Cinnamon-Sugar Mini Donuts",
    vendor: "Grandstand Mini Donuts",
    description: "Traditional cinnamon-sugar miniature donuts.",
    location: "East of Chambers St., just south of the Grandstand",
    fare: "Desserts"
  },
  {
    name: "Smoked Salmon On-A-Stick",
    vendor: "Giggles' Campfire Grill",
    description: "Smoked salmon on a stick.",
    location: "Southeast corner of Lee Ave. & Cooper St. at The North Woods",
    fare: "Snacks"
  },
  {
    name: "Beignets",
    vendor: "Ragin Cajun",
    description: "Ragin Cajun beignets.",
    location: "The Garden, west wall",
    fare: "Desserts"
  },
  {
    name: "The Bootlegger Sandwich",
    vendor: "The Hideaway Speakeasy",
    description: "Shaved prime rib, white cheddar, arugula, pickled red onion, and horseradish on ciabatta.",
    location: "Grandstand Veranda, upper level, west section",
    fare: "Meals"
  },
  {
    name: "All You Can Drink Milk",
    vendor: "All You Can Drink Milk",
    description: "Iconic Minnesota State Fair dairy booth serving unlimited cups of milk and chocolate milk.",
    location: "Northeast corner of Judson Ave. & Clough St.",
    fare: "Snacks",
    dietaryTags: ["Vegetarian"]
  },
];

