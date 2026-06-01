/** Static homepage sample only — not linked to venues, items, or reviews. */

export type HomeScorecardExampleData = {
  itemName: string;
  venueContext: string;
  locationHint: string;
  slopScore: number;
  /** Shown in the food photo well when `foodImage` is not set. */
  photoEmoji: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerHandle: string;
  showFanScout: boolean;
  /** Static “More at this venue →” line on the card back (no link). */
  showMoreAtVenue: boolean;
  venuesReviewed: string;
  itemsReviewed: string;
  helpfulEarned: string;
  /** Slop Signals on the card back (may differ from front badge score). */
  backSlopScore: number;
  napkinRating: string;
  replayValue: string;
  priceCheck: string;
  hotTake: string;
  /** “This card” block on the back face. */
  cardItemName: string;
  cardVenueName: string;
  cardMetaLine: string;
  datePosted: string;
  /**
   * Public path to a static food photo, e.g.
   * `/branding/example-scorecards/sample-food.jpg`
   */
  foodImage?: string;
  /**
   * Public path to a static reviewer avatar, e.g.
   * `/branding/example-scorecards/sample-reviewer.jpg`
   */
  reviewerImage?: string;
  foodImageAlt?: string;
  reviewerImageAlt?: string;
};

/** Drop images into `public/branding/example-scorecards/` and set paths here. */
export const HOME_SCORECARD_EXAMPLE: HomeScorecardExampleData = {
  itemName: "Ultimate Stadium Nachos",
  venueContext: "Springfield Stadium concession",
  locationHint: "Section 112 · Concourse level",
  slopScore: 8.8,
  photoEmoji: "🧀",
  reviewerName: "Casey",
  reviewerInitials: "CB",
  reviewerHandle: "@CaseyAtBat",
  showFanScout: true,
  showMoreAtVenue: true,
  venuesReviewed: "5",
  itemsReviewed: "23",
  helpfulEarned: "84",
  backSlopScore: 8.8,
  napkinRating: "4 / 5 Jersey Danger",
  replayValue: "Game Day Starter",
  priceCheck: "Fair Deal",
  hotTake: "Loaded & would defintely get again.",
  cardItemName: "Ultimate Stadium Nachos",
  cardVenueName: "Sample stadium concession",
  cardMetaLine: "Example only · not a verified live review",
  datePosted: "6/1/26",
  foodImage: "/branding/example-scorecards/ultimate-stadium-nachos.png",
  reviewerImage: "/branding/example-scorecards/sample-reviewer.png",
  foodImageAlt:
    "Ultimate stadium nachos served in a baseball helmet at a ballpark",
  reviewerImageAlt: "Sample fan profile photo at a baseball game"
};

export const HOME_SCORECARD_TRUST_TAGLINE =
  "Verified at the venue. Scored by the crowd.";

export const HOME_SCORECARD_FEATURE_NOTES = [
  {
    title: "Verified at the venue",
    body: "Reviews are tied to live venue visits and event context."
  },
  {
    title: "Shareable scorecards",
    body: "Turn every food take into a Slop Scorecard built to post."
  },
  {
    title: "Badges and profiles",
    body: "Build your Slop profile as you score foods across venues."
  }
] as const;