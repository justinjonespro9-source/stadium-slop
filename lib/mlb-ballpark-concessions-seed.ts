import { bpItem, bpVendor } from "./ballpark-menu-builders";
import type { FoodItem, Vendor } from "./sample-data";

export { bpItem, bpVendor };

/** Semantic menu labels (also `customCategoryLabel` in Prisma). */
export type ConcessionMenuCategory =
  | "BURGER"
  | "HOT_DOG"
  | "PIZZA"
  | "BBQ"
  | "SANDWICH"
  | "TACOS"
  | "DESSERT"
  | "DRINK"
  | "CHICKEN"
  | "VEGAN"
  | "GLUTEN_FREE"
  | "SEAFOOD"
  | "SNACK"
  | "OTHER";

const targetFieldConcessionVendors: Vendor[] = [
  bpVendor("target-field", "la-madre", "La Madre", "Field", "Section 110"),
  bpVendor(
    "target-field",
    "no-gluten-way",
    "No Gluten Way",
    "Field",
    "Section 112",
    "TODO: Verify GF bakery name spelling (source: Atuvava Bakery)."
  ),
  bpVendor("target-field","mac-and-yes-please", "Mac and Yes Please", "Field", "Section 113"),
  bpVendor("target-field",
    "justins-candied-popcorn-bar",
    "Justin’s Candied Popcorn Bar",
    "Field",
    "Section 106"
  ),
  bpVendor("target-field",
    "izakaya-kazama",
    "Izakaya Kazama",
    "Club / specialty",
    "Truly On Deck; Town Ball Tavern",
    "TODO: Confirm exact stand footprint vs shared restaurant spaces."
  ),
  bpVendor("target-field","niko-niko", "Niko Niko", "Field", "Section 120"),
  bpVendor("target-field",
    "red-cow-target",
    "Red Cow",
    "Upper / destination",
    "Section 233; Minnie & Paul’s"
  ),
  bpVendor("target-field",
    "pizza-luce-target",
    "Pizza Lucé",
    "Upper / destination",
    "Section 234; Minnie & Paul’s"
  ),
  bpVendor("target-field",
    "kramarczuks-sausages",
    "Kramarczuk’s Sausages",
    "Field",
    "Sections 101, 112, 312",
    "Minneapolis staple brats and sausages."
  ),
  bpVendor("target-field",
    "union-hmong-kitchen",
    "Union Hmong Kitchen",
    "Club / specialty",
    "Truly On Deck",
    "Chef Yia Vang menu."
  ),
  bpVendor("target-field",
    "murrays-steakhouse",
    "Murray’s Steakhouse",
    "Club / field",
    "Truly On Deck; Section 108"
  ),
  bpVendor("target-field",
    "tony-os-cuban-sandwich",
    "Tony O’s Cuban Sandwich",
    "Field",
    "Section 114",
    "Twins legend Tony Oliva tie-in."
  ),
  bpVendor("target-field","hot-indian-target", "Hot Indian", "Field", "Section 120"),
  bpVendor("target-field","taco-libre", "Taco Libre", "Field", "Section 103"),
  bpVendor("target-field",
    "truly-on-deck",
    "Truly On Deck",
    "Club",
    "Right field, club level",
    "Largest sit-down in park; full bar and grab-and-go."
  ),
  bpVendor("target-field",
    "keepers-heart-town-ball-tavern",
    "Keeper’s Heart Town Ball Tavern",
    "Suite / club",
    "Section 229"
  ),
  bpVendor("target-field","hrbeks", "Hrbek’s", "Field", "Section 114"),
  bpVendor("target-field",
    "pryes-homeplate-taproom",
    "Pryes Homeplate Taproom",
    "Terrace",
    "Terrace level",
    "Climate-controlled pub; Pryes beers."
  ),
  bpVendor("target-field",
    "carbliss-clubhouse",
    "Carbliss Clubhouse",
    "Gate",
    "Gate 6",
    "RTD cocktail social space."
  ),
  bpVendor("target-field",
    "surfside-bar",
    "Surfside Bar",
    "Club",
    "Club level",
    "Canned tea and lemonade cocktails."
  ),
  bpVendor("target-field",
    "cutwater-minnie-pauls",
    "Cutwater Cocktail Bar at Minnie & Paul’s",
    "Destination",
    "Center field, under celebration sign"
  ),
  bpVendor("target-field",
    "chicken-shack-target",
    "Chicken Shack",
    "Field",
    "Multiple sections",
    "Tenders and Howler sandwich (locations vary)."
  ),
  bpVendor("target-field",
    "blue-bunny-target",
    "Blue Bunny Ice Cream",
    "Dessert",
    "Frozen Spoon locations (multiple)",
    "TODO: Map exact Frozen Spoon kiosks to sections when known."
  )
];

