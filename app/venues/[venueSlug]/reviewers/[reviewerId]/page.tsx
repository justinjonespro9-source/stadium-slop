import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  const pageTitle = `More from ${view.displayName} at ${view.venueName}`;

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <Link
          href={`/venues/${view.venueSlug}`}
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← {view.venueName}
        </Link>

        <header className="mt-4 space-y-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Venue-scoped reviewer history
          </p>
          <h1 className="brand-headline text-2xl leading-tight text-[var(--slop-cream)] sm:text-3xl">
            {pageTitle}
          </h1>
          <p className="text-sm leading-snug text-[var(--slop-cream-muted)]">
            This is not a follow profile — just this fan&apos;s food reviews at this
            venue.
          </p>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-4 py-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-[var(--slop-gold)]/45 bg-[var(--slop-navy-deep)]">
              {view.avatarUrl ? (
                <Image
                  src={view.avatarUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="56px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-black text-[var(--slop-cream)]">
                  {view.initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-[var(--slop-cream)]">
                {view.displayName}
              </p>
              {view.handleDisplay ? (
                <p className="truncate text-xs font-bold text-[var(--slop-cream-dim)]">
                  {view.handleDisplay}
                </p>
              ) : null}
              <p className="mt-1 text-[0.65rem] text-[var(--slop-cream-dim)]">
                {view.reviews.length}{" "}
                {view.reviews.length === 1 ? "review" : "reviews"} at this venue
              </p>
            </div>
          </div>

          {view.externalLinks.length > 0 ? (
            <ReviewerExternalLinks links={view.externalLinks} />
          ) : null}
        </header>

        <div className="mt-6">
          <VenueReviewerHistoryList reviews={view.reviews} />
        </div>
      </section>
    </main>
  );
}
