import Link from "next/link";
import type { ReactNode } from "react";

type VenueHeroProps = {
  venueName: string;
  metaLine: ReactNode;
  reviewCtaHref: string;
  children?: ReactNode;
};

export function VenueHero({
  venueName,
  metaLine,
  reviewCtaHref,
  children
}: VenueHeroProps) {
  return (
    <section className="media-venue-hero relative overflow-hidden text-white shadow-[var(--media-shadow-hero)]">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#121a28_0%,#0a1018_58%,#060a10_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 70% at 20% -20%, rgba(255,107,26,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(255,255,255,0.04), transparent 50%)"
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-6 lg:px-10 lg:pb-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link
            href="/venues"
            className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm"
          >
            ← Venues
          </Link>
          <Link href={reviewCtaHref} className="media-primary-button shrink-0 text-[0.7rem] sm:text-sm">
            Leave a review
          </Link>
        </div>

        <header className="mt-3 sm:mt-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)] sm:text-[0.65rem]">
            Slop Scoreboard
          </p>
          <h1 className="mt-2 max-w-3xl text-[clamp(1.65rem,5.5vw,2.75rem)] font-black leading-[1.08] tracking-tight text-white">
            {venueName}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.8125rem] font-medium leading-relaxed text-white/78 sm:text-sm">
            {metaLine}
          </p>
        </header>

        {children ? <div className="mt-5 space-y-3 sm:mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
