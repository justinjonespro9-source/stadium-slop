import Link from "next/link";
import type { ReactNode } from "react";

type ReviewPageHeroProps = {
  title: string;
  venueName: string;
  itemHref: string;
  metaLine: ReactNode;
  statusNote?: ReactNode;
  alerts?: ReactNode;
  badges?: ReactNode;
};

export function ReviewPageHero({
  title,
  venueName,
  itemHref,
  metaLine,
  statusNote,
  alerts,
  badges
}: ReviewPageHeroProps) {
  return (
    <section className="media-review-hero relative overflow-hidden text-white shadow-[var(--media-shadow-hero)]">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#121a28_0%,#0a1018_70%,#060a10_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255,107,26,0.2), transparent 55%)"
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-lg px-4 pb-6 pt-5 sm:max-w-xl sm:px-6 sm:pb-7 lg:max-w-2xl">
        <Link href={itemHref} className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm">
          ← {venueName}
        </Link>

        {alerts ? <div className="mt-3 space-y-2">{alerts}</div> : null}

        <header className="mt-3 sm:mt-4">
          {badges ? <div className="flex flex-wrap items-center gap-1.5">{badges}</div> : null}
          <p className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)]">
            Slop Scorecard
          </p>
          <h1 className="mt-1.5 text-[clamp(1.5rem,5vw,2.25rem)] font-black leading-[1.1] tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-white/78 sm:text-sm">
            {metaLine}
          </p>
          {statusNote ? (
            <p className="mt-2 text-[0.75rem] leading-relaxed text-white/58 sm:text-xs">{statusNote}</p>
          ) : null}
        </header>
      </div>
    </section>
  );
}
