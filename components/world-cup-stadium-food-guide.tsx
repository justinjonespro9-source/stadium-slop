import Link from "next/link";

import { AdSlot } from "@/components/ads/ad-slot";
import type { WorldCupGuideContent } from "@/lib/world-cup-stadium-food-guide-content";
import type { ResolvedWorldCupHostVenue } from "@/lib/world-cup-stadium-food-guide";
import { worldCupHostsByCountry } from "@/lib/world-cup-stadium-food-guide";
import { venueTypeGlyph } from "@/lib/venue-display";
import { formatVenueTeamsInline } from "@/lib/venue-teams";

type WorldCupStadiumFoodGuideProps = {
  content: WorldCupGuideContent;
  hosts: ResolvedWorldCupHostVenue[];
  liveCount: number;
};

function WorldCupVenueCard({
  host,
  content
}: {
  host: ResolvedWorldCupHostVenue;
  content: WorldCupGuideContent;
}) {
  const { venues: v } = content;
  const isLive = Boolean(host.slug);
  const isStarter = isLive && host.foodItemCount === 0;
  const cardClass = `media-card flex h-full flex-col ${isLive ? "" : "opacity-90"}`;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="media-rank-card-title">{host.name}</h3>
          <p className="media-rank-card-meta">{host.market}</p>
        </div>
        {host.venue?.venueTypeKey ? (
          <span
            className="inline-flex shrink-0 items-center rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-2 py-0.5 text-sm"
            aria-hidden
          >
            {venueTypeGlyph(host.venue.venueTypeKey)}
          </span>
        ) : null}
      </div>

      {host.venue ? (
        <p className="mt-2 line-clamp-2 text-xs font-semibold text-[var(--media-ink-muted)]">
          {host.venue.teams.length > 0
            ? formatVenueTeamsInline(host.venue.teams)
            : host.venue.city
              ? `${host.venue.city}, ${host.venue.state}`
              : "—"}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--media-ink-dim)]">{v.venuePageComing}</p>
      )}

      <div className="mt-auto pt-3">
        {isLive ? (
          <>
            {isStarter ? (
              <p className="text-xs leading-relaxed text-[var(--media-ink-muted)]">
                {v.starterCoverage}
              </p>
            ) : (
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                {v.foodItemsListed(host.foodItemCount)}
              </p>
            )}
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--media-orange-deep)]">
              {v.browseVenue}
            </p>
          </>
        ) : (
          <span className="inline-flex rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
            {v.comingSoon}
          </span>
        )}
      </div>
    </>
  );

  if (isLive && host.slug) {
    return (
      <Link href={`/venues/${host.slug}`} className={`group block ${cardClass}`}>
        {inner}
      </Link>
    );
  }

  return <article className={cardClass}>{inner}</article>;
}

export function WorldCupStadiumFoodGuide({
  content,
  hosts,
  liveCount
}: WorldCupStadiumFoodGuideProps) {
  const groups = worldCupHostsByCountry(hosts);
  const { venues: v, howItWorks, cta, faq } = content;

  return (
    <>
      <section>
        <div className="media-section-heading">
          <div>
            <p className="media-section-eyebrow">{v.sectionEyebrow(liveCount, hosts.length)}</p>
            <h2 className="media-section-title">Host stadiums</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-6">
          {groups.map(({ country, hosts: countryHosts }) => (
            <div key={country}>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--media-ink-muted)]">
                {v.countryLabels[country]}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {countryHosts.map((host) => (
                  <WorldCupVenueCard key={host.id} host={host} content={content} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdSlot
        placementKey="worldcup.guide.banner"
        variant="banner"
        tone="media"
        className="mt-6 sm:mt-8"
      />

      <section className="mt-8 sm:mt-10" aria-labelledby="wcg-how-heading">
        <h2 id="wcg-how-heading" className="media-section-title">
          {howItWorks.heading}
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="media-panel-card p-4 sm:p-5">
              <p className="media-section-eyebrow">{howItWorks.stepLabel(index + 1)}</p>
              <h3 className="mt-1 text-base font-black text-[var(--media-ink)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--media-ink-muted)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="media-panel-card media-panel-card--accent mt-8 p-5 text-center sm:mt-10 sm:p-8"
        aria-labelledby="wcg-cta-heading"
      >
        <h2 id="wcg-cta-heading" className="media-section-title">
          {cta.heading}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--media-ink-muted)]">
          {cta.body}
        </p>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Link href="/venues" className="media-primary-button px-6 py-3 text-sm">
            {cta.findVenue}
          </Link>
          <Link href="/signup" className="media-cta-outline px-6 py-3 text-sm">
            {cta.createAccount}
          </Link>
        </div>
      </section>

      <section className="mt-8 sm:mt-10" aria-labelledby="wcg-faq-heading">
        <h2 id="wcg-faq-heading" className="media-section-title">
          {faq.heading}
        </h2>
        <div className="mt-4 space-y-3">
          {faq.items.map((item) => (
            <article key={item.question} className="media-panel-card p-4 sm:p-5">
              <h3 className="text-sm font-black text-[var(--media-ink)] sm:text-base">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--media-ink-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
