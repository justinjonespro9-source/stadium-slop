export type EntityStatus = "active" | "hidden" | "archived";

export type UserRole = "reviewer" | "moderator" | "admin";

export type Reviewer = {
  id: string;
  displayName: string;
  handle: string;
  homeVenueSlug?: string;
  avatarPhotoId?: string;
  role: UserRole;
  status: EntityStatus | "suspended";
  joinedAt: string;
  helpfulLikesReceived: number;
  verifiedGameDayReviewCount: number;
  photoUploadCount: number;
};

export type Venue = {
  id?: string;
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

export type Vendor = {
  id?: string;
  slug: string;
  name: string;
  venueSlug: string;
  section: string;
  location: string;
  averageSlopScore: number;
  lineIntel?: string;
};

export type FoodItem = {
  id?: string;
  slug: string;
  name: string;
  venueSlug: string;
  vendorSlug: string;
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
  sections?: string[];
  price: number;
  reportedPrice?: number;
  priceLastConfirmedLabel?: string;
  priceReportCount?: number;
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
  freshReviewCount?: number;
  freshWindowLabel?: string;
  freshSignalScore?: number;
  freshSignal?:
    | "Hot Today"
    | "Holding Strong"
    | "Mixed Signals"
    | "Falling Fast"
    | "Fans Say Skip"
    | "Cold Streak"
    | "Line Trouble";
  freshSignalReason?: string;
};

export type FoodPhoto = {
  id: string;
  foodSlug: string;
  venueSlug: string;
  reviewId?: string;
  uploaderUserId?: string;
  photoType?: "food" | "profile" | "menu-price-proof";
  alt: string;
  caption: string;
  uploadedBy: string;
  verifiedOnSite: boolean;
  createdAt: string;
  /** Milliseconds since epoch for sorting (DB); optional for sample rows */
  sortTimestamp?: number;
  imagePlaceholder: string;
  /** Cloudinary (or other) HTTPS URL when stored */
  imageUrl?: string;
};

export type ReviewConsensusLabel =
  | "Run It Back"
  | "Worth the Walk"
  | "Stadium Tax"
  | "Steal"
  | "Bench It";

export type ReplayValueLabel =
  | "Game Day Starter"
  | "Solid Rotation Pick"
  | "Bench Option"
  | "Cut From the Roster";

export type PriceCheckLabel =
  | "Worth the Price of Admission"
  | "Fair Deal"
  | "Stadium Tax";

export type FoodReview = {
  id: string;
  foodSlug: string;
  venueSlug: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerHandle?: string;
  slopScore: number;
  napkinRating: 1 | 2 | 3 | 4 | 5;
  labels: ReviewConsensusLabel[];
  replayValue?: ReplayValueLabel;
  priceCheck?: PriceCheckLabel;
  helpfulLikes: number;
  verifiedGameDay: boolean;
  seasonLabel: string;
  gameDayKey?: string;
  dateLabel: string;
  hasPhoto?: boolean;
  /** Real image URL when review has an uploaded photo */
  photoUrl?: string;
  photoAlt?: string;
  photoLabel?: string;
  photoPlaceholder?: string;
  /** ISO timestamp of the primary (newest) ACTIVE fan photo for tie-breaks */
  reviewPhotoCreatedAt?: string;
  hasMenuPriceProof?: boolean;
  note?: string;
};

export type HelpfulLike = {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
};

export type PriceReport = {
  id: string;
  itemSlug: string;
  venueSlug: string;
  userId: string;
  reportedPrice: number;
  photoId?: string;
  status: "pending" | "approved" | "merged" | "rejected";
  createdAt: string;
};

export type SuggestedItem = {
  id: string;
  venueSlug: string;
  vendorSlug?: string;
  userId: string;
  name: string;
  category?: string;
  locationHint?: string;
  photoId?: string;
  status: "pending" | "approved" | "merged" | "rejected";
  createdAt: string;
};

export type ReportFlag = {
  id: string;
  reporterUserId: string;
  targetType: "review" | "photo" | "item" | "price-report" | "user";
  targetId: string;
  reason:
    | "duplicate"
    | "suspicious-activity"
    | "bad-intel"
    | "inappropriate-photo"
    | "other";
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
};

export type Item = FoodItem;
export type Photo = FoodPhoto;
export type Review = FoodReview;

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

export const vendors: Vendor[] = [
  {
    slug: "state-fair-stand",
    name: "State Fair Fry Co.",
    venueSlug: "target-field",
    section: "Main concourse",
    location: "Near Section 126",
    averageSlopScore: 8.6,
    lineIntel: "Moves fast before first pitch, slows hard between innings."
  },
  {
    slug: "north-loop-bar",
    name: "North Loop Pour House",
    venueSlug: "target-field",
    section: "Main concourse",
    location: "Left field corner",
    averageSlopScore: 7.8,
    lineIntel: "Best before gates fill; cocktail line stacks up late."
  },
  {
    slug: "family-freeze",
    name: "Family Freeze Cart",
    venueSlug: "target-field",
    section: "Family concourse",
    location: "Right field family area",
    averageSlopScore: 8.1,
    lineIntel: "Quick stop during hot day games."
  },
  {
    slug: "smokehouse-counter",
    name: "Smokehouse Goal Line",
    venueSlug: "us-bank-stadium",
    section: "Lower concourse",
    location: "Near Section 118",
    averageSlopScore: 8.4,
    lineIntel: "Worth checking early; fresh reviews mention line swings."
  },
  {
    slug: "upper-deck-nachos",
    name: "Upper Deck Nacho Cart",
    venueSlug: "us-bank-stadium",
    section: "Upper deck",
    location: "Near Section 332",
    averageSlopScore: 3.6,
    lineIntel: "Short line, but fan reports are rough."
  },
  {
    slug: "north-star-fish-fry",
    name: "North Star Fish Fry",
    venueSlug: "xcel-energy-center",
    section: "Club level",
    location: "Club level market",
    averageSlopScore: 8.2,
    lineIntel: "Fresh batches trend positive around intermission."
  }
];

export const foodItems: FoodItem[] = [
  {
    slug: "loaded-cheese-curds",
    name: "State Fair Loaded Curds",
    venueSlug: "target-field",
    vendorSlug: "state-fair-stand",
    itemType: "Food",
    category: "Snack",
    location: "Main concourse",
    sections: ["126", "214"],
    price: 13.99,
    reportedPrice: 13.99,
    priceLastConfirmedLabel: "May 2026",
    priceReportCount: 9,
    rating: 4.6,
    worthItScore: 91,
    slopScore: 8.8,
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
      "Hot curds under a loud pile of stadium toppings, built for sharing before the next half-inning rush.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 1,
    previousScoreboardRank: 3,
    venueBadge: "Fan Favorite",
    freshReviewCount: 6,
    freshWindowLabel: "today",
    freshSignalScore: 8.4,
    freshSignal: "Holding Strong",
    freshSignalReason: "Fans still say it is worth the line."
  },
  {
    slug: "brisket-sandwich",
    name: "Smokehouse Brisket Stack",
    venueSlug: "us-bank-stadium",
    vendorSlug: "smokehouse-counter",
    itemType: "Food",
    category: "BBQ",
    location: "Lower concourse",
    sections: ["118"],
    price: 16.99,
    reportedPrice: 16.99,
    priceLastConfirmedLabel: "2026 season",
    priceReportCount: 5,
    rating: 4.4,
    worthItScore: 84,
    slopScore: 8.4,
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
      "A heavy lower-bowl brisket stack with enough smoke to feel like a real pre-kickoff decision.",
    isPromoted: true,
    sponsorName: "Sample Sponsor",
    sponsorDisclosure: "Sponsored placement. Fan ratings remain independent.",
    isNewThisSeason: true,
    seasonIntroduced: "2026",
    availabilityStatus: "Venue verified",
    lastConfirmed: "2026 season",
    scoreboardRank: 2,
    venueBadge: "New This Season",
    freshReviewCount: 4,
    freshWindowLabel: "last 20 minutes",
    freshSignalScore: 6.7,
    freshSignal: "Falling Fast",
    freshSignalReason:
      "Recent reviews mention long lines and cooler-than-expected servings."
  },
  {
    slug: "walleye-basket",
    name: "North Star Walleye Basket",
    venueSlug: "xcel-energy-center",
    vendorSlug: "north-star-fish-fry",
    itemType: "Food",
    category: "Seafood",
    location: "Club level",
    sections: ["C26"],
    price: 15.49,
    reportedPrice: 15.49,
    priceLastConfirmedLabel: "2026 season",
    priceReportCount: 4,
    rating: 4.3,
    worthItScore: 82,
    slopScore: 8.2,
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
      "A hockey-night basket of fried walleye and fries that fans keep checking during intermission.",
    availabilityStatus: "Venue verified",
    lastConfirmed: "2026 season",
    scoreboardRank: 1,
    previousScoreboardRank: 1,
    venueBadge: "Venue MVP",
    freshReviewCount: 3,
    freshWindowLabel: "today",
    freshSignalScore: 8.7,
    freshSignal: "Hot Today",
    freshSignalReason:
      "Fresh batches and quick line reports are trending positive."
  },
  {
    slug: "cold-stadium-nachos",
    name: "Upper Deck Cold Nachos",
    venueSlug: "us-bank-stadium",
    vendorSlug: "upper-deck-nachos",
    itemType: "Food",
    category: "Nachos",
    location: "Upper deck",
    sections: ["332", "346"],
    price: 11.99,
    reportedPrice: 11.99,
    priceLastConfirmedLabel: "May 2026",
    priceReportCount: 7,
    rating: 2.1,
    worthItScore: 29,
    slopScore: 3.1,
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
      "A cautionary upper-deck tray where cold cheese and stale chips keep showing up in game-day reports.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 2,
    previousScoreboardRank: 1,
    venueBadge: "Slop Alert",
    freshReviewCount: 5,
    freshWindowLabel: "last 30 minutes",
    freshSignalScore: 2.4,
    freshSignal: "Fans Say Skip",
    freshSignalReason:
      "Recent fans reported cold cheese, stale chips, and poor value."
  },
  {
    slug: "north-loop-old-fashioned",
    name: "North Loop Old Fashioned",
    venueSlug: "target-field",
    vendorSlug: "north-loop-bar",
    itemType: "Alcoholic Drink",
    alcoholic: true,
    ageRestricted: true,
    beverageStyle: "Cocktail",
    category: "Cocktail",
    location: "Main concourse",
    sections: ["131"],
    price: 17.99,
    reportedPrice: 17.99,
    priceLastConfirmedLabel: "May 2026",
    priceReportCount: 3,
    rating: 4.1,
    worthItScore: 72,
    slopScore: 7.6,
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
      "A stiff ballpark cocktail that fans like, even while arguing about the stadium-tax price.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 2,
    venueBadge: "Hidden Gem",
    freshReviewCount: 2,
    freshWindowLabel: "today",
    freshSignalScore: 7.1,
    freshSignal: "Mixed Signals",
    freshSignalReason: "Fans like the flavor but say the price is steep."
  },
  {
    slug: "frozen-lemonade",
    name: "Right Field Frozen Lemonade",
    venueSlug: "target-field",
    vendorSlug: "family-freeze",
    itemType: "Non-Alcoholic Drink",
    alcoholic: false,
    ageRestricted: false,
    beverageStyle: "Non-Alcoholic",
    category: "Drink",
    location: "Family concourse",
    sections: ["229", "230"],
    price: 7.99,
    reportedPrice: 7.99,
    priceLastConfirmedLabel: "May 2026",
    priceReportCount: 8,
    rating: 4.2,
    worthItScore: 86,
    slopScore: 8.1,
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
      "A cold family-concourse stop that plays well on hot innings and quick walks back to the seats.",
    availabilityStatus: "Fan reported",
    lastConfirmed: "May 2026",
    scoreboardRank: 3,
    venueBadge: "Best Value",
    freshReviewCount: 7,
    freshWindowLabel: "today",
    freshSignalScore: 8.9,
    freshSignal: "Hot Today",
    freshSignalReason: "A strong non-alcoholic pick with quick lines."
  }
];

export const foodPhotos: FoodPhoto[] = [
  {
    id: "photo-loaded-cheese-curds-1",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    alt: "State Fair Loaded Curds in a ballpark tray",
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
    alt: "Cheese curds with toppings near the seats",
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
    alt: "Smokehouse Brisket Stack from the lower concourse",
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
    alt: "Brisket sandwich held before kickoff",
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
    alt: "North Star Walleye Basket with fries",
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
    alt: "Walleye basket after the walk back to the seats",
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
    alt: "Upper Deck Cold Nachos tray",
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
    alt: "Fan-reported nachos from the upper deck",
    caption: "A cautionary tray from the upper deck.",
    uploadedBy: "Slop Alert Desk",
    verifiedOnSite: true,
    createdAt: "May 2026",
    imagePlaceholder: "🧂"
  }
];

export const foodReviews: FoodReview[] = [
  {
    id: "review-loaded-curds-1",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    reviewerId: "user-seat126snacks",
    reviewerName: "Section 126 Snack Scout",
    reviewerHandle: "@seat126snacks",
    slopScore: 9.2,
    napkinRating: 3,
    labels: ["Run It Back", "Worth the Walk"],
    helpfulLikes: 18,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today",
    hasPhoto: true,
    photoAlt: "Fan-uploaded loaded cheese curds in a paper tray at Target Field",
    photoLabel: "Seat photo",
    photoPlaceholder: "🧀",
    hasMenuPriceProof: true,
    note: "Hot, salty, and still crisp by the time I got back to my seat."
  },
  {
    id: "review-loaded-curds-2",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    reviewerId: "user-upperdeckeats",
    reviewerName: "Upper Deck Eats",
    reviewerHandle: "@upperdeckeats",
    slopScore: 8.7,
    napkinRating: 4,
    labels: ["Run It Back", "Stadium Tax"],
    helpfulLikes: 12,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today",
    hasPhoto: true,
    photoAlt: "Fan-uploaded close-up of loaded cheese curds with sauce",
    photoLabel: "Game-day photo",
    photoPlaceholder: "🧀"
  },
  {
    id: "review-loaded-curds-3",
    foodSlug: "loaded-cheese-curds",
    venueSlug: "target-field",
    reviewerId: "user-napkinmath",
    reviewerName: "Napkin Math",
    reviewerHandle: "@napkinmath",
    slopScore: 8.5,
    napkinRating: 3,
    labels: ["Worth the Walk"],
    helpfulLikes: 9,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "May 2026",
    hasPhoto: true,
    photoAlt: "Fan-uploaded stadium cheese curds from the concourse",
    photoLabel: "Fan photo",
    photoPlaceholder: "🧀"
  },
  {
    id: "review-brisket-1",
    foodSlug: "brisket-sandwich",
    venueSlug: "us-bank-stadium",
    slopScore: 8.6,
    napkinRating: 4,
    labels: ["Run It Back", "Stadium Tax"],
    helpfulLikes: 14,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "2026 season",
    hasPhoto: true,
    photoAlt: "Fan-uploaded brisket sandwich on a stadium tray",
    photoLabel: "Concourse photo",
    photoPlaceholder: "🥪",
    hasMenuPriceProof: true
  },
  {
    id: "review-brisket-2",
    foodSlug: "brisket-sandwich",
    venueSlug: "us-bank-stadium",
    slopScore: 6.9,
    napkinRating: 4,
    labels: ["Stadium Tax", "Bench It"],
    helpfulLikes: 11,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Last 20 minutes",
    note: "Good bite, but the line made it feel like a bigger commitment."
  },
  {
    id: "review-brisket-3",
    foodSlug: "brisket-sandwich",
    venueSlug: "us-bank-stadium",
    slopScore: 7.1,
    napkinRating: 5,
    labels: ["Stadium Tax"],
    helpfulLikes: 6,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today"
  },
  {
    id: "review-walleye-1",
    foodSlug: "walleye-basket",
    venueSlug: "xcel-energy-center",
    slopScore: 8.8,
    napkinRating: 2,
    labels: ["Run It Back", "Worth the Walk"],
    helpfulLikes: 11,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today",
    hasPhoto: true
  },
  {
    id: "review-walleye-2",
    foodSlug: "walleye-basket",
    venueSlug: "xcel-energy-center",
    slopScore: 8.3,
    napkinRating: 2,
    labels: ["Worth the Walk"],
    helpfulLikes: 8,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "2026 season"
  },
  {
    id: "review-walleye-3",
    foodSlug: "walleye-basket",
    venueSlug: "xcel-energy-center",
    slopScore: 7.9,
    napkinRating: 3,
    labels: ["Run It Back"],
    helpfulLikes: 5,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "2026 season"
  },
  {
    id: "review-nachos-1",
    foodSlug: "cold-stadium-nachos",
    venueSlug: "us-bank-stadium",
    slopScore: 2.2,
    napkinRating: 5,
    labels: ["Bench It", "Stadium Tax"],
    helpfulLikes: 16,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Last 30 minutes",
    hasPhoto: true
  },
  {
    id: "review-nachos-2",
    foodSlug: "cold-stadium-nachos",
    venueSlug: "us-bank-stadium",
    slopScore: 3.0,
    napkinRating: 5,
    labels: ["Bench It"],
    helpfulLikes: 10,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today"
  },
  {
    id: "review-nachos-3",
    foodSlug: "cold-stadium-nachos",
    venueSlug: "us-bank-stadium",
    slopScore: 4.1,
    napkinRating: 4,
    labels: ["Stadium Tax"],
    helpfulLikes: 4,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "May 2026"
  },
  {
    id: "review-old-fashioned-1",
    foodSlug: "north-loop-old-fashioned",
    venueSlug: "target-field",
    slopScore: 7.5,
    napkinRating: 1,
    labels: ["Stadium Tax", "Run It Back"],
    helpfulLikes: 7,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today"
  },
  {
    id: "review-old-fashioned-2",
    foodSlug: "north-loop-old-fashioned",
    venueSlug: "target-field",
    slopScore: 6.8,
    napkinRating: 1,
    labels: ["Stadium Tax"],
    helpfulLikes: 5,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today"
  },
  {
    id: "review-old-fashioned-3",
    foodSlug: "north-loop-old-fashioned",
    venueSlug: "target-field",
    slopScore: 8.1,
    napkinRating: 1,
    labels: ["Run It Back"],
    helpfulLikes: 4,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "May 2026"
  },
  {
    id: "review-lemonade-1",
    foodSlug: "frozen-lemonade",
    venueSlug: "target-field",
    slopScore: 9.0,
    napkinRating: 2,
    labels: ["Steal", "Run It Back"],
    helpfulLikes: 13,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today",
    hasPhoto: true
  },
  {
    id: "review-lemonade-2",
    foodSlug: "frozen-lemonade",
    venueSlug: "target-field",
    slopScore: 8.8,
    napkinRating: 2,
    labels: ["Steal", "Worth the Walk"],
    helpfulLikes: 9,
    verifiedGameDay: true,
    seasonLabel: "2026",
    dateLabel: "Today"
  },
  {
    id: "review-lemonade-3",
    foodSlug: "frozen-lemonade",
    venueSlug: "target-field",
    slopScore: 8.1,
    napkinRating: 3,
    labels: ["Run It Back"],
    helpfulLikes: 6,
    verifiedGameDay: false,
    seasonLabel: "2026",
    dateLabel: "May 2026"
  }
];

export function getVenueBySlug(slug: string) {
  return venues.find((venue) => venue.slug === slug);
}

export function getVendorBySlug(slug: string) {
  return vendors.find((vendor) => vendor.slug === slug);
}

export function getVendorsByVenueSlug(venueSlug: string) {
  return vendors.filter((vendor) => vendor.venueSlug === venueSlug);
}

export function getFoodItemsByVenueSlug(venueSlug: string) {
  return foodItems.filter((item) => item.venueSlug === venueSlug);
}

export function getFoodItemsByVendorSlug(vendorSlug: string) {
  return foodItems.filter((item) => item.vendorSlug === vendorSlug);
}

export function getFoodItemBySlug(slug: string) {
  return foodItems.find((item) => item.slug === slug);
}

export function getVenueForFoodItem(item: FoodItem) {
  return getVenueBySlug(item.venueSlug);
}

export function getVendorForFoodItem(item: FoodItem) {
  return getVendorBySlug(item.vendorSlug);
}

export function getPhotosForFoodItem(venueSlug: string, foodSlug: string) {
  return foodPhotos.filter(
    (photo) => photo.venueSlug === venueSlug && photo.foodSlug === foodSlug
  );
}

export function getPhotosForVenue(venueSlug: string) {
  return foodPhotos.filter((photo) => photo.venueSlug === venueSlug);
}
