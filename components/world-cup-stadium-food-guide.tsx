import Link from "next/link";

import type { ResolvedWorldCupHostVenue } from "@/lib/world-cup-stadium-food-guide";
import {
  WORLD_CUP_FAQ_ITEMS,
  WORLD_CUP_HOW_IT_WORKS_STEPS,
  WORLD_CUP_PLATFORM_DISCLAIMER,
  worldCupHostsByCountry
} from "@/lib/world-cup-stadium-food-guide";
import { venueTypeGlyph } from "@/lib/venue-display";
import { formatVenueTeamsInline } from "@/lib/venue-teams";

type WorldCupStadiumFoodGuideProps = {
  hosts: ResolvedWorldCupHostVenue[];
};

function countryLabel(country: ResolvedWorldCupHostVenue["country"]): string {
  if (country === "USA") return "United States";
  if (country === "Canada") return "Canada";
  return "Mexico";
}

function WorldCupVenueCard({ host }: { host: ResolvedWorldCupHostVenue }) {
  const isLive = Boolean(host.slug);
  const cardClass =
    "brand-card flex h-full flex-col rounded-xl border border-[var(--slop-line-strong)] p-3.5 transition sm:rounded-2xl sm:p-4 " +
    (isLive
      ? "hover:border-[var(--slop-gold)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      : "opacity-90");

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-black leading-tight text-[var(--slop-cream)] sm:text-lg">
            {host.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--slop-cream-dim)]">{host.market}</p>
        </div>
        {host.venue?.venueTypeKey ? (
          <span
            className="inline-flex shrink-0 items-center rounded-md border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-1.5 py-0.5 text-sm"
            aria-hidden
          >
            {venueTypeGlyph(host.venue.venueTypeKey)}
          </span>
        ) : null}
      </div>

      {host.venue ? (
        <p className="mt-2 line-clamp-2 text-xs font-semibold text-[var(--slop-cream-muted)]">
          {host.venue.teams.length > 0
            ? formatVenueTeamsInline(host.venue.teams)
            : host.venue.city
              ? `${host.venue.city}, ${host.venue.state}`
              : "—"}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--slop-cream-dim)]">
          Venue page coming to Stadium Slop.
        </p>
      )}

      <div className="mt-auto pt-3">
        {isLive ? (
          <>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
              <span className="tabular-nums text-[var(--slop-cream-muted)]">
                {host.foodItemCount}
              </span>{" "}
              {host.foodItemCount === 1 ? "food item" : "food items"} listed
            </p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-gold)]">
              Browse venue →
            </p>
          </>
        ) : (
          <span className="inline-flex rounded-full border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
            Coming soon
          </span>
        )}
      </div>
    </>
  );

  if (isLive && host.slug) {
    return (
      <Link href={`/venues/${host.slug}`} className={`group ${cardClass}`}>
        {inner}
      </Link>
    );
  }

  return <article className={cardClass}>{inner}</article>;
}

export function WorldCupStadiumFoodGuide({ hosts }: WorldCupStadiumFoodGuideProps) {
  const groups = worldCupHostsByCountry(hosts);
  const liveCount = hosts.filter((h) => h.slug).length;

  return (
    <>
      <section className="brand-panel rounded-2xl border border-[var(--slop-line-strong)] p-4 shadow-lg sm:p-6">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
          2026 host venues · {liveCount} of {hosts.length} live on Stadium Slop
        </p>
        <div className="mt-4 grid gap-6">
          {groups.map(({ country, hosts: countryHosts }) => (
            <div key={country}>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--slop-cream)]">
                {countryLabel(country)}
              </h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {countryHosts.map((host) => (
                  <WorldCupVenueCard key={host.id} host={host} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 sm:mt-12" aria-labelledby="wcg-how-heading">
        <h2
          id="wcg-how-heading"
          className="text-lg font-black text-[var(--slop-cream)] sm:text-xl"
        >
          How Stadium Slop Works
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {WORLD_CUP_HOW_IT_WORKS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="brand-card rounded-xl border border-[var(--slop-line-strong)] p-4 sm:rounded-2xl"
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-base font-black text-[var(--slop-cream)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="brand-panel mt-10 rounded-2xl border border-[var(--slop-gold)] bg-[color:rgba(244,179,33,0.06)] p-5 text-center shadow-lg sm:mt-12 sm:p-8"
        aria-labelledby="wcg-cta-heading"
      >
        <h2
          id="wcg-cta-heading"
          className="text-lg font-black text-[var(--slop-cream)] sm:text-xl"
        >
          Be one of the first fans to help rank World Cup stadium food.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--slop-cream-muted)]">
          Pick a host venue, leave a verified review, and help travelers know what
          is worth ordering before kickoff.
        </p>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Link href="/venues" className="brand-cta rounded-full px-6 py-3 text-sm font-black">
            Find a venue
          </Link>
          <Link
            href="/signup"
            className="brand-cta-secondary rounded-full px-6 py-3 text-sm font-black"
          >
            Create an account
          </Link>
        </div>
      </section>

      <section className="mt-10 sm:mt-12" aria-labelledby="wcg-faq-heading">
        <h2
          id="wcg-faq-heading"
          className="text-lg font-black text-[var(--slop-cream)] sm:text-xl"
        >
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-3">
          {WORLD_CUP_FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="brand-card rounded-xl border border-[var(--slop-line-strong)] p-4 sm:rounded-2xl"
            >
              <h3 className="text-sm font-black text-[var(--slop-cream)] sm:text-base">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 border-t border-[var(--slop-line-strong)] pt-6 text-xs leading-relaxed text-[var(--slop-cream-dim)] sm:text-sm">
        {WORLD_CUP_PLATFORM_DISCLAIMER}
      </p>
    </>
  );
}
