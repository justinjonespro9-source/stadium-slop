import Image from "next/image";
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
};

function FeaturedItemMeta({ item }: { item: HomepageFeaturedItem }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.65rem] font-bold sm:mt-2">
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
  );
}

function FeaturedFoodThumb({ item }: { item: HomepageFeaturedItem }) {
  if (item.imageUrl) {
    return (
      <div className="media-feature-card__thumb relative min-h-[4.5rem] sm:min-h-0">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 639px) 88px, 320px"
          unoptimized={item.imageUrl.startsWith("http")}
        />
      </div>
    );
  }

  return (
    <div
      className="media-feature-card__thumb flex min-h-[4.5rem] items-center justify-center bg-gradient-to-br from-[#fff5ec] to-[#ffe8d4] sm:min-h-0"
      aria-hidden
    >
      <span className="text-2xl opacity-80">🍔</span>
    </div>
  );
}

function FeaturedItemCard({
  item,
  compactOnMobile = false
}: {
  item: HomepageFeaturedItem;
  compactOnMobile?: boolean;
}) {
  const href = `/venues/${item.venueSlug}/${item.foodSlug}`;

  if (compactOnMobile) {
    return (
      <Link href={href} className="media-feature-card sm:block sm:p-0">
        <FeaturedFoodThumb item={item} />
        <div className="media-feature-card__body">
          <p className="media-rank-card-title line-clamp-2 text-[0.9rem]">{item.name}</p>
          <p className="media-rank-card-meta line-clamp-1">{item.venueName}</p>
          <FeaturedItemMeta item={item} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="media-card block overflow-hidden p-0">
      <div className="relative aspect-[16/10] w-full bg-[var(--media-surface)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1023px) 50vw, 320px"
            unoptimized={item.imageUrl.startsWith("http")}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center bg-gradient-to-br from-[#fff5ec] to-[#ffe8d4]"
            aria-hidden
          >
            <span className="text-3xl opacity-80">🍔</span>
          </div>
        )}
      </div>
      <div className="p-3.5 sm:p-4">
        <p className="media-rank-card-title">{item.name}</p>
        <p className="media-rank-card-meta">{item.venueName}</p>
        <FeaturedItemMeta item={item} />
      </div>
    </Link>
  );
}

function FeaturedItemGrid({
  items,
  emptyMessage,
  compactOnMobile = false
}: {
  items: HomepageFeaturedItem[];
  emptyMessage: string;
  compactOnMobile?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm leading-relaxed text-[var(--media-ink-muted)]">{emptyMessage}</p>;
  }

  return (
    <ul
      className={
        compactOnMobile
          ? "mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
          : "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => (
        <li key={`${item.venueSlug}-${item.foodSlug}`}>
          <FeaturedItemCard item={item} compactOnMobile={compactOnMobile} />
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
  recentlyAdded
}: HomeFeaturedSectionsProps) {
  return (
    <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
      <section>
        <div className="media-section-heading">
          <div className="min-w-0">
            <p className="media-section-eyebrow">Top Slop</p>
            <h2 className="media-section-title">What fans are ranking highest</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
              Slop Score leaders and crowd favorites from verified fan reviews — the bites
              worth the walk before you hit the concession line.
            </p>
          </div>
          <Link href="/venues" className="media-section-link shrink-0">
            All venues →
          </Link>
        </div>
        <FeaturedItemGrid
          items={topSlop}
          compactOnMobile
          emptyMessage="Reviews are rolling in — check back as fans rank stadium food."
        />
      </section>

      <section className="media-panel-card border border-[var(--media-border)] p-5 sm:p-6">
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
    </div>
  );
}
