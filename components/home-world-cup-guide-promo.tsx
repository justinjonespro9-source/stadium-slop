import Link from "next/link";

import {
  WORLD_CUP_GUIDE_PATH_EN,
  WORLD_CUP_GUIDE_PATH_ES
} from "@/lib/world-cup-stadium-food-guide-content";

export function HomeWorldCupGuidePromo() {
  return (
    <section
      aria-labelledby="home-wc-guide-heading"
      className="mx-auto mt-5 w-full max-w-2xl sm:mt-6"
    >
      <div className="brand-panel rounded-2xl border border-[var(--slop-gold)]/35 bg-[color:rgba(244,179,33,0.07)] p-4 shadow-lg sm:rounded-[1.35rem] sm:p-5">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
          2026 World Cup
        </p>
        <h2
          id="home-wc-guide-heading"
          className="mt-1.5 text-lg font-black leading-tight text-[var(--slop-cream)] sm:text-xl"
        >
          Know Before You Bite
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
          Browse food at every 2026 World Cup host stadium and help fans rank what&apos;s
          worth trying.
        </p>
        <div className="mt-4 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={WORLD_CUP_GUIDE_PATH_EN}
            className="brand-cta inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-black"
          >
            Explore the World Cup Food Guide
          </Link>
          <Link
            href={WORLD_CUP_GUIDE_PATH_ES}
            hrefLang="es"
            className="text-center text-xs font-bold text-[var(--slop-gold-dim)] transition hover:text-[var(--slop-gold-bright)] sm:text-left"
          >
            Ver guía en español
          </Link>
        </div>
      </div>
    </section>
  );
}
