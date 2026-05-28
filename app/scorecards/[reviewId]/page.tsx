import Link from "next/link";
import type { Metadata } from "next";

import { BrandBadgeIcon } from "@/components/brand-badge-icon";
import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
import { ReportContentLink } from "@/components/report-content-link";
import { ReviewSlopCard } from "@/components/review-slop-card";
import { ScorecardShareActions } from "@/components/scorecard-share-actions";
import {
  getPublicScorecardByReviewId,
  requirePublicScorecard
} from "@/lib/public-scorecard";
import {
  getScorecardPath,
  getScorecardShareUrl
} from "@/lib/scorecard-share";
import { getAbsoluteUrl, OG_CARD } from "@/lib/site-metadata";

type PublicScorecardPageProps = {
  params: Promise<{ reviewId: string }>;
};

export async function generateMetadata({
  params
}: PublicScorecardPageProps): Promise<Metadata> {
  const { reviewId } = await params;
  const view = await getPublicScorecardByReviewId(reviewId);
  if (!view) {
    return { title: "Scorecard not found" };
  }

  const canonical = getScorecardShareUrl(reviewId);
  const ogImagePath = `${getScorecardPath(reviewId)}/opengraph-image`;
  const ogImageUrl = getAbsoluteUrl(ogImagePath);
  const ogImageAlt = `${view.itemName} · Official Stadium Slop Scorecard`;

  return {
    title: `${view.itemName} · Official Slop Scorecard`,
    description: view.shareDescription,
    alternates: { canonical },
    openGraph: {
      title: view.shareTitle,
      description: view.shareDescription,
      url: canonical,
      type: "website",
      siteName: "Stadium Slop",
      images: [
        {
          url: ogImageUrl,
          width: OG_CARD.width,
          height: OG_CARD.height,
          alt: ogImageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: view.shareTitle,
      description: view.shareDescription,
      images: [ogImageUrl]
    }
  };
}

export default async function PublicScorecardPage({ params }: PublicScorecardPageProps) {
  const { reviewId } = await params;
  const view = await requirePublicScorecard(reviewId);
  const shareUrl = getScorecardShareUrl(view.review.id);

  const readOnlyHelpful = (
    <span
      className="slop-scorecard-btn-pill slop-scorecard-btn-pill--muted cursor-default"
      aria-label={`${view.review.helpfulLikes} helpful likes`}
    >
      {view.review.helpfulLikes} helpful
    </span>
  );

  const reportSlot = (
    <ReportContentLink
      context={{
        venueName: view.venueName,
        venueSlug: view.venueSlug,
        itemName: view.itemName,
        itemSlug: view.foodSlug,
        pagePath: getScorecardPath(reviewId),
        reviewId: view.review.id,
        photoUrl: view.photoUrl
      }}
      variant="card"
    />
  );

  const shareSlot = (
    <ScorecardShareActions
      shareUrl={shareUrl}
      shareTitle={view.shareTitle}
      shareDescription={view.shareDescription}
      variant="compact"
    />
  );

  return (
    <main className="media-page-shell min-h-screen">
      <DiscoveryPageHero
        backHref={view.itemPath}
        backLabel={`${view.itemName} at ${view.venueName}`}
        eyebrow="Official scorecard"
        title={view.itemName}
        subtitle={view.venueName}
        description="Fan-powered scorecard on Stadium Slop — view the full item page for standings, Fresh signals, and more Slop Scorecards."
      >
        <div className="flex flex-wrap items-center gap-2">
          <BrandBadgeIcon size={22} title="Stadium Slop" />
          <span className="media-item-hero-badge media-item-hero-badge--accent">
            Official Slop Scorecard
          </span>
        </div>
      </DiscoveryPageHero>

      <div className="media-discovery-content">
        <div className="media-panel-card flex justify-center p-4 sm:p-6">
          <ReviewSlopCard
            cardIndex={0}
            review={view.review}
            itemName={view.itemName}
            venueName={view.venueName}
            metaLine={view.metaLine}
            photoUrl={view.photoUrl}
            photoAlt={view.photoAlt}
            photoPlaceholderEmoji={view.photoPlaceholderEmoji}
            napkinEligible={view.napkinEligible}
            frontHelpfulSlot={readOnlyHelpful}
            backHelpfulSlot={readOnlyHelpful}
            shareSlot={shareSlot}
            reportSlot={reportSlot}
          />
        </div>

        <div className="mx-auto mt-5 max-w-md space-y-3">
          <ScorecardShareActions
            shareUrl={shareUrl}
            shareTitle={view.shareTitle}
            shareDescription={view.shareDescription}
          />
          <Link href={view.itemPath} className="media-primary-button w-full justify-center py-3 text-sm">
            View full item ranking
          </Link>
        </div>
      </div>
    </main>
  );
}
