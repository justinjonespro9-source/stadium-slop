import Link from "next/link";
import type { Metadata } from "next";

import { WorldCupStadiumFoodGuide } from "@/components/world-cup-stadium-food-guide";
import {
  getPublicFoodItemsByVenueSlug,
  getPublicVenues
} from "@/lib/public-data";
import { getAbsoluteUrl } from "@/lib/site-metadata";
import {
  resolveWorldCupHostVenues,
  WORLD_CUP_GUIDE_DESCRIPTION,
  WORLD_CUP_GUIDE_PATH,
  WORLD_CUP_GUIDE_TITLE,
  WORLD_CUP_FAQ_ITEMS,
  WORLD_CUP_PLATFORM_DISCLAIMER
} from "@/lib/world-cup-stadium-food-guide";

/** Loads live venue and menu data from the database. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: WORLD_CUP_GUIDE_TITLE
  },
  description: WORLD_CUP_GUIDE_DESCRIPTION,
  keywords: [
    "2026 World Cup",
    "World Cup stadium food",
    "stadium food guide",
    "FIFA World Cup food",
    "host stadium food",
    "Stadium Slop"
  ],
  alternates: {
    canonical: getAbsoluteUrl(WORLD_CUP_GUIDE_PATH)
  },
  openGraph: {
    title: WORLD_CUP_GUIDE_TITLE,
    description: WORLD_CUP_GUIDE_DESCRIPTION,
    url: getAbsoluteUrl(WORLD_CUP_GUIDE_PATH),
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: WORLD_CUP_GUIDE_TITLE,
    description: WORLD_CUP_GUIDE_DESCRIPTION
  }
};

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: WORLD_CUP_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export default async function WorldCupStadiumFoodGuidePage() {
  const venues = await getPublicVenues();
  const hostsWithoutCounts = resolveWorldCupHostVenues(venues, {});
  const liveSlugs = [
    ...new Set(
      hostsWithoutCounts.map((h) => h.slug).filter((slug): slug is string => Boolean(slug))
    )
  ];

  const itemsByVenueSlug: Record<
    string,
    Awaited<ReturnType<typeof getPublicFoodItemsByVenueSlug>>
  > = {};

  await Promise.all(
    liveSlugs.map(async (slug) => {
      itemsByVenueSlug[slug] = await getPublicFoodItemsByVenueSlug(slug);
    })
  );

  const hosts = resolveWorldCupHostVenues(venues, itemsByVenueSlug);

  return (
    <main className="brand-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-10">
        <nav className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <Link
            href="/"
            className="text-[var(--slop-cream-dim)] transition hover:text-[var(--slop-gold-bright)]"
          >
            ← Home
          </Link>
          <span className="text-[var(--slop-line)]" aria-hidden>
            ·
          </span>
          <Link
            href="/venues"
            className="text-[var(--slop-cream-dim)] transition hover:text-[var(--slop-gold-bright)]"
          >
            Find a venue
          </Link>
        </nav>

        <header className="mt-5 border-b border-[var(--slop-line-strong)] pb-6 sm:mt-6 sm:pb-8">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Stadium Slop · Fan-powered stadium food
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-4xl">
            2026 World Cup Stadium Food Guide
          </h1>
          <p className="mt-2 text-lg font-bold text-[var(--slop-gold-bright)] sm:text-xl">
            Know Before You Bite
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--slop-cream-muted)] sm:text-base">
            Traveling for the 2026 World Cup? Stadium Slop helps fans discover what
            to eat inside each host venue, browse stadium food items, and help build
            fan-powered rankings with verified in-stadium reviews.
          </p>
        </header>

        <div className="mt-8 sm:mt-10">
          <WorldCupStadiumFoodGuide hosts={hosts} />
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--slop-cream-dim)] sm:text-sm">
          {WORLD_CUP_PLATFORM_DISCLAIMER}{" "}
          <Link href="/disclaimer" className="font-bold text-[var(--slop-gold-dim)] hover:text-[var(--slop-gold-bright)]">
            Read full disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
