/**
 * Minnesota State Fair — official 2026 new foods and new-vendor signatures.
 *
 * Sources (public 2026 announcements):
 *   https://www.mnstatefair.org/new/food
 *   FOX 9 / KSTP 2026 new-foods roundups
 *
 * Descriptions are original Stadium Slop paraphrases, not copied promotional copy.
 * Fountain soda, bottled water, and generic size lines are omitted.
 */

import type { FairRawMenuItem } from "../types";

const NEW_2026 = ["new-2026"] as const;
const NEW_VENDOR_2026 = ["new-2026", "new-vendor-2026"] as const;

export const MINNESOTA_2026_NEW_FOODS: FairRawMenuItem[] = [
  {
    name: "Pickle Pie",
    vendor: "LuLu's Public House",
    fare: "Snacks",
    location: "West End Market, south of Schilling Amphitheatre",
    description:
      "Savory pie filled with chopped pickles, pickle brine, and cream cheese, finished with ranch-hot-sauce whipped topping, a gherkin, and dill.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Cracklin' Corn Ribs",
    vendor: "The Blue Barn",
    fare: "Meals",
    location: "West End Market, south of the History & Heritage Center",
    description:
      "Tempura-fried corn cob quarters brushed with seasoned butter and topped with bacon ranch, green onion, and candied jalapeños over pork rinds.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Longanisa Cheese Curd Lumpia",
    vendor: "Lumpia City",
    fare: "Snacks",
    location: "West side of Liggett Street between Carnes and Judson",
    description:
      "Filipino longanisa sausage mixed with garlic and cheese curds, rolled in lumpia wrappers, fried, and served with sweet chili sauce.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "French Chouxnut Sundae",
    vendor: "Bridgeman's Ice Cream",
    fare: "Desserts",
    location: "Northeast corner of Judson Avenue and Liggett Street",
    description:
      "Salted caramel espresso ice cream on a choux pastry donut filled with chocolate mousse and finished with dark chocolate fondant and caramel.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Korean BBQ Bao Buns",
    vendor: "Rooted & Wild by Snack House",
    fare: "Meals",
    location: "Lee & Rose Warner Coliseum, south side",
    description:
      "Plant-based shredded filling tossed in hot Korean barbecue sauce with pineapple slaw on steamed bao buns.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026",
    dietaryTags: ["Vegan"]
  },
  {
    name: "Surf 'N' Turf Burger",
    vendor: "Cafe Caribe",
    fare: "Meals",
    location: "South side of Carnes Avenue between Chambers and Clough",
    description:
      "Garlic-herb butter lobster stacked on a grilled beef patty with pepper jack and chipotle mayo on a toasted brioche bun.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Butter Brew Mustache Pretzel",
    vendor: "Blue Moon Dine-In Theater",
    fare: "Desserts",
    location: "Northeast corner of Carnes Avenue and Chambers Street",
    description:
      "Mustache-shaped soft pretzel coated in butter and a butter-brew sugar mix of caramel, vanilla, and butterscotch, with vanilla soft-serve dip.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Bao Belly",
    vendor: "RC's BBQ",
    fare: "Meals",
    location: "North side of West Dan Patch Avenue between Liggett and Chambers",
    description:
      "Smoked barbecue pork belly on steamed bao with hot sauce, yum yum sauce, pickled vegetables, and cilantro.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Blue Moon Crunch",
    vendor: "Minnesnowii Shave Ice",
    fare: "Desserts",
    location: "West side of Nelson Street between Dan Patch and Carnes",
    description:
      "Blue moon flavored shave ice dusted with Fruity Pebbles and sweetened condensed milk.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Walking Chopped Italian Grinder",
    vendor: "Mancini's al Fresco",
    fare: "Meals",
    location: "North side of Carnes Avenue between Nelson and Underwood",
    description:
      "Chopped salami grinder mix with pepperoncini, olives, artichokes, roasted peppers, and mozzarella over garlic kettle chips.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Shakshuka Lamb Meatballs",
    vendor: "French Meadow Bakery & Cafe",
    fare: "Meals",
    location: "North side of Carnes Avenue between Nelson and Underwood",
    description:
      "Goat-cheese-stuffed lamb and pork meatballs over tomato-chili shakshuka with chimichurri-spiced sourdough crostini.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Dubai Whoopie Pie",
    vendor: "Dino's Gyros",
    fare: "Desserts",
    location: "North side of Carnes Avenue between Nelson and Underwood",
    description:
      "Pistachio-cream whoopie pie between chocolate cakes, rolled in shredded phyllo, crushed pistachios, honey, and brown sugar.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Chorizo Manchego Croquettes",
    vendor: "Paella Depot",
    fare: "Snacks",
    location: "South side of Judson Avenue between Clough and Nelson",
    description:
      "Spanish potato croquettes filled with manchego and chorizo, fried, and drizzled with lemon garlic aioli.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026",
    dietaryTags: ["Gluten Free"]
  },
  {
    name: "Honey Brisket Battered Potatoes",
    vendor: "Australian Battered Potatoes",
    fare: "Meals",
    location: "South side of Judson Avenue between Nelson and Underwood",
    description:
      "Fried battered potatoes topped with beef brisket, nacho cheese, and hot honey.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Hmong Corndog",
    vendor: "Union Hmong Kitchen",
    fare: "Meals",
    location: "International Bazaar, south wall, west corner",
    description:
      "Kramarczuk's Hmong sausage with ginger, garlic, fish sauce, chili, and lemongrass, cornmeal-battered and fried, with citrus Kua Txob.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Tacos de Mole",
    vendor: "El Burrito Mercado",
    fare: "Meals",
    location: "International Bazaar, south wall",
    description:
      "Fried flour tortillas filled with shredded chicken, cheese, and house mole, finished with more mole and queso fresco.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Jamaican Jerk Chicken Loaded Fries",
    vendor: "Midtown Global Market's Irie Jamaican Express",
    fare: "Meals",
    location: "International Bazaar, east wall, Taste of Midtown Global Market",
    description:
      "Battered fries topped with jerk chicken, melted cheese, green onion, ranch, and jerk sauce. Limited run Aug. 27–Sept. 1.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "When Pigs Fly",
    vendor: "Sausage Sister & Me",
    fare: "Snacks",
    location: "Food Building, east wall",
    description:
      "Flight of puff-pastry-wrapped pork sausages on a stick with chimichurri, slaw, chili crunch cheddar, or pickle aioli.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "The Fried and the Furious: Cubano Drift",
    vendor: "The Herbivorous Butcher",
    fare: "Meals",
    location: "Food Building, west section, south wall",
    description:
      "Deep-fried vegan Cubano in a crunchy tortilla with plant-based pork, Swiss-style cheese, pickle relish, garlic mayo, and mustard.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026",
    dietaryTags: ["Vegan"]
  },
  {
    name: "Strawberry Ube Sundae Tart",
    vendor: "Sara's Tipsy Pies",
    fare: "Desserts",
    location: "Food Building, northwest wall",
    description:
      "Chilled strawberry-ube marshmallow cream with chocolate chips in a fudge-filled shortbread crust, topped with strawberry sauce.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Peri-Peri Bowl",
    vendor: "Afro Deli & Grill",
    fare: "Meals",
    location: "Food Building, east wall",
    description:
      "Fried peri-peri chicken with mini beef sambusas and sweet plantains, finished with peri-peri and Somali chili sauce.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Sligo Slider Bites On-A-Stick",
    vendor: "O'Gara's at the Fair",
    fare: "Snacks",
    location: "Southwest corner of Dan Patch Avenue and Cosgrove Street",
    description:
      "Fried dumplings stuffed with beef, cheddar, pickle, and onion, skewered on a stick, with homemade Thousand Island.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Brandy Old Fashioned Cookie Dough",
    vendor: "Kora & Mila's Cookie Dough",
    fare: "Desserts",
    location: "South side of Dan Patch Avenue between Cooper and Cosgrove",
    description:
      "Edible cookie dough with nonalcoholic brandy flavor, orange zest, cinnamon, dark chocolate, and tart cherries, dipped in chocolate and Biscoff crumbs.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Apple Donut Ham Grinder",
    vendor: "Minnesota Farmers Union Coffee Shop",
    fare: "Meals",
    location: "North side of Dan Patch Avenue between Cooper and Cosgrove",
    description:
      "Cinnamon-sugar fried apple rings stacked with Hidden Stream ham, dressed arugula, hot honey, and herb ricotta on a toasted hoagie.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Banana Butterscotch Barnraiser",
    vendor: "Minnesota Farmers Union Coffee Shop",
    fare: "Desserts",
    location: "North side of Dan Patch Avenue between Cooper and Cosgrove",
    description:
      "Vanilla pound cake with roasted bananas, butterscotch, caramelized croissant croutons, dairy whipped cream, and cereal crunch.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Bucket of Chicharrones",
    vendor: "San Felipe Tacos",
    fare: "Snacks",
    location: "Southwest corner of Dan Patch Avenue and Underwood Street",
    description:
      "Fresh-fried pork rinds with chili-lime seasoning and a trio of hot sauce, creamy chipotle, and chamoy.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Sweet Peach Lemonade Sparkler",
    vendor: "Quench'd",
    location: "South side of Dan Patch Avenue between Nelson and Underwood",
    description:
      "Fresh-squeezed lemonade layered with peach syrup and peach sweet-cream foam, finished with popping candy.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Elote Tots",
    vendor: "Tot Boss",
    fare: "Snacks",
    location: "East side of Underwood Street between Wright and Dan Patch, south of Kidway",
    description:
      "Fried tots tossed in Tajín and topped with roasted-corn elote sauce, cotija, and more Tajín.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Caramel Apple Iced Tea",
    vendor: "Loon Lake Iced Tea",
    location: "West side of Underwood Street between Wright and Dan Patch",
    description:
      "Black tea with tart apple flavor, caramel cold foam, and a caramel apple lollipop garnish.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Strawberries & Blueberry Creme Parfait",
    vendor: "Strawberries 'N Creme",
    fare: "Desserts",
    location: "West side of Underwood Street at Wright Avenue",
    description:
      "Fresh strawberries layered with blueberry non-dairy whipped topping and gluten-free waffle chips.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026",
    dietaryTags: ["Vegan"]
  },
  {
    name: "Dockside Poppers",
    vendor: "Summer Lakes Boat House",
    fare: "Snacks",
    location: "Southwest corner of Randall Avenue and Underwood Street",
    description:
      "Breaded poppers of cream cheese, bacon, artichoke, and jalapeño, served with tomato chili jam.",
    extraTags: [...NEW_2026, ...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Mango Sticky Rice Refresher",
    vendor: "Chan's Eatery",
    location: "East side of Underwood Street between Murphy and Lee",
    description:
      "Iced mango-coconut milk drink inspired by mango sticky rice, with fresh and dried mango and a dried-mango sugar rim.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Strawberry Crunch Mini Donuts",
    vendor: "Solem's Mini Donuts",
    fare: "Desserts",
    location: "East side of Underwood Street between Murphy and Lee",
    description:
      "Strawberry mini donuts with vanilla sugar, vanilla icing, and strawberry streusel crunch, served in a crunch-rimmed bucket.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Pumpkin Bar Funnel Cake",
    vendor: "Taulelle's Jurassic Corn Dogs",
    fare: "Desserts",
    location: "East side of Underwood Street between Murphy and Lee",
    description:
      "Pumpkin-spice funnel cake fried and finished with cinnamon cream cheese frosting.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Dill with it, Cookie!",
    vendor: "Urban Glow Mocktails",
    fare: "Desserts",
    location: "North End, northeast section, across from the North End Event Center",
    description:
      "White-chocolate cookie with chopped dill pickle and fresh dill, finished with sugar and flaky salt.",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Two-Tone Bloody Mary Mocktail",
    vendor: "Urban Glow Mocktails",
    location: "North End, northeast section, across from the North End Event Center",
    description:
      "Zero-alcohol Bloody Mary layered with tomatillo salsa and garnished with pickle, cheese, tomato, olive, and a Cheweenie skewer.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: [...NEW_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Dirty Soda",
    vendor: "dodopop",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "House dirty sodas in named flavors such as megalodon, golden yeti, and liger — flavored soda with cream and syrup, not a fountain cup.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Tanghulu",
    vendor: "Iemochi Japanese Confections",
    fare: "Desserts",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fruit skewers (strawberry, grape, mandarin, or mix) coated in a hard candy shell.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026",
    dietaryTags: ["Gluten Free"]
  },
  {
    name: "Crack-n-Cheese Bowl",
    vendor: "Jive Turkey BBQ",
    fare: "Meals",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Mac and cheese with hickory-smoked turkey barbecue, fried turkey cracklins, and signature sauce.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Soul Rolls",
    vendor: "Jive Turkey BBQ",
    fare: "Snacks",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fried egg rolls stuffed with mac and cheese and collard greens.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Birria Crunch Bombs",
    vendor: "Midtown Global Market's El Taco Torro",
    fare: "Snacks",
    location: "International Bazaar (Sept. 2–7 only)",
    description:
      "Fried tortilla balls filled with birria beef and cheese, rolled in tortilla-chip crunch, with lime crema and consommé. Limited Sept. 2–7.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Apple Fries",
    vendor: "Minnesota's Original Apple Fries",
    fare: "Desserts",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fresh-cut fried apples tossed in cinnamon sugar and served with caramel.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Apple Fries Deluxe",
    vendor: "Minnesota's Original Apple Fries",
    fare: "Desserts",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Larger apple fries with caramel and whipped cream.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Savory Cone",
    vendor: "Roon's Savories",
    fare: "Meals",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Hand-rolled parmesan-cheddar-herb waffle cone filled with pulled-pork mac, chicken tinga and rice, chicken salad, or three-cheese mac.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Chinese Sausage & Cheese Poppers",
    vendor: "Saturday Dumpling Co.",
    fare: "Snacks",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fried dumplings stuffed with Chinese sausage and cheese.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Ube Cheesecake Wontons",
    vendor: "Saturday Dumpling Co.",
    fare: "Desserts",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fried ube cheesecake wontons drizzled with condensed milk and crushed Biscoff.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Fresh-Cut French Fries",
    vendor: "Solem's French Fries",
    fare: "Snacks",
    location: "Minnesota State Fairgrounds (new 2026 vendor)",
    description:
      "Fresh-cut fries with a self-serve spice and sauce bar. Fountain sodas from this stand are omitted on purpose.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Bacon-Wrapped Shrimp Skewers",
    vendor: "Summer Lakes Boat House",
    fare: "Meals",
    location: "Southwest corner of Randall Avenue and Underwood Street",
    description:
      "Bacon-wrapped shrimp skewers from the new Summer Lakes Boat House stand.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  },
  {
    name: "Riblets 'N' Chips",
    vendor: "Summer Lakes Boat House",
    fare: "Meals",
    location: "Southwest corner of Randall Avenue and Underwood Street",
    description:
      "Riblets served with hand-cut chips at the new boat-house building.",
    extraTags: [...NEW_VENDOR_2026],
    seasonIntroduced: "2026"
  }
];
