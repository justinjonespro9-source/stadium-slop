import Link from "next/link";

import { WorldCupStadiumFoodGuide } from "@/components/world-cup-stadium-food-guide";
import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
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
  const liveCount = hosts.filter((h) => h.slug).length;

  return (
    <main className="media-page-shell min-h-screen" lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(worldCupGuideFaqJsonLd(content.locale))
        }}
      />

      <DiscoveryPageHero
        backHref="/"
        backLabel={content.nav.home}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        subtitle={content.hero.tagline}
        description={content.hero.description}
      >
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <Link href="/venues" className="media-pill text-[0.65rem]">
            {content.nav.findVenue}
          </Link>
          <span className="text-white/35" aria-hidden>
            ·
          </span>
          <span className="text-[0.7rem] text-white/65">
            {content.nav.languageSwitchPrefix}{" "}
            <Link
              href={content.alternatePath}
              hrefLang={content.alternateLocale}
              className="font-bold text-[var(--media-orange-bright)] hover:underline"
            >
              {content.alternateLanguageLabel}
            </Link>
          </span>
        </nav>
      </DiscoveryPageHero>

      <div className="media-discovery-content">
        <WorldCupStadiumFoodGuide content={content} hosts={hosts} liveCount={liveCount} />

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--media-ink-dim)] sm:text-sm">
          {content.disclaimer}{" "}
          <Link
            href="/disclaimer"
            className="font-bold text-[var(--media-orange-deep)] hover:text-[var(--media-orange)]"
          >
            {content.disclaimerLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
