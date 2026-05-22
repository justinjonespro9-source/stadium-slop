/** Session key for post-review Slop Card share module (client-only). */
export function reviewCelebrationStorageKey(itemPath: string): string {
  return `stadium-slop:review-celebration:${itemPath}`;
}

/** Item page URL that keeps the celebration banner visible. */
export function itemPathWithReviewCelebration(
  itemPath: string,
  photoErrorCode?: string | null
): string {
  const params = new URLSearchParams();
  params.set("reviewSubmitted", "true");
  if (photoErrorCode?.trim()) {
    params.set("photoError", photoErrorCode.trim());
  }
  return `${itemPath}?${params.toString()}`;
}

export const FAN_PHOTO_REVIEWS_SECTION_ID = "fan-photo-reviews";

/** Item page URL after helpful vote — keeps user on the scorecard carousel. */
export function itemPathWithHelpfulStatus(
  itemPath: string,
  status: "marked" | "own"
): string {
  return `${itemPath}?helpful=${status}#${FAN_PHOTO_REVIEWS_SECTION_ID}`;
}
