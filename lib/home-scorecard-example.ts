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
  napkinRating: string;
  replayValue: string;
  priceCheck: string;
  messSignal: string;
  hotTake: string;
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
  itemName: "Loaded Stadium Nachos",
  venueContext: "Sample stadium concession",
  locationHint: "Section 112 · Concourse level",
  slopScore: 8.4,
  photoEmoji: "🧀",
  reviewerName: "Sample Fan",
  reviewerInitials: "SF",
  napkinRating: "3 · Two-Handed Problem",
  replayValue: "Solid Rotation Pick",
  priceCheck: "Worth the Price of Admission",
  messSignal: "Jersey Danger",
  hotTake: "Cheese pull for days. Worth the walk if you split it.",
  // foodImage: "/branding/example-scorecards/sample-food.jpg",
  // reviewerImage: "/branding/example-scorecards/sample-reviewer.jpg",
  foodImageAlt: "Sample food photo for the example scorecard",
  reviewerImageAlt: "Sample reviewer photo for the example scorecard"
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
