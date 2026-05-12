export type Venue = {
  slug: string;
  name: string;
  city: string;
  state: string;
  leagues: string[];
  teams: string[];
  sports: string[];
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  venueType: "Ballpark" | "Stadium" | "Arena";
};

export type FoodItem = {
  slug: string;
  name: string;
  venueSlug: string;
  itemType: "Food" | "Non-Alcoholic Drink" | "Alcoholic Drink";
  alcoholic?: boolean;
  ageRestricted?: boolean;
  beverageStyle?:
    | "Beer"
    | "Cocktail"
    | "Wine"
    | "Seltzer"
    | "Non-Alcoholic"
    | "Other";
  category: string;
  location: string;
  price: number;
  rating: number;
  worthItScore: number;
  slopScore: number;
  verdict:
    | "Hall of Fame Bite"
    | "Starter Every Game"
    | "Solid Role Player"
    | "Bench It"
    | "Slop Alert";
  runItBackPercent: number;
  valueLabel: "Steal" | "Fair Deal" | "Stadium Tax" | "Overpaid" | "Robbery";
  servedRightLabel:
    | "Game Ready"
    | "Fine"
    | "Sat on the Bench"
    | "Not Applicable";
  lineWaitLabel:
    | "Quick Stop"
    | "Worth the Wait"
    | "Too Long"
    | "Missed the Action"
    | "Not Applicable";
  napkinRating: 1 | 2 | 3 | 4 | 5;
  napkinLabel:
    | "Clean Win"
    | "Safe at Your Seat"
    | "Two-Handed Problem"
    | "Jersey Danger"
    | "Full Cleanup Crew";
  reviewCount: number;
  tags: string[];
  description: string;
  isPromoted?: boolean;
  sponsorName?: string;
  sponsorDisclosure?: string;
  isNewThisSeason?: boolean;
  seasonIntroduced?: string;
  availabilityStatus?:
    | "Available"
    | "Seasonal"
    | "Retired"
    | "Fan reported"
    | "Venue verified";
  lastConfirmed?: string;
  scoreboardRank?: number;
  previousScoreboardRank?: number;
  venueBadge?:
    | "Venue MVP"
    | "Fan Favorite"
    | "Best Value"
    | "Worth the Line"
    | "New This Season"
    | "Napkin Nightmare"
    | "Slop Alert"
    | "Hidden Gem"
    | "Most Improved"
    | "Falling Fast";
};

export type FoodPhoto = {
  id: string;
  foodSlug: string;
  venueSlug: string;
  alt: string;
  caption: string;
  uploadedBy: string;
  verifiedOnSite: boolean;
  createdAt: string;
  imagePlaceholder: string;
};

export const venues: Venue[] = [
  {
    slug: "target-field",
    name: "Target Field",
    city: "Minneapolis",
    state: "MN",
    leagues: ["MLB"],
    teams: ["Minnesota Twins"],
    sports: ["Baseball"],
    country: "USA",
    region: "North America",
    latitude: 44.9817,
    longitude: -93.2776,
    reviewRadiusMeters: 800,
    venueType: "Ballpark"
  },
  {
    slug: "us-bank-stadium",
    name: "U.S. Bank Stadium",
    city: "Minneapolis",
    state: "MN",
    leagues: ["NFL"],
    teams: ["Minnesota Vikings"],
    sports: ["Football"],
    country: "USA",
    region: "North America",
    latitude: 44.9738,
    longitude: -93.2581,
    reviewRadiusMeters: 800,
    venueType: "Stadium"
  },
  {
    slug: "xcel-energy-center",
    name: "Xcel Energy Center",
    city: "St. Paul",
    state: "MN",
    leagues: ["NHL", "PWHL"],
    teams: ["Minnesota Wild", "Minnesota Frost"],
    sports: ["Hockey"],
    country: "USA",
    region: "North America",
    latitude: 44.9448,
    longitude: -93.1011,
    reviewRadiusMeters: 800,
    venueType: "Arena"
  }
];

