"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ReportContentLink } from "@/components/report-content-link";
import { ReviewSlopCard } from "@/components/review-slop-card";
import { ScorecardShareActions } from "@/components/scorecard-share-actions";
import { SlopScorecardCarousel } from "@/components/slop-scorecard-carousel";
import { SlopScorecardHelpfulThumb } from "@/components/slop-scorecard-helpful-thumb";
import { SlopScorecardSortBar } from "@/components/slop-scorecard-sort-bar";
import type { ReportContentContext } from "@/lib/report-content";
import {
  DEFAULT_SCORECARD_SORT,
  getScorecardSortOptions,
  sortScorecardReviews,
  type ScorecardSortMode
} from "@/lib/scorecard-sort-client";
import { formatSlopCardMetaRow } from "@/lib/slop-card-display";
import type { FoodReview } from "@/lib/sample-data";
import {
  getScorecardShareDescription,
  getScorecardShareTitle,
  getScorecardShareUrl
} from "@/lib/scorecard-share";
import { normalizePublicImageUrl } from "@/lib/image-url";

type FoodItemScorecardDeckProps = {
  reviews: FoodReview[];
  venueSlug: string;
  foodSlug: string;
  foodName: string;
  venueName: string;
  napkinEligible: boolean;
  slopCardLocation: string;
  contributorUserId: string | null;
  likedReviewIds: string[];
  photoPlaceholderDefault?: string;
  isSignedIn: boolean;
  itemPageWithReviewsAnchor: string;
  baseReportContext: Omit<ReportContentContext, "reviewId" | "photoUrl">;
  markReviewHelpful: (formData: FormData) => Promise<void>;
};

export function FoodItemScorecardDeck({
  reviews,
  venueSlug,
  foodSlug,
  foodName,
  venueName,
  napkinEligible,
  slopCardLocation,
  contributorUserId,
  likedReviewIds,
  photoPlaceholderDefault,
  isSignedIn,
  itemPageWithReviewsAnchor,
  baseReportContext,
  markReviewHelpful
}: FoodItemScorecardDeckProps) {
  const sortOptions = useMemo(() => getScorecardSortOptions(reviews), [reviews]);
  const [sort, setSort] = useState<ScorecardSortMode>(DEFAULT_SCORECARD_SORT);

  const sortedReviews = useMemo(
    () => sortScorecardReviews(reviews, sort, { venueSlug }),
    [reviews, sort, venueSlug]
  );

  const likedSet = useMemo(() => new Set(likedReviewIds), [likedReviewIds]);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <>
      <SlopScorecardSortBar
        sort={sort}
        options={sortOptions}
        onSortChange={setSort}
      />
      <SlopScorecardCarousel swipeHint={sortedReviews.length > 1}>
        {sortedReviews.map((review, cardIndex) => {
          const photoUrlNorm = normalizePublicImageUrl(review.photoUrl);
          const metaLine = formatSlopCardMetaRow({
            locationLine: slopCardLocation,
            verifiedGameDay: review.verifiedGameDay,
            dateLabel: review.dateLabel
          });

          const isOwnScorecard =
            Boolean(contributorUserId) && review.reviewerId === contributorUserId;

          const backHelpfulSlot = isOwnScorecard ? (
            <button
              type="button"
              disabled
              className="slop-scorecard-btn-pill slop-scorecard-btn-pill--muted cursor-not-allowed"
              title="You can't mark your own Slop Scorecard helpful"
            >
              Yours
            </button>
          ) : isSignedIn ? (
            likedSet.has(review.id) ? (
              <button
                type="button"
                disabled
                className="slop-scorecard-btn-pill slop-scorecard-btn-pill--marked cursor-not-allowed"
              >
                Marked
              </button>
            ) : (
              <form action={markReviewHelpful} className="inline-flex">
                <input type="hidden" name="venueSlug" value={venueSlug} />
                <input type="hidden" name="foodSlug" value={foodSlug} />
                <input type="hidden" name="reviewId" value={review.id} />
                <button type="submit" className="slop-scorecard-btn-pill">
                  Helpful
                </button>
              </form>
            )
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(itemPageWithReviewsAnchor)}`}
              className="slop-scorecard-btn-pill"
            >
              Sign in
            </Link>
          );

          const frontHelpfulSlot = isOwnScorecard ? (
            <button
              type="button"
              disabled
              className="slop-scorecard-helpful-icon slop-scorecard-helpful-icon--muted"
              title="You can't mark your own Slop Scorecard helpful"
              aria-label="Your scorecard"
            >
              <SlopScorecardHelpfulThumb />
            </button>
          ) : isSignedIn ? (
            likedSet.has(review.id) ? (
              <button
                type="button"
                disabled
                className="slop-scorecard-helpful-icon slop-scorecard-helpful-icon--marked"
                aria-label="Already marked helpful"
              >
                <SlopScorecardHelpfulThumb filled />
              </button>
            ) : (
              <form action={markReviewHelpful} className="inline-flex">
                <input type="hidden" name="venueSlug" value={venueSlug} />
                <input type="hidden" name="foodSlug" value={foodSlug} />
                <input type="hidden" name="reviewId" value={review.id} />
                <button
                  type="submit"
                  className="slop-scorecard-helpful-icon"
                  aria-label="Mark helpful"
                >
                  <SlopScorecardHelpfulThumb />
                </button>
              </form>
            )
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(itemPageWithReviewsAnchor)}`}
              className="slop-scorecard-helpful-icon"
              aria-label="Sign in to mark helpful"
            >
              <SlopScorecardHelpfulThumb />
            </Link>
          );

          const reportSlot = (
            <ReportContentLink
              context={{
                ...baseReportContext,
                reviewId: review.id,
                photoUrl: photoUrlNorm ?? undefined
              }}
              variant="card"
            />
          );

          const shareSlot = (
            <ScorecardShareActions
              shareUrl={getScorecardShareUrl(review.id)}
              shareTitle={getScorecardShareTitle(foodName, venueName)}
              shareDescription={getScorecardShareDescription(
                foodName,
                venueName,
                review.slopScore
              )}
              variant="compact"
            />
          );

          return (
            <ReviewSlopCard
              key={review.id}
              cardIndex={cardIndex}
              review={review}
              itemName={foodName}
              venueName={venueName}
              metaLine={metaLine}
              photoUrl={photoUrlNorm}
              photoAlt={review.photoAlt ?? `Fan photo for ${foodName}`}
              photoPlaceholderEmoji={
                review.photoPlaceholder ?? photoPlaceholderDefault
              }
              napkinEligible={napkinEligible}
              frontHelpfulSlot={frontHelpfulSlot}
              backHelpfulSlot={backHelpfulSlot}
              shareSlot={shareSlot}
              reportSlot={reportSlot}
            />
          );
        })}
      </SlopScorecardCarousel>
    </>
  );
}
