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