export const foodItems: FoodItem[] = [
  {
    slug: "loaded-cheese-curds",
    name: "Loaded Cheese Curds",
    venueSlug: "target-field",
    itemType: "Food",
    category: "Snack",
    location: "Main concourse",
    price: 13.99,
    rating: 4.6,
    worthItScore: 91,
    slopScore: 4.6,
    verdict: "Starter Every Game",
    runItBackPercent: 91,
    valueLabel: "Fair Deal",
    servedRightLabel: "Game Ready",
    lineWaitLabel: "Worth the Wait",
    napkinRating: 3,
    napkinLabel: "Two-Handed Problem",
    reviewCount: 128,
    tags: ["Shareable", "Salty", "Fan Favorite"],
    description:
      "Crispy cheese curds loaded up for a ballpark snack that feels like Minnesota in a basket.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 1,
    previousScoreboardRank: 3,
    venueBadge: "Fan Favorite"
  },
  {
    slug: "brisket-sandwich",
    name: "Brisket Sandwich",
    venueSlug: "us-bank-stadium",
    itemType: "Food",
    category: "BBQ",
    location: "Lower concourse",
    price: 16.99,
    rating: 4.4,
    worthItScore: 84,
    slopScore: 4.4,
    verdict: "Starter Every Game",
    runItBackPercent: 88,
    valueLabel: "Stadium Tax",
    servedRightLabel: "Game Ready",
    lineWaitLabel: "Too Long",
    napkinRating: 4,
    napkinLabel: "Jersey Danger",
    reviewCount: 96,
    tags: ["Filling", "Smoky", "Worth the Line"],
    description:
      "A stadium-sized brisket sandwich built for fans who want something more serious than a hot dog.",
    isPromoted: true,
    sponsorName: "Sample Sponsor",
    sponsorDisclosure: "Sponsored placement. Fan ratings remain independent.",
    isNewThisSeason: true,
    seasonIntroduced: "2026",
    availabilityStatus: "Venue verified",
    lastConfirmed: "2026 season",
    scoreboardRank: 2,
    venueBadge: "New This Season"
  },
  {
    slug: "walleye-basket",
    name: "Walleye Basket",
    venueSlug: "xcel-energy-center",
    itemType: "Food",
    category: "Seafood",
    location: "Club level",
    price: 15.49,
    rating: 4.3,
    worthItScore: 82,
    slopScore: 4.3,
    verdict: "Solid Role Player",
    runItBackPercent: 82,
    valueLabel: "Fair Deal",
    servedRightLabel: "Game Ready",
    lineWaitLabel: "Quick Stop",
    napkinRating: 2,
    napkinLabel: "Safe at Your Seat",
    reviewCount: 74,
    tags: ["Local Flavor", "Crispy", "Arena Classic"],
    description:
      "A Minnesota hockey-night basket with fried walleye, fries, and just enough hometown credibility.",
    availabilityStatus: "Venue verified",
    lastConfirmed: "2026 season",
    scoreboardRank: 1,
    previousScoreboardRank: 1,
    venueBadge: "Venue MVP"
  },
  {
    slug: "cold-stadium-nachos",
    name: "Cold Stadium Nachos",
    venueSlug: "us-bank-stadium",
    itemType: "Food",
    category: "Nachos",
    location: "Upper deck",
    price: 11.99,
    rating: 2.1,
    worthItScore: 29,
    slopScore: 2.1,
    verdict: "Slop Alert",
    runItBackPercent: 18,
    valueLabel: "Robbery",
    servedRightLabel: "Sat on the Bench",
    lineWaitLabel: "Missed the Action",
    napkinRating: 5,
    napkinLabel: "Full Cleanup Crew",
    reviewCount: 51,
    tags: ["Overpriced", "Skip It", "Slop Candidate"],
    description:
      "The kind of nachos that make fans question every financial decision that led to kickoff.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 2,
    previousScoreboardRank: 1,
    venueBadge: "Slop Alert"
  },
  {
    slug: "north-loop-old-fashioned",
    name: "North Loop Old Fashioned",
    venueSlug: "target-field",
    itemType: "Alcoholic Drink",
    alcoholic: true,
    ageRestricted: true,
    beverageStyle: "Cocktail",
    category: "Cocktail",
    location: "Main concourse",
    price: 17.99,
    rating: 4.1,
    worthItScore: 72,
    slopScore: 4.1,
    verdict: "Solid Role Player",
    runItBackPercent: 76,
    valueLabel: "Stadium Tax",
    servedRightLabel: "Game Ready",
    lineWaitLabel: "Too Long",
    napkinRating: 1,
    napkinLabel: "Clean Win",
    reviewCount: 32,
    tags: ["Cocktail", "21+", "Premium"],
    description:
      "A ballpark cocktail placeholder for fans who want something stronger than a soda.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 2,
    venueBadge: "Hidden Gem"
  },
  {
    slug: "frozen-lemonade",
    name: "Frozen Lemonade",
    venueSlug: "target-field",
    itemType: "Non-Alcoholic Drink",
    alcoholic: false,
    ageRestricted: false,
    beverageStyle: "Non-Alcoholic",
    category: "Drink",
    location: "Family concourse",
    price: 7.99,
    rating: 4.2,
    worthItScore: 86,
    slopScore: 4.2,
    verdict: "Solid Role Player",
    runItBackPercent: 84,
    valueLabel: "Fair Deal",
    servedRightLabel: "Game Ready",
    lineWaitLabel: "Quick Stop",
    napkinRating: 2,
    napkinLabel: "Safe at Your Seat",
    reviewCount: 44,
    tags: ["Cold", "Family Friendly", "Non-Alcoholic"],
    description:
      "A frozen lemonade placeholder built for hot day games and sticky fingers.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 3,
    venueBadge: "Best Value"
  }
];

