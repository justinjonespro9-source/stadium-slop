import { bpItem, bpVendor } from "./ballpark-menu-builders";
import type { FoodItem, Vendor } from "./sample-data";

const SHP = "sutter-health-park";
const SHPT = "Sutter Health Park";

const alc = {
  itemType: "Alcoholic Drink" as const,
  alcoholic: true,
  ageRestricted: true
};

/** Wave 5 MLB concessions — Athletics temporary home at Sutter Health Park (Sacramento). */
export const wave5BallparkVendors: Vendor[] = [
  bpVendor(SHP, "shp-bridges-grille", "Bridges Grille", "Field", "Section 105"),
  bpVendor(SHP, "shp-coop-kennel-pub", "Coop & Kennel Pub", "Field", "Section 117"),
  bpVendor(SHP, "shp-osos-mexican-grille", "Oso’s Mexican Grille", "Field", "Section 121", "Many tacos labeled gluten-sensitive in source; verify prep and cross-contact."),
  bpVendor(SHP, "shp-merlinos-freeze", "Merlino’s Freeze", "Concourse", "Location not listed in source", "TODO: Map Merlino’s Freeze kiosk sections for temporary MLB layout."),
  bpVendor(SHP, "shp-bogle-family-vineyards", "Bogle Family Vineyards", "Field", "Section 115"),
  bpVendor(SHP, "shp-cadillac-diner", "Cadillac Diner", "Concourse", "Location not listed in source", "TODO: Confirm Cadillac Diner footprint for A’s temporary schedule."),
  bpVendor(
    SHP,
    "shp-toyota-two-for-tuesdays",
    "Toyota Two-For Tuesdays",
    "Promotions",
    "Participating stands (varies)",
    "Tuesday promo menu; promotion-specific pricing. TODO: Confirm stand list during temporary MLB homestands."
  ),
  bpVendor(
    SHP,
    "shp-bogle-wine-wednesdays",
    "Bogle Wine Wednesdays",
    "Promotions",
    "Participating locations (varies)",
    "Wednesday wine promo; promotion-specific pricing."
  ),
  bpVendor(
    SHP,
    "shp-taps-trivia-thursdays",
    "Taps & Trivia Thursdays",
    "Promotions",
    "Participating bars (varies)",
    "Thursday tap promo; promotion-specific pricing."
  ),
  bpVendor(
    SHP,
    "shp-smud-orange-fridays",
    "SMUD Orange Fridays",
    "Promotions",
    "Happy hour locations (varies)",
    "Friday happy hour promo; promotion-specific pricing."
  ),
  bpVendor(
    SHP,
    "shp-kids-rule-sundays",
    "Kids Rule Sundays",
    "Promotions",
    "Kids menu locations (varies)",
    "Sunday kids promo; promotion-specific pricing."
  ),
  bpVendor(SHP, "shp-beer-garden", "The Beer Garden", "Outfield", "Right field"),
  bpVendor(
    SHP,
    "shp-sky-river-solon-club",
    "Sky River Casino Solon Club",
    "Premium",
    "Club level",
    "Premium space; verify public access and ticket requirements for temporary MLB."
  ),
  bpVendor(
    SHP,
    "shp-gilt-edge-club",
    "Gilt-Edge Club",
    "Club",
    "Main concourse",
    "Hospitality space; verify public access and ticket requirements."
  ),
  bpVendor(
    SHP,
    "shp-jackson-rancheria-legacy-club",
    "Jackson Rancheria Legacy Club",
    "Premium",
    "Club / lounge",
    "Club lounge; verify public access and ticket requirements for temporary MLB."
  ),
  bpVendor(
    SHP,
    "shp-mobile-ordering",
    "Mobile Ordering",
    "Service",
    "Ballpark app pickup",
    "MLB Ballpark App mobile order pickup; not a traditional food stand. TODO: Confirm pickup windows and branded lockers during A’s games."
  ),
  bpVendor(
    SHP,
    "shp-gluten-sensitive-options",
    "Gluten-Sensitive Options",
    "Concourse",
    "Parkwide (prep varies)",
    "Gluten-sensitive builds depend on prep; verify with stand before ordering."
  )
];

