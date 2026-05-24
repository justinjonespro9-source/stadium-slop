import type { ReviewHistoryVisibility } from "@prisma/client";

export type { ReviewHistoryVisibility };

export const REVIEW_HISTORY_VISIBILITY_OPTIONS: {
  value: ReviewHistoryVisibility;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: "HIGHLIGHTS_ONLY",
    label: "Highlights only",
    description:
      "Slop Cards stay on the items you reviewed. No browsable fan archive beyond what appears on each card.",
    recommended: true
  },
  {
    value: "VENUE_CONTEXT_ONLY",
    label: "Venue context only",
    description:
      "Fans can tap your name on a Slop Scorecard to see more of your reviews at that venue — not a global archive."
  },
  {
    value: "PUBLIC",
    label: "Public review history",
    description:
      "Your full Slop review history is browsable. Still no followers, feeds, or in-app messaging."
  },
  {
    value: "PRIVATE",
    label: "Private review history",
    description:
      "Hide extended history browsing. Individual reviews still appear on the food items and venues you rated."
  }
];

export function parseReviewHistoryVisibility(
  raw: string
): ReviewHistoryVisibility | null {
  const value = raw.trim().toUpperCase();
  if (
    value === "HIGHLIGHTS_ONLY" ||
    value === "VENUE_CONTEXT_ONLY" ||
    value === "PUBLIC" ||
    value === "PRIVATE"
  ) {
    return value;
  }
  return null;
}

export function reviewHistoryVisibilityLabel(
  visibility: ReviewHistoryVisibility
): string {
  return (
    REVIEW_HISTORY_VISIBILITY_OPTIONS.find((o) => o.value === visibility)
      ?.label ?? visibility
  );
}

/** Global cross-venue reviewer archive — only when user opts in. */
export function allowsGlobalReviewerHistory(
  visibility: ReviewHistoryVisibility
): boolean {
  return visibility === "PUBLIC";
}

/** Venue-scoped “more from this fan” browsing (same venue only). */
export function allowsVenueContextHistory(
  visibility: ReviewHistoryVisibility
): boolean {
  return visibility === "VENUE_CONTEXT_ONLY" || visibility === "PUBLIC";
}
