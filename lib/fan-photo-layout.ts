import type { FoodPhoto, FoodReview } from "@/lib/sample-data";
import { compareFreshest } from "@/lib/scorecard-carousel-sort";
import { normalizePublicImageUrl } from "@/lib/image-url";

export type FanPhotoHeroEntry = {
  url: string;
  alt: string;
  review: FoodReview | null;
};

export type FanPhotoStripEntry = {
  url: string;
  alt: string;
  review: FoodReview | null;
};

/** When deduping the same fan photo, keep the review that sorts fresher. */
function compareDedupeWinner(a: FoodReview, b: FoodReview): number {
  const venueSlug = a.venueSlug || b.venueSlug;
  return compareFreshest(a, b, venueSlug);
}

/** Stable key for carousel dedupe — real URL or placeholder-backed fan photo. */
export function scorecardCarouselPhotoKey(review: FoodReview): string | null {
  const url = normalizePublicImageUrl(review.photoUrl);
  if (url) {
    return url;
  }
  const placeholder = review.photoPlaceholder?.trim();
  if (placeholder) {
    return `placeholder:${review.id}`;
  }
  return null;
}

export function reviewHasScorecardVisual(review: FoodReview): boolean {
  return scorecardCarouselPhotoKey(review) != null;
}

/** One review per visual key (prefer fresher take when deduping). */
function uniquePhotoBackedReviews(reviews: FoodReview[]): FoodReview[] {
  const byUrl = new Map<string, FoodReview>();

  for (const r of reviews) {
    const key = scorecardCarouselPhotoKey(r);
    if (!key) {
      continue;
    }

    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, r);
      continue;
    }

    if (compareDedupeWinner(r, existing) < 0) {
      byUrl.set(key, r);
    }
  }

  const venueSlug = reviews[0]?.venueSlug ?? "";
  return Array.from(byUrl.values()).sort((a, b) =>
    compareFreshest(a, b, venueSlug)
  );
}

function photoSortMs(p: FoodPhoto): number {
  return p.sortTimestamp ?? 0;
}

/**
 * Hero: (A–B) best photo-backed review by helpful then recency;
 * (C) newest verified on-site photo; (D) newest standalone item photo;
 * (E) any remaining uploaded photo; else null (placeholder in UI).
 */
export function buildItemFanPhotoLayout(
  reviews: FoodReview[],
  foodPhotos: FoodPhoto[],
  foodName: string
): {
  heroEntry: FanPhotoHeroEntry | null;
  photoBackedReviews: FoodReview[];
  additionalFanPhotos: FanPhotoStripEntry[];
} {
  const photoBacked = uniquePhotoBackedReviews(reviews);

  let heroEntry: FanPhotoHeroEntry | null = null;

  if (photoBacked.length > 0) {
    const top = photoBacked[0];
    const heroUrl = normalizePublicImageUrl(top.photoUrl);
    if (heroUrl) {
      heroEntry = {
        url: heroUrl,
        alt: top.photoAlt ?? `Fan-uploaded photo for ${foodName}`,
        review: top
      };
    }
  }

  if (!heroEntry) {
    const verified = foodPhotos
      .filter((p) => normalizePublicImageUrl(p.imageUrl) && p.verifiedOnSite)
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = verified[0];
    const u = normalizePublicImageUrl(first?.imageUrl);
    if (first && u) {
      heroEntry = { url: u, alt: first.alt, review: null };
    }
  }

  if (!heroEntry) {
    const standalone = foodPhotos
      .filter((p) => normalizePublicImageUrl(p.imageUrl) && !p.reviewId)
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = standalone[0];
    const u = normalizePublicImageUrl(first?.imageUrl);
    if (first && u) {
      heroEntry = { url: u, alt: first.alt, review: null };
    }
  }

  if (!heroEntry) {
    const any = foodPhotos
      .filter((p) => normalizePublicImageUrl(p.imageUrl))
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = any[0];
    const u = normalizePublicImageUrl(first?.imageUrl);
    if (first && u) {
      heroEntry = { url: u, alt: first.alt, review: null };
    }
  }

  const heroUrl = heroEntry?.url;
  const cardUrls = new Set(
    photoBacked
      .map((r) => normalizePublicImageUrl(r.photoUrl))
      .filter((u): u is string => Boolean(u))
  );

  const additionalFanPhotos = foodPhotos
    .filter((p) => {
      const u = normalizePublicImageUrl(p.imageUrl);
      if (!u) {
        return false;
      }
      if (u === heroUrl) {
        return false;
      }
      if (cardUrls.has(u)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => photoSortMs(b) - photoSortMs(a))
    .map((p) => ({
      url: normalizePublicImageUrl(p.imageUrl)!,
      alt: p.alt,
      review: null as FoodReview | null
    }));

  return {
    heroEntry,
    photoBackedReviews: photoBacked,
    additionalFanPhotos
  };
}