export const wave5BallparkFoodItems: FoodItem[] = [
  bpItem(SHP, SHPT, "shp-bridges-grille", "shp-home-run-smash", "Home Run Smash", "BURGER", "Double burger with beef belly, brisket, chuck, caramelized onions, American cheese, pickles, Home Run sauce.", { location: "Section 105", sections: ["105"] }),
  bpItem(SHP, SHPT, "shp-bridges-grille", "shp-spicy-chicken-bacon-ranch-sub", "Spicy Chicken Bacon Ranch Sub", "SANDWICH", "Crispy chicken, bacon, spicy ranch on local French roll.", { location: "Section 105", sections: ["105"] }),
  bpItem(SHP, SHPT, "shp-bridges-grille", "shp-bridges-garlic-fries", "Garlic Fries", "SNACK", "Crinkle-cut fries with fresh garlic and parmesan.", { location: "Section 105", sections: ["105"] }),
  bpItem(SHP, SHPT, "shp-coop-kennel-pub", "shp-river-city-hot-tenders", "River City Hot Tenders", "CHICKEN", "Foster Farms tenders tossed in chili oil and River City spices, with fries and pickles.", { location: "Section 117", sections: ["117"] }),
  bpItem(SHP, SHPT, "shp-coop-kennel-pub", "shp-street-dog", "Street Dog", "HOT_DOG", "Bacon-wrapped all-beef hot dog with sautéed peppers and onions.", { location: "Section 117", sections: ["117"] }),
  bpItem(SHP, SHPT, "shp-coop-kennel-pub", "shp-coop-garlic-fries", "Garlic Fries", "SNACK", "Crinkle-cut fries with fresh garlic and parmesan.", { location: "Section 117", sections: ["117"] }),
  bpItem(SHP, SHPT, "shp-osos-mexican-grille", "shp-jackfruit-street-tacos", "Jackfruit Street Tacos", "VEGAN", "Seasoned jackfruit tacos with cilantro, onion, lime.", { location: "Section 121", sections: ["121"] }),
  bpItem(SHP, SHPT, "shp-osos-mexican-grille", "shp-osos-gluten-sensitive-tacos", "Gluten-Sensitive Tacos", "GLUTEN_FREE", "Tacos labeled gluten-sensitive in park materials; verify prep and cross-contact.", { location: "Section 121", sections: ["121"], tags: [SHPT, "Gluten sensitive", "TODO: Confirm dedicated prep vs shared line"] }),
  bpItem(SHP, SHPT, "shp-merlinos-freeze", "shp-orange-freeze", "Orange Freeze", "DESSERT", "Sacramento fruit freeze classic.", { location: "Concourse" }),
  bpItem(SHP, SHPT, "shp-merlinos-freeze", "shp-fruit-freeze", "Fruit Freeze", "DESSERT", "Seasonal fruit freeze.", { location: "Concourse" }),
  bpItem(SHP, SHPT, "shp-bogle-family-vineyards", "shp-bogle-wine", "Bogle Wine", "DRINK", "Bogle Family Vineyards wine pours.", { ...alc, beverageStyle: "Wine", location: "Section 115", sections: ["115"] }),
  bpItem(SHP, SHPT, "shp-bogle-family-vineyards", "shp-froze-flavor-month", "Frozé Flavor of the Month", "DRINK", "Rotating frozé flavor.", { ...alc, beverageStyle: "Cocktail", location: "Section 115", sections: ["115"] }),
  bpItem(SHP, SHPT, "shp-cadillac-diner", "shp-short-rib-chili-cheese-dog", "Short Rib Chili Cheese Dog", "HOT_DOG", "Dog topped with short rib chili and cheese sauce.", { location: "Main concourse" }),
  bpItem(SHP, SHPT, "shp-cadillac-diner", "shp-hand-spun-milkshake", "Hand-Spun Milkshake", "DESSERT", "Hand-spun milkshake.", { location: "Main concourse" }),
  bpItem(SHP, SHPT, "shp-toyota-two-for-tuesdays", "shp-two-dollar-hot-dog", "Two Dollar Hot Dog", "HOT_DOG", "Tuesday promotional hot dog.", { location: "Participating stands", tags: [SHPT, "Promotion", "TODO: Confirm Tuesday promo details for A’s schedule"] }),
  bpItem(SHP, SHPT, "shp-toyota-two-for-tuesdays", "shp-two-dollar-novelty-ice-cream", "Two Dollar Novelty Ice Cream", "DESSERT", "Tuesday promotional novelty ice cream.", { location: "Participating stands", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-toyota-two-for-tuesdays", "shp-two-for-one-pizza", "Two-for-One Pizza", "PIZZA", "Tuesday two-for-one pizza special.", { location: "Participating stands", tags: [SHPT, "Promotion", "TODO: Do not map to base price; promo pricing only"] }),
  bpItem(SHP, SHPT, "shp-toyota-two-for-tuesdays", "shp-two-for-one-nachos", "Two-for-One Nachos", "SNACK", "Tuesday two-for-one nachos special.", { location: "Participating stands", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-toyota-two-for-tuesdays", "shp-two-for-one-popcorn", "Two-for-One Popcorn", "SNACK", "Tuesday two-for-one popcorn special.", { location: "Participating stands", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-bogle-wine-wednesdays", "shp-discounted-bogle-wine", "Discounted Bogle Wine", "DRINK", "Wednesday discounted Bogle wine pours.", { ...alc, beverageStyle: "Wine", location: "Participating locations", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-bogle-wine-wednesdays", "shp-souvenir-froze-cup", "Souvenir Frozé Cup", "DRINK", "Frozé in souvenir cup (Wednesday promo).", { ...alc, beverageStyle: "Cocktail", location: "Participating locations", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-taps-trivia-thursdays", "shp-local-16oz-tap-beer", "Local 16oz Tap Beer", "DRINK", "16oz local craft tap (Thursday promo).", { ...alc, beverageStyle: "Beer", location: "Participating bars", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-taps-trivia-thursdays", "shp-taps-domestic-beer", "Domestic Beer", "DRINK", "Domestic draft or bottle (Thursday promo).", { ...alc, beverageStyle: "Beer", location: "Participating bars", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-smud-orange-fridays", "shp-smud-happy-hour-beer", "Happy Hour Beer", "DRINK", "Friday happy hour beer pricing where offered.", { ...alc, beverageStyle: "Beer", location: "Happy hour locations", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-smud-orange-fridays", "shp-smud-happy-hour-wine", "Happy Hour Wine", "DRINK", "Friday happy hour wine pricing where offered.", { ...alc, beverageStyle: "Wine", location: "Happy hour locations", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-smud-orange-fridays", "shp-smud-happy-hour-cocktail", "Happy Hour Cocktail", "DRINK", "Friday happy hour cocktail pricing where offered.", { ...alc, beverageStyle: "Cocktail", location: "Happy hour locations", tags: [SHPT, "Promotion"] }),
  bpItem(SHP, SHPT, "shp-kids-rule-sundays", "shp-mini-helmet-nachos", "Mini-Helmet Nachos", "SNACK", "Nachos served in mini helmet (Sunday kids promo).", { location: "Kids menu locations", tags: [SHPT, "Promotion", "Kids"] }),
  bpItem(SHP, SHPT, "shp-kids-rule-sundays", "shp-junior-dog", "Junior Dog", "HOT_DOG", "Junior-size hot dog (Sunday kids promo).", { location: "Kids menu locations", tags: [SHPT, "Promotion", "Kids"] }),
  bpItem(SHP, SHPT, "shp-kids-rule-sundays", "shp-kids-pretzel", "Pretzel", "SNACK", "Soft pretzel (Sunday kids promo).", { location: "Kids menu locations", tags: [SHPT, "Promotion", "Kids"] }),
  bpItem(SHP, SHPT, "shp-beer-garden", "shp-track-7-beer", "Track 7 Beer", "DRINK", "Track 7 Brewing draft.", { ...alc, beverageStyle: "Beer", location: "Right field" }),
  bpItem(SHP, SHPT, "shp-beer-garden", "shp-bike-dog-beer", "Bike Dog Beer", "DRINK", "Bike Dog Brewing draft.", { ...alc, beverageStyle: "Beer", location: "Right field" }),
  bpItem(SHP, SHPT, "shp-beer-garden", "shp-auburn-alehouse-beer", "Auburn Alehouse Beer", "DRINK", "Auburn Alehouse draft.", { ...alc, beverageStyle: "Beer", location: "Right field" }),
  bpItem(SHP, SHPT, "shp-beer-garden", "shp-local-norcal-craft-beer", "Local NorCal Craft Beer", "DRINK", "Rotating Northern California craft taps.", { ...alc, beverageStyle: "Beer", location: "Right field", tags: [SHPT, "TODO: Confirm tap list by homestand"] }),
  bpItem(SHP, SHPT, "shp-sky-river-solon-club", "shp-solon-premium-bar-drinks", "Premium Bar Drinks", "DRINK", "Premium bar cocktails, wine, and beer.", { ...alc, beverageStyle: "Cocktail", location: "Solon Club", tags: [SHPT, "TODO: Verify ticket / access for temporary MLB"] }),
  bpItem(SHP, SHPT, "shp-sky-river-solon-club", "shp-solon-rotating-high-end-plate", "Rotating High-End Plate", "OTHER", "Rotating premium plate (menu by date).", { location: "Solon Club", tags: [SHPT, "Premium", "TODO: Verify access"] }),
  bpItem(SHP, SHPT, "shp-gilt-edge-club", "shp-gilt-edge-bar-drinks", "Bar Drinks", "DRINK", "Full bar service in Gilt-Edge Club.", { ...alc, beverageStyle: "Cocktail", location: "Main concourse", tags: [SHPT, "TODO: Hospitality access rules"] }),
  bpItem(SHP, SHPT, "shp-jackson-rancheria-legacy-club", "shp-legacy-craft-cocktails", "Craft Cocktails", "DRINK", "Legacy Club craft cocktails.", { ...alc, beverageStyle: "Cocktail", location: "Legacy Club", tags: [SHPT, "TODO: Verify club access"] }),
  bpItem(SHP, SHPT, "shp-jackson-rancheria-legacy-club", "shp-legacy-premium-spirits", "Premium Spirits", "DRINK", "Premium spirits pours.", { ...alc, beverageStyle: "Other", location: "Legacy Club", tags: [SHPT, "TODO: Verify club access"] }),
  bpItem(SHP, SHPT, "shp-mobile-ordering", "shp-mobile-order-pickup", "Mobile Order Pickup", "OTHER", "Order ahead in MLB Ballpark App and pick up at designated location.", { location: "Designated pickup", tags: [SHPT, "Convenience", "Not a cooked-to-order stand"] }),
  bpItem(SHP, SHPT, "shp-gluten-sensitive-options", "shp-gf-river-city-hot-tenders", "Gluten-Sensitive River City Hot Tenders", "GLUTEN_FREE", "Source: may be gluten-sensitive if ordered without breading; verify at stand before ordering.", { location: "Participating locations", tags: [SHPT, "Gluten sensitive", "TODO: Confirm unbreaded prep and fryer"] })
];
