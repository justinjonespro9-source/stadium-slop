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
