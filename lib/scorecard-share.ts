import { getAbsoluteUrl } from "@/lib/site-metadata";

export const SCORECARD_PATH_PREFIX = "/scorecards";

export function getScorecardPath(reviewId: string): string {
  const id = reviewId.trim();
  return `${SCORECARD_PATH_PREFIX}/${encodeURIComponent(id)}`;
}

export function getScorecardShareUrl(reviewId: string): string {
  return getAbsoluteUrl(getScorecardPath(reviewId));
}

export function getScorecardShareTitle(itemName: string, venueName: string): string {
  return `${itemName} · ${venueName} · Official Stadium Slop Scorecard`;
}

export function getScorecardShareDescription(
  itemName: string,
  venueName: string,
  slopScore?: number
): string {
  const scoreLine =
    slopScore != null && !Number.isNaN(slopScore)
      ? ` Slop Score ${slopScore.toFixed(1)}.`
      : "";
  return `Official fan scorecard for ${itemName} at ${venueName}.${scoreLine} View the full item ranking on Stadium Slop.`;
}