const targetFieldConcessionItems: FoodItem[] = [
  bpItem("target-field", "Target Field", "la-madre", "la-madre-street-elote", "Street elote", "SNACK", "Mexican street elote.", {
    location: "Section 110",
    sections: ["110"]
  }),
  bpItem("target-field", "Target Field",
    "no-gluten-way",
    "no-gluten-way-burger-stack",
    "Stacked GF burger",
    "GLUTEN_FREE",
    "Dedicated GF stand: stacked burgers, all-beef dogs, cookies.",
    {
      location: "Section 112",
      sections: ["112"],
      tags: ["Gluten free", "TODO: Verify bakery vendor name spelling in source"]
    }
  ),
  bpItem("target-field", "Target Field",
    "mac-and-yes-please",
    "mac-yes-buffalo-chicken-mac",
    "Buffalo chicken mac bowl",
    "CHICKEN",
    "Mac bowl with Buffalo chicken.",
    { location: "Section 113", sections: ["113"] }
  ),
  bpItem("target-field", "Target Field",
    "mac-and-yes-please",
    "mac-yes-smoked-brisket-mac",
    "Smoked brisket mac bowl",
    "BBQ",
    "Mac bowl with smoked brisket.",
    { location: "Section 113", sections: ["113"] }
  ),
  bpItem("target-field", "Target Field",
    "justins-candied-popcorn-bar",
    "justins-souvenir-popcorn-helmet",
    "Candied popcorn souvenir helmet",
    "SNACK",
    "Custom popcorn in souvenir helmet; candy toppings.",
    { location: "Section 106", sections: ["106"] }
  ),
  bpItem("target-field", "Target Field",
    "izakaya-kazama",
    "izakaya-chocolate-fish-stick",
    "Chocolate fish on a stick (taiyaki)",
    "DESSERT",
    "Taiyaki-style fish waffle, custard, ice cream.",
    {
      location: "Truly On Deck / Town Ball Tavern",
      tags: ["Unique", "TODO: Confirm stand hours vs restaurant"]
    }
  ),
  bpItem("target-field", "Target Field",
    "niko-niko",
    "niko-dirty-soda",
    "Dirty soda",
    "DRINK",
    "Custom dirty soda line.",
    {
      itemType: "Non-Alcoholic Drink",
      beverageStyle: "Non-Alcoholic",
      location: "Section 120",
      sections: ["120"]
    }
  ),
  bpItem("target-field", "Target Field",
    "niko-niko",
    "niko-boozy-boba",
    "Boozy boba",
    "DRINK",
    "Boba cocktails.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Cocktail",
      location: "Section 120",
      sections: ["120"]
    }
  ),
  bpItem("target-field", "Target Field",
    "red-cow-target",
    "red-cow-double-barrel-burger",
    "Double Barrel Burger",
    "BURGER",
    "Signature double burger.",
    { location: "Section 233; Minnie & Paul’s", sections: ["233"] }
  ),
  bpItem("target-field", "Target Field",
    "red-cow-target",
    "red-cow-bacon-beef-slider",
    "60/40 bacon-beef slider",
    "BURGER",
    "Bacon-blend beef slider.",
    { location: "Section 233; Minnie & Paul’s", sections: ["233"] }
  ),
  bpItem("target-field", "Target Field",
    "pizza-luce-target",
    "pizza-luce-slice",
    "Pizza by the slice",
    "PIZZA",
    "Local slices; GF and vegan options offered.",
    { location: "Section 234; Minnie & Paul’s", sections: ["234"] }
  ),
  bpItem("target-field", "Target Field",
    "kramarczuks-sausages",
    "kramarczuks-brats",
    "Brat / Polish / Hungarian sausage",
    "HOT_DOG",
    "House sausages and brats.",
    { location: "Sections 101, 112, 312", sections: ["101", "112", "312"] }
  ),
  bpItem("target-field", "Target Field",
    "union-hmong-kitchen",
    "union-hmong-sweet-sour-pork",
    "Sweet and sour fried pork",
    "CHICKEN",
    "Union Hmong Kitchen signature pork.",
    { location: "Truly On Deck" }
  ),
  bpItem("target-field", "Target Field",
    "union-hmong-kitchen",
    "union-hmong-sausage",
    "Hmong sausage",
    "SANDWICH",
    "Hmong-style sausage serving.",
    { location: "Truly On Deck" }
  ),
  bpItem("target-field", "Target Field",
    "murrays-steakhouse",
    "murrays-silver-butter-knife-steak-sandwich",
    "Silver Butter Knife steak sandwich",
    "SANDWICH",
    "Murray’s legendary steak sandwich.",
    { location: "Truly On Deck; Section 108", sections: ["108"] }
  ),
  bpItem("target-field", "Target Field",
    "tony-os-cuban-sandwich",
    "tony-os-cuban",
    "Tony O’s Cuban sandwich",
    "SANDWICH",
    "Cuban sandwich named for Tony Oliva.",
    { location: "Section 114", sections: ["114"] }
  ),
  bpItem("target-field", "Target Field",
    "hot-indian-target",
    "hot-indian-chicken-tikka-bowl",
    "Chicken tikka bowl",
    "CHICKEN",
    "Indian bowl; chicken tikka.",
    { location: "Section 120", sections: ["120"] }
  ),
  bpItem("target-field", "Target Field",
    "hot-indian-target",
    "hot-indian-vegan-channa",
    "Vegan channa bowl",
    "VEGAN",
    "Chickpea (channa) vegan bowl.",
    { location: "Section 120", sections: ["120"] }
  ),
  bpItem("target-field", "Target Field",
    "taco-libre",
    "taco-libre-machete",
    "Machete taco / bowl",
    "TACOS",
    "Machete-style tacos and burrito bowls.",
    { location: "Section 103", sections: ["103"] }
  ),
  bpItem("target-field", "Target Field",
    "truly-on-deck",
    "truly-grab-and-go-counter",
    "Grab-and-go counter pick",
    "OTHER",
    "Quick counter item from Truly On Deck (menu varies).",
    { location: "Right field club level" }
  ),
  bpItem("target-field", "Target Field",
    "keepers-heart-town-ball-tavern",
    "keepers-bang-bang-chicken-sandwich",
    "Bang Bang chicken sandwich",
    "CHICKEN",
    "Town Ball Tavern favorite.",
    { location: "Section 229", sections: ["229"] }
  ),
  bpItem("target-field", "Target Field",
    "keepers-heart-town-ball-tavern",
    "keepers-loon-chili",
    "Loon chili",
    "OTHER",
    "Chili bowl (recipe varies).",
    { location: "Section 229", sections: ["229"] }
  ),
  bpItem("target-field", "Target Field",
    "hrbeks",
    "hrbeks-triple-sausage-bloody-mary",
    "Triple sausage sampler Bloody Mary",
    "DRINK",
    "Loaded Bloody Mary.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Cocktail",
      location: "Section 114",
      sections: ["114"]
    }
  ),
  bpItem("target-field", "Target Field",
    "hrbeks",
    "hrbeks-tater-tot-nachos",
    "Tater tot nachos",
    "SNACK",
    "Totchos-style plate.",
    { location: "Section 114", sections: ["114"] }
  ),
  bpItem("target-field", "Target Field",
    "pryes-homeplate-taproom",
    "pryes-beer-flight",
    "Pryes draft pour",
    "DRINK",
    "Local Pryes tap selection.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Beer",
      location: "Terrace level"
    }
  ),
  bpItem("target-field", "Target Field",
    "carbliss-clubhouse",
    "carbliss-rtd-cocktail",
    "Ready-to-drink cocktail",
    "DRINK",
    "Carbliss canned cocktail line.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Cocktail",
      location: "Gate 6"
    }
  ),
  bpItem("target-field", "Target Field",
    "surfside-bar",
    "surfside-canned-cocktail",
    "Iced tea / lemonade cocktail (canned)",
    "DRINK",
    "Canned Surfside cocktails.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Cocktail",
      location: "Club level"
    }
  ),
  bpItem("target-field", "Target Field",
    "cutwater-minnie-pauls",
    "cutwater-canned-cocktail",
    "Cutwater canned cocktail",
    "DRINK",
    "Cutwater bar at Minnie & Paul’s.",
    {
      itemType: "Alcoholic Drink",
      alcoholic: true,
      ageRestricted: true,
      beverageStyle: "Cocktail",
      location: "Center field, Minnie & Paul’s"
    }
  ),
  bpItem("target-field", "Target Field",
    "state-fair-stand",
    "target-state-fair-hot-dog",
    "Ballpark hot dog",
    "HOT_DOG",
    "Classic fair-style dog (multiple fair stands).",
    {
      location: "Multiple sections",
      tags: ["Target Field", "State Fair", "Concessions seed"]
    }
  ),
  bpItem("target-field", "Target Field",
    "state-fair-stand",
    "target-state-fair-chicken-strips",
    "Chicken strips basket",
    "CHICKEN",
    "Fair-style chicken strips.",
    {
      location: "Multiple sections",
      tags: ["Target Field", "State Fair", "Concessions seed"]
    }
  ),
  bpItem("target-field", "Target Field",
    "chicken-shack-target",
    "chicken-shack-howler",
    "Howler chicken sandwich",
    "CHICKEN",
    "Spicy-style chicken sandwich (fan nickname from source).",
    {
      location: "Multiple sections",
      tags: ["Target Field", "TODO: Confirm official sandwich name on menu"]
    }
  ),
  bpItem("target-field", "Target Field",
    "chicken-shack-target",
    "chicken-shack-tenders",
    "Chicken tenders",
    "CHICKEN",
    "Tenders basket.",
    { location: "Multiple sections" }
  ),
  bpItem("target-field", "Target Field",
    "blue-bunny-target",
    "blue-bunny-soft-serve-cup",
    "Soft serve cup / cone",
    "DESSERT",
    "Blue Bunny at Frozen Spoon kiosks.",
    {
      location: "Frozen Spoon (multiple)",
      tags: ["Target Field", "TODO: Tie to exact Frozen Spoon outposts"]
    }
  )
];

import {
  expansionBallparkFoodItems,
  expansionBallparkVendors
} from "./mlb-ballpark-concessions-parks-expansion";
import {
  wave2BallparkFoodItems,
  wave2BallparkVendors
} from "./mlb-ballpark-concessions-parks-wave2";
import {
  wave3BallparkFoodItems,
  wave3BallparkVendors
} from "./mlb-ballpark-concessions-parks-wave3";
import {
  wave4BallparkFoodItems,
  wave4BallparkVendors
} from "./mlb-ballpark-concessions-parks-wave4";

/** Merged into `lib/sample-data` — Target Field + MLB expansion waves 1–4. */
export const sixParkConcessionsVendors: Vendor[] = [
  ...targetFieldConcessionVendors,
  ...expansionBallparkVendors,
  ...wave2BallparkVendors,
  ...wave3BallparkVendors,
  ...wave4BallparkVendors
];

export const sixParkConcessionsFoodItems: FoodItem[] = [
  ...targetFieldConcessionItems,
  ...expansionBallparkFoodItems,
  ...wave2BallparkFoodItems,
  ...wave3BallparkFoodItems,
  ...wave4BallparkFoodItems
];
