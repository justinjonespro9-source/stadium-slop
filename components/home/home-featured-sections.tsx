import Link from "next/link";
import type { ReactNode } from "react";

import type { HomepageFeaturedItem } from "@/lib/homepage-data";
import {
  WORLD_CUP_GUIDE_PATH_EN,
  WORLD_CUP_GUIDE_PATH_ES
} from "@/lib/world-cup-stadium-food-guide-content";

type HomeFeaturedSectionsProps = {
  topSlop: HomepageFeaturedItem[];
  recentlyAdded: HomepageFeaturedItem[];
  fanFavorites: HomepageFeaturedItem[];
};

function FeaturedItemGrid({
  items,
  emptyMessage
}: {
  items: HomepageFeaturedItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm leading-relaxed text-[var(--media-ink-muted)]">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={`${item.venueSlug}-${item.foodSlug}`}>
          <Link href={`/venues/${item.venueSlug}/${item.foodSlug}`} className="media-card">
            <p className="media-rank-card-title">{item.name}</p>
            <p className="media-rank-card-meta">{item.venueName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] font-bold">
              {item.slopScore != null ? (
                <span className="media-rank-score">Slop {item.slopScore.toFixed(1)}</span>
              ) : null}
              {item.reviewCount > 0 ? (
                <span className="text-[var(--media-ink-dim)]">
                  {item.reviewCount} review{item.reviewCount === 1 ? "" : "s"}
                </span>
              ) : null}
              {item.badge ? (
                <span className="rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-2 py-0.5 uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                  {item.badge}
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SectionShell({
  eyebrow,
  title,
  href,
  linkLabel,
  children
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="media-section-heading">
        <div>
          <p className="media-section-eyebrow">{eyebrow}</p>
          <h2 className="media-section-title">{title}</h2>
        </div>
        {href && linkLabel ? (
          <Link href={href} className="media-section-link">
            {linkLabel} →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function HomeFeaturedSections({
  topSlop,
  recentlyAdded,
  fanFavorites
}: HomeFeaturedSectionsProps) {
  return (
    <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
      <SectionShell eyebrow="Fan rankings" title="Top Slop" href="/venues" linkLabel="All venues">
        <FeaturedItemGrid
          items={topSlop}
          emptyMessage="Reviews are rolling in — check back as fans rank stadium food."
        />
      </SectionShell>

      <section className="media-panel-card media-panel-card--accent p-5 sm:p-6">
        <p className="media-section-eyebrow">2026 World Cup</p>
        <h2 className="media-section-title">Know Before You Bite</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)]">
          Browse food at every host stadium and help fans rank what&apos;s worth trying before
          kickoff.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={WORLD_CUP_GUIDE_PATH_EN} className="media-primary-button">
            World Cup Food Guide
          </Link>
          <Link href={WORLD_CUP_GUIDE_PATH_ES} hrefLang="es" className="media-cta-outline">
            Ver guía en español
          </Link>
        </div>
      </section>

      <SectionShell eyebrow="New on the board" title="Recently Added" href="/venues" linkLabel="Browse">
        <FeaturedItemGrid
          items={recentlyAdded}
          emptyMessage="Menu items appear here as stadiums are imported and fans suggest new bites."
        />
      </SectionShell>

      <SectionShell eyebrow="Crowd picks" title="Fan Favorites" href="/venues" linkLabel="Explore">
        <FeaturedItemGrid
          items={fanFavorites}
          emptyMessage="Fan favorites surface as reviews and promoted picks stack up."
        />
      </SectionShell>
    </div>
  );
}
