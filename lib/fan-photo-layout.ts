import type { FoodPhoto, FoodReview } from "@/lib/sample-data";

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

function reviewPhotoTimeMs(review: FoodReview): number {
  if (review.reviewPhotoCreatedAt) {
    const t = Date.parse(review.reviewPhotoCreatedAt);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

/** Sort photo-backed reviews: helpful likes desc, then newest fan photo. */
function sortPhotoBackedReviews(a: FoodReview, b: FoodReview): number {
  if (b.helpfulLikes !== a.helpfulLikes) {
    return b.helpfulLikes - a.helpfulLikes;
  }
  return reviewPhotoTimeMs(b) - reviewPhotoTimeMs(a);
}

/** One review per URL (prefer higher helpful, then newer photo). */
function uniquePhotoBackedReviews(reviews: FoodReview[]): FoodReview[] {
  const byUrl = new Map<string, FoodReview>();

  for (const r of reviews) {
    const url = r.photoUrl?.trim();
    if (!url) {
      continue;
    }

    const existing = byUrl.get(url);
    if (!existing) {
      byUrl.set(url, r);
      continue;
    }

    if (sortPhotoBackedReviews(r, existing) < 0) {
      byUrl.set(url, r);
    }
  }

  return Array.from(byUrl.values()).sort(sortPhotoBackedReviews);
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
    heroEntry = {
      url: top.photoUrl!,
      alt: top.photoAlt ?? `Fan-uploaded photo for ${foodName}`,
      review: top
    };
  }

  if (!heroEntry) {
    const verified = foodPhotos
      .filter((p) => p.imageUrl?.trim() && p.verifiedOnSite)
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = verified[0];
    if (first?.imageUrl) {
      heroEntry = { url: first.imageUrl, alt: first.alt, review: null };
    }
  }

  if (!heroEntry) {
    const standalone = foodPhotos
      .filter((p) => p.imageUrl?.trim() && !p.reviewId)
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = standalone[0];
    if (first?.imageUrl) {
      heroEntry = { url: first.imageUrl, alt: first.alt, review: null };
    }
  }

  if (!heroEntry) {
    const any = foodPhotos
      .filter((p) => p.imageUrl?.trim())
      .sort((a, b) => photoSortMs(b) - photoSortMs(a));
    const first = any[0];
    if (first?.imageUrl) {
      heroEntry = { url: first.imageUrl, alt: first.alt, review: null };
    }
  }

  const heroUrl = heroEntry?.url;
  const cardUrls = new Set(photoBacked.map((r) => r.photoUrl!).filter(Boolean));

  const additionalFanPhotos = foodPhotos
    .filter((p) => {
      const u = p.imageUrl?.trim();
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
      url: p.imageUrl!,
      alt: p.alt,
      review: null as FoodReview | null
    }));

  return {
    heroEntry,
    photoBackedReviews: photoBacked,
    additionalFanPhotos
  };
}
