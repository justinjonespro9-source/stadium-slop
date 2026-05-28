import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
import { ReviewerExternalLinks } from "@/components/reviewer-external-links";
import { VenueReviewerHistoryList } from "@/components/venue-reviewer-history-list";
import { getVenueReviewerHistory } from "@/lib/venue-reviewer-history";
import { SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

type VenueReviewerPageProps = {
  params: Promise<{
    venueSlug: string;
    reviewerId: string;
  }>;
};

export async function generateMetadata({
  params
}: VenueReviewerPageProps): Promise<Metadata> {
  const { venueSlug, reviewerId } = await params;
  const view = await getVenueReviewerHistory(venueSlug, reviewerId);

  if (!view) {
    return {
      title: "Reviewer history",
      description: SITE_TAGLINE_SHORT,
      robots: { index: false, follow: true }
    };
  }

  const title = `More from ${view.displayName} at ${view.venueName}`;

  return {
    title,
    description: `Venue-scoped food reviews by ${view.displayName} at ${view.venueName} on Stadium Slop.`,
    robots: { index: true, follow: true }
  };
}

export default async function VenueReviewerHistoryPage({
  params
}: VenueReviewerPageProps) {
  const { venueSlug, reviewerId } = await params;
  const view = await getVenueReviewerHistory(venueSlug, reviewerId);

  if (!view) {
    notFound();
  }

  const venueHref = `/venues/${view.venueSlug}`;

  return (
    <main className="media-page-shell min-h-screen">
      <DiscoveryPageHero
        backHref={venueHref}
        backLabel={view.venueName}
        eyebrow="Reviewer history"
        title={`More from ${view.displayName}`}
        description="This is not a follow profile — just this fan's food reviews at this venue."
      >
        <div className="flex items-start gap-3 rounded-xl border border-white/16 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-[var(--media-orange-bright)]/50 bg-[#0a1018]">
            {view.avatarUrl ? (
              <Image
                src={view.avatarUrl}
                alt=""
                fill
                className="object-cover object-center"
                sizes="48px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                {view.initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{view.displayName}</p>
            {view.handleDisplay ? (
              <p className="truncate text-xs font-bold text-white/65">{view.handleDisplay}</p>
            ) : null}
            <p className="mt-0.5 text-[0.7rem] text-white/55">
              {view.reviews.length} {view.reviews.length === 1 ? "review" : "reviews"} at this venue
            </p>
          </div>
        </div>
        {view.externalLinks.length > 0 ? (
          <div className="mt-2">
            <ReviewerExternalLinks links={view.externalLinks} />
          </div>
        ) : null}
      </DiscoveryPageHero>

      <div className="media-discovery-content max-w-3xl">
        <VenueReviewerHistoryList reviews={view.reviews} />
      </div>
    </main>
  );
}