export const foodPhotos: FoodPhoto[] = [
  {
    id: "photo-loaded-cheese-curds-1",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    alt: "Loaded Cheese Curds placeholder photo",
    caption: "Basket of curds that actually showed up hot.",
    uploadedBy: "Section 126 Snack Scout",
    verifiedOnSite: true,
    createdAt: "May 2026",
    imagePlaceholder: "🧀"
  },
  {
    id: "photo-loaded-cheese-curds-2",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    alt: "Cheese curds concession placeholder",
    caption: "Good cheese pull, slightly chaotic basket.",
    uploadedBy: "Twins Home Stand",
    verifiedOnSite: false,
    createdAt: "May 2026",
    imagePlaceholder: "🧀"
  },
  {
    id: "photo-brisket-sandwich-1",
    foodSlug: "brisket-sandwich",
    venueSlug: "us-bank-stadium",
    alt: "Brisket Sandwich placeholder photo",
    caption: "Stacked enough to need both hands.",
    uploadedBy: "Lower Bowl BBQ Watch",
    verifiedOnSite: true,
    createdAt: "2026 season",
    imagePlaceholder: "🥪"
  },
  {
    id: "photo-brisket-sandwich-2",
    foodSlug: "brisket-sandwich",
    venueSlug: "us-bank-stadium",
    alt: "Smoky brisket sandwich placeholder",
    caption: "Worth photographing before kickoff.",
    uploadedBy: "Vikings Tailgate Transfer",
    verifiedOnSite: true,
    createdAt: "2026 season",
    imagePlaceholder: "🥪"
  },
  {
    id: "photo-walleye-basket-1",
    foodSlug: "walleye-basket",
    venueSlug: "xcel-energy-center",
    alt: "Walleye Basket placeholder photo",
    caption: "Crispy basket from the club level.",
    uploadedBy: "Hockey Night Plate Cam",
    verifiedOnSite: true,
    createdAt: "2026 season",
    imagePlaceholder: "🐟"
  },
  {
    id: "photo-walleye-basket-2",
    foodSlug: "walleye-basket",
    venueSlug: "xcel-energy-center",
    alt: "Arena walleye basket placeholder",
    caption: "Fries survived the walk back to the seats.",
    uploadedBy: "Wild Intermission Eats",
    verifiedOnSite: false,
    createdAt: "2026 season",
    imagePlaceholder: "🐟"
  },
  {
    id: "photo-cold-stadium-nachos-1",
    foodSlug: "cold-stadium-nachos",
    venueSlug: "us-bank-stadium",
    alt: "Cold Stadium Nachos placeholder photo",
    caption: "The cheese situation speaks for itself.",
    uploadedBy: "Upper Deck Auditor",
    verifiedOnSite: true,
    createdAt: "May 2026",
    imagePlaceholder: "🧂"
  },
  {
    id: "photo-cold-stadium-nachos-2",
    foodSlug: "cold-stadium-nachos",
    venueSlug: "us-bank-stadium",
    alt: "Questionable stadium nachos placeholder",
    caption: "A cautionary tray from the upper deck.",
    uploadedBy: "Slop Alert Desk",
    verifiedOnSite: true,
    createdAt: "May 2026",
    imagePlaceholder: "🧂"
  }
];

export function getVenueBySlug(slug: string) {
  return venues.find((venue) => venue.slug === slug);
}

export function getFoodItemsByVenueSlug(venueSlug: string) {
  return foodItems.filter((item) => item.venueSlug === venueSlug);
}

export function getFoodItemBySlug(slug: string) {
  return foodItems.find((item) => item.slug === slug);
}

export function getVenueForFoodItem(item: FoodItem) {
  return getVenueBySlug(item.venueSlug);
}

export function getPhotosForFoodItem(venueSlug: string, foodSlug: string) {
  return foodPhotos.filter(
    (photo) => photo.venueSlug === venueSlug && photo.foodSlug === foodSlug
  );
}

export function getPhotosForVenue(venueSlug: string) {
  return foodPhotos.filter((photo) => photo.venueSlug === venueSlug);
}
