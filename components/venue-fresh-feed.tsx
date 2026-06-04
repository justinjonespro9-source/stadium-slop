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
import type { VenueShareContext } from "@/lib/venue-partner";
import type { VenueFreshReview } from "@/lib/venue-fresh-feed";
import { getFoodPhotoAlt, getVenueFreshFeedSubcopy } from "@/lib/venue-copy-context";

type VenueFreshFeedProps = {
  reviews: VenueFreshReview[];
  venueSlug: string;
  venueName: string;
  shareContext?: VenueShareContext;
};

export function VenueFreshFeed({
  reviews,
  venueSlug,
  venueName,
  shareContext
}: VenueFreshFeedProps) {
  const cards = useMemo(() => reviews, [reviews]);

  if (cards.length === 0) return null;

  return (
    <section className="mt-5 sm:mt-6">
      <div className="media-section-heading mb-3">
        <div>
          <p className="media-section-eyebrow">Fresh feed</p>
          <h2 className="media-section-title">Fresh at {venueName}</h2>
        </div>
      </div>
      <p className="mb-3 text-[0.75rem] leading-snug text-[var(--media-ink-muted)] sm:text-xs">
        Fresh fan scorecards from around the stadium.
      </p>

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
                review.slopScore,
                shareContext
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
              photoAlt={review.photoAlt ?? getFoodPhotoAlt(venueSlug, review.foodItemName)}
              venueSlug={venueSlug}
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
