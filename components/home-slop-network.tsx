import Link from "next/link";

/** Slop Network expansion — State Fair Slop is live; others are roadmap. */
const SLOP_NETWORK_CONCEPTS = [
  { label: "Airport Slop", hint: "Terminals & gate food", comingSoon: true as const },
  { label: "Theme Park Slop", hint: "Queues, lands & snack stands", comingSoon: true as const },
  {
    label: "State Fair Slop",
    hint: "Midway bites & fair classics",
    comingSoon: false as const,
    href: "/state-fair-food-guide"
  }
] as const;

type HomeSlopNetworkProps = {
  variant?: "default" | "media";
};

export function HomeSlopNetwork({ variant = "default" }: HomeSlopNetworkProps) {
  const isMedia = variant === "media";

  return (
    <section aria-labelledby="slop-network-heading" className={isMedia ? "" : "mx-auto mt-10 w-full max-w-6xl px-4 pb-10 sm:mt-12 sm:px-8 sm:pb-12 lg:px-10"}>
      <div
        className={
          isMedia
            ? "media-panel-card overflow-hidden"
            : "brand-card overflow-hidden rounded-2xl border border-[var(--slop-line-strong)] sm:rounded-3xl"
        }
      >
        <SlopNetworkHeader isMedia={isMedia} />

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <p
            className={
              isMedia
                ? "max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.95rem]"
                : "max-w-3xl text-sm leading-relaxed text-[var(--slop-cream-muted)] sm:text-[0.95rem]"
            }
          >
            Stadium Slop starts with sports because game-day food, fandom, and live
            crowd energy are the perfect launchpad. The bigger vision is a fan-powered
            food discovery layer for crowded places.
          </p>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-3xl">
            {SLOP_NETWORK_CONCEPTS.map((concept) => (
              <li key={concept.label}>
                <SlopNetworkChip
                  label={concept.label}
                  hint={concept.hint}
                  isMedia={isMedia}
                  comingSoon={concept.comingSoon}
                  href={"href" in concept ? concept.href : undefined}
                />
              </li>
            ))}
          </ul>

          <p
            className={
              isMedia
                ? "mt-4 text-[0.65rem] leading-snug text-[var(--media-ink-dim)]"
                : "mt-4 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]"
            }
          >
            State Fair Slop is live now. Other network expansions are on the roadmap. Today,
            explore MLB ballparks, fair guides, and stadium menus above.
          </p>
        </div>
      </div>
    </section>
  );
}

function SlopNetworkHeader({ isMedia }: { isMedia: boolean }) {
  return (
    <div
      className={
        isMedia
          ? "border-b border-[var(--media-border)] bg-gradient-to-r from-orange-50 to-white px-4 py-3 sm:px-6 sm:py-4"
          : "border-b border-[var(--slop-gold)]/25 bg-[color:rgba(244,179,33,0.06)] px-4 py-3 sm:px-6 sm:py-4"
      }
    >
      <p
        className={
          isMedia
            ? "media-section-eyebrow"
            : "text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--slop-gold-dim)]"
        }
      >
        Slop Network
      </p>
      <h2
        id="slop-network-heading"
        className={
          isMedia
            ? "mt-1.5 text-lg font-black leading-snug tracking-tight text-[var(--media-ink)] sm:text-xl md:text-2xl"
            : "mt-1.5 text-lg font-black leading-snug tracking-tight text-[var(--slop-cream)] sm:text-xl md:text-2xl"
        }
      >
        Built for stadiums. Ready for everywhere food competes.
      </h2>
    </div>
  );
}

function SlopNetworkChip({
  label,
  hint,
  isMedia,
  comingSoon,
  href
}: {
  label: string;
  hint: string;
  isMedia: boolean;
  comingSoon: boolean;
  href?: string;
}) {
  const shellClass = isMedia
    ? "relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2.5"
    : "relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5";

  const liveShellClass = isMedia
    ? "relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border border-[rgba(255,107,26,0.35)] bg-[rgba(255,107,26,0.06)] px-3 py-2.5 transition hover:border-[rgba(255,107,26,0.55)]"
    : "relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border border-[var(--slop-gold)]/35 bg-[color:rgba(244,179,33,0.08)] px-3 py-2.5 transition hover:border-[var(--slop-gold)]/55";

  const badgeClass = isMedia
    ? "absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.1em]"
    : "absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.1em]";

  const badgeSoon = isMedia
    ? `${badgeClass} border-[var(--media-border)] bg-white text-[var(--media-ink-dim)]`
    : `${badgeClass} border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.85)] text-[var(--slop-cream-dim)]`;

  const badgeLive = isMedia
    ? `${badgeClass} border-[rgba(255,107,26,0.35)] bg-white text-[var(--media-orange-deep)]`
    : `${badgeClass} border-[var(--slop-gold)]/40 bg-[color:rgba(6,15,24,0.85)] text-[var(--slop-gold-bright)]`;

  const content = (
    <>
      <span className={comingSoon ? badgeSoon : badgeLive}>
        {comingSoon ? "Coming soon" : "Live"}
      </span>
      <span
        className={
          isMedia
            ? "pr-16 text-sm font-black leading-snug text-[var(--media-ink)]"
            : "pr-16 text-sm font-black leading-snug text-[var(--slop-cream)]"
        }
      >
        {label}
      </span>
      <span
        className={
          isMedia
            ? "mt-1 text-[0.65rem] leading-snug text-[var(--media-ink-muted)]"
            : "mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]"
        }
      >
        {hint}
      </span>
    </>
  );

  if (href && !comingSoon) {
    return (
      <Link href={href} className={liveShellClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={shellClass} aria-disabled={comingSoon}>
      {content}
    </div>
  );
}
