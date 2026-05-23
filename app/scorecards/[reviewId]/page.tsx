import Link from "next/link";
import type { Metadata } from "next";

import { BrandBadgeIcon } from "@/components/brand-badge-icon";
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
import { getAbsoluteUrl } from "@/lib/site-metadata";

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
  return {
    title: `${view.itemName} · Official Slop Scorecard`,
    description: view.shareDescription,
    alternates: { canonical },
    openGraph: {
      title: view.shareTitle,
      description: view.shareDescription,
      url: canonical,
      type: "website",
      siteName: "Stadium Slop"
    },
    twitter: {
      card: "summary_large_image",
      title: view.shareTitle,
      description: view.shareDescription
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
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <Link
          href={view.itemPath}
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← {view.itemName} at {view.venueName}
        </Link>

        <header className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <BrandBadgeIcon size={22} title="Stadium Slop" />
            <span className="inline-flex rounded-full border border-[var(--slop-gold)]/45 bg-[color:rgba(244,179,33,0.1)] px-2.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-bright)]">
              Official Stadium Slop Scorecard
            </span>
          </div>
          <h1 className="brand-headline max-w-3xl text-2xl leading-tight text-[var(--slop-cream)] sm:text-3xl">
            {view.itemName}
          </h1>
          <p className="text-sm text-[var(--slop-cream-muted)]">{view.venueName}</p>
          <p className="max-w-2xl text-xs leading-snug text-[var(--slop-cream-dim)]">
            Fan-powered scorecard on Stadium Slop — view the full item ranking for
            standings, Fresh signals, and more Slop Scorecards.
          </p>
        </header>

        <div className="mt-6 flex justify-center">
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

        <div className="mx-auto mt-6 max-w-md space-y-3">
          <ScorecardShareActions
            shareUrl={shareUrl}
            shareTitle={view.shareTitle}
            shareDescription={view.shareDescription}
          />
          <Link
            href={view.itemPath}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/40 hover:text-[var(--slop-cream)]"
          >
            View full item ranking
          </Link>
        </div>
      </section>
    </main>
  );
}
