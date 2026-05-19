/** Future expansion concepts — static, no routes until product is live. */
const SLOP_NETWORK_CONCEPTS = [
  { label: "Airport Slop", hint: "Terminals & gate food" },
  { label: "Theme Park Slop", hint: "Queues, lands & snack stands" },
  { label: "State Fair Slop", hint: "Midway bites & fair classics" }
] as const;

export function HomeSlopNetwork() {
  return (
    <section
      aria-labelledby="slop-network-heading"
      className="mx-auto mt-10 w-full max-w-6xl px-4 pb-10 sm:mt-12 sm:px-8 sm:pb-12 lg:px-10"
    >
      <div className="brand-card overflow-hidden rounded-2xl border border-[var(--slop-line-strong)] sm:rounded-3xl">
        <SlopNetworkHeader />

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--slop-cream-muted)] sm:text-[0.95rem]">
            Stadium Slop starts with sports because game-day food, fandom, and live
            crowd energy are the perfect launchpad. The bigger vision is a fan-powered
            food discovery layer for crowded places.
          </p>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-3xl">
            {SLOP_NETWORK_CONCEPTS.map((concept) => (
              <li key={concept.label}>
                <SlopNetworkChip label={concept.label} hint={concept.hint} />
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
            Network expansions are on the roadmap — not live yet. Today, explore MLB
            ballparks and stadium menus above.
          </p>
        </div>
      </div>
    </section>
  );
}

function SlopNetworkHeader() {
  return (
    <div className="border-b border-[var(--slop-gold)]/25 bg-[color:rgba(244,179,33,0.06)] px-4 py-3 sm:px-6 sm:py-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--slop-gold-dim)]">
        Slop Network
      </p>
      <h2
        id="slop-network-heading"
        className="mt-1.5 text-lg font-black leading-snug tracking-tight text-[var(--slop-cream)] sm:text-xl md:text-2xl"
      >
        Built for stadiums. Ready for everywhere food competes.
      </h2>
    </div>
  );
}

function SlopNetworkChip({ label, hint }: { label: string; hint: string }) {
  return (
    <div
      className="relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5"
      aria-disabled="true"
    >
      <span className="absolute right-2 top-2 rounded-full border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.85)] px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
        Coming soon
      </span>
      <span className="pr-16 text-sm font-black leading-snug text-[var(--slop-cream)]">
        {label}
      </span>
      <span className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
        {hint}
      </span>
    </div>
  );
}
