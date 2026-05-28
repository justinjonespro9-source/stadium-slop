import Link from "next/link";

import { AdSlot } from "@/components/ads/ad-slot";
import { WorldCupStadiumFoodGuide } from "@/components/world-cup-stadium-food-guide";
import type { WorldCupGuideContent } from "@/lib/world-cup-stadium-food-guide-content";
import { worldCupGuideFaqJsonLd } from "@/lib/world-cup-stadium-food-guide-content";
import type { ResolvedWorldCupHostVenue } from "@/lib/world-cup-stadium-food-guide";

type WorldCupStadiumFoodGuideShellProps = {
  content: WorldCupGuideContent;
  hosts: ResolvedWorldCupHostVenue[];
};

export function WorldCupStadiumFoodGuideShell({
  content,
  hosts
}: WorldCupStadiumFoodGuideShellProps) {
  return (
    <main className="brand-page min-h-screen" lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(worldCupGuideFaqJsonLd(content.locale))
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-10">
        <nav className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <Link
            href="/"
            className="text-[var(--slop-cream-dim)] transition hover:text-[var(--slop-gold-bright)]"
          >
            {content.nav.home}
          </Link>
          <span className="text-[var(--slop-line)]" aria-hidden>
            ·
          </span>
          <Link
            href="/venues"
            className="text-[var(--slop-cream-dim)] transition hover:text-[var(--slop-gold-bright)]"
          >
            {content.nav.findVenue}
          </Link>
          <span className="text-[var(--slop-line)]" aria-hidden>
            ·
          </span>
          <span className="text-[var(--slop-cream-dim)]">
            {content.nav.languageSwitchPrefix}{" "}
            <Link
              href={content.alternatePath}
              hrefLang={content.alternateLocale}
              className="text-[var(--slop-gold-dim)] transition hover:text-[var(--slop-gold-bright)]"
            >
              {content.alternateLanguageLabel}
            </Link>
          </span>
        </nav>

        <header className="mt-5 border-b border-[var(--slop-line-strong)] pb-6 sm:mt-6 sm:pb-8">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            {content.hero.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-4xl">
            {content.hero.title}
          </h1>
          <p className="mt-2 text-lg font-bold text-[var(--slop-gold-bright)] sm:text-xl">
            {content.hero.tagline}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--slop-cream-muted)] sm:text-base">
            {content.hero.description}
          </p>
        </header>

        <AdSlot
          placementKey="worldcup.guide.banner"
          variant="banner"
          className="mt-6 sm:mt-8"
        />

        <div className="mt-8 sm:mt-10">
          <WorldCupStadiumFoodGuide content={content} hosts={hosts} />
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--slop-cream-dim)] sm:text-sm">
          {content.disclaimer}{" "}
          <Link
            href="/disclaimer"
            className="font-bold text-[var(--slop-gold-dim)] hover:text-[var(--slop-gold-bright)]"
          >
            {content.disclaimerLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
