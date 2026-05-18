import type {
  FoodReview,
  PriceCheckLabel,
  ReplayValueLabel,
  ReviewConsensusLabel
} from "@/lib/sample-data";

/** Client-safe slop stats types and display helpers (no DB / Prisma). */

export type SlopStatsMode = "allTime" | "season" | "gameDayFresh";

export type ConsensusStat = {
  label: ReviewConsensusLabel | ReplayValueLabel | PriceCheckLabel;
  count: number;
  percentage: number;
};

export type ItemSlopStats = {
  itemSlug: string;
  mode: SlopStatsMode;
  reviews: FoodReview[];
  averageSlopScore: number;
  averageNapkinRating: number;
  roundedNapkinRating: 1 | 2 | 3 | 4 | 5;
  reviewCount: number;
  helpfulLikesTotal: number;
  consensus: ConsensusStat[];
  replayValue: ConsensusStat[];
  priceCheck: ConsensusStat[];
  topConsensus?: ConsensusStat;
  topReplayValue?: ConsensusStat;
  topPriceCheck?: ConsensusStat;
  freshSignalScore?: number;
  hasFreshToday: boolean;
  freshReviewCountToday: number;
};

export function getSlopScoreTier(score: number) {
  if (score >= 9.5) return "Legend of the Game";
  if (score >= 9) return "Hall of Fame";
  if (score >= 8) return "All-Star";
  if (score >= 7) return "Starter Quality";
  if (score >= 5.5) return "Bench Depth";
  if (score >= 4.5) return "Needs a Rebuild";
  if (score >= 3.5) return "On the Trading Block";
  if (score >= 2.5) return "Sent to the Minors";
  return "First-Round Bust";
}
