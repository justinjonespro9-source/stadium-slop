"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ReviewSlopCard } from "@/components/review-slop-card";
import { ScorecardShareActions } from "@/components/scorecard-share-actions";
import { SlopScorecardCarousel } from "@/components/slop-scorecard-carousel";
import { formatSlopCardMetaRow } from "@/lib/slop-card-display";
import {
  getScorecardShareDescription,
  getScorecardShareTitle,
  getScorecardShareUrl
} from "@/lib/scorecard-share";
import { normalizePublicImageUrl } from "@/lib/image-url";
import type { VenueFreshReview } from "@/lib/venue-fresh-feed";

type VenueFreshFeedProps = {
  reviews: VenueFreshReview[];
  venueSlug: string;
  venueName: string;
};

export function VenueFreshFeed({
  reviews,
  venueSlug,
  venueName
}: VenueFreshFeedProps) {
  const cards = useMemo(() => reviews, [reviews]);

  if (cards.length === 0) return null;

  return (
    <section className="mt-4 sm:mt-5">
      <div className="mb-2">
        <h2 className="text-base font-black tracking-tight text-[var(--slop-cream)] sm:text-lg">
          Fresh at {venueName}
        </h2>
        <p className="mt-0.5 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
          Fresh fan scorecards from around the stadium.
        </p>
      </div>

      <SlopScorecardCarousel swipeHint={cards.length > 1}>
        {cards.map((review, cardIndex) => {
          const photoUrlNorm = normalizePublicImageUrl(review.photoUrl);
          const metaLine = formatSlopCardMetaRow({
            verifiedGameDay: review.verifiedGameDay,
            dateLabel: review.dateLabel
          });

          const itemLink = (
            <Link
              href={`/venues/${venueSlug}/${review.foodItemSlug}`}
              className="slop-scorecard-btn-pill"
              onClick={(e) => e.stopPropagation()}
            >
              View item
            </Link>
          );

          const shareSlot = (
            <ScorecardShareActions
              shareUrl={getScorecardShareUrl(review.id)}
              shareTitle={getScorecardShareTitle(review.foodItemName, venueName)}
              shareDescription={getScorecardShareDescription(
                review.foodItemName,
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
              itemName={review.foodItemName}
              venueName={venueName}
              metaLine={metaLine}
              photoUrl={photoUrlNorm}
              photoAlt={review.photoAlt ?? `Fan photo for ${review.foodItemName}`}
              photoPlaceholderEmoji={review.photoPlaceholder}
              napkinEligible={review.napkinRating != null}
              frontHelpfulSlot={itemLink}
              backHelpfulSlot={
                <Link
                  href={`/venues/${venueSlug}/${review.foodItemSlug}`}
                  className="slop-scorecard-btn-pill"
                >
                  View full item page →
                </Link>
              }
              shareSlot={shareSlot}
              reportSlot={null}
            />
          );
        })}
      </SlopScorecardCarousel>
    </section>
  );
}
