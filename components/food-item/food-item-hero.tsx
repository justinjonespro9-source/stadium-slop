import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type FoodItemHeroProps = {
  foodName: string;
  venueName: string;
  venueHref: string;
  metaLine: ReactNode;
  reviewHref: string;
  reviewCtaLabel: string;
  reviewHint?: ReactNode;
  badges?: ReactNode;
  stats?: ReactNode;
  heroImageUrl?: string | null;
  heroImageAlt?: string;
};

export function FoodItemHero({
  foodName,
  venueName,
  venueHref,
  metaLine,
  reviewHref,
  reviewCtaLabel,
  reviewHint,
  badges,
  stats,
  heroImageUrl,
  heroImageAlt
}: FoodItemHeroProps) {
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
            "radial-gradient(ellipse 85% 65% at 85% -15%, rgba(255,107,26,0.24), transparent 52%), radial-gradient(ellipse 45% 35% at 0% 100%, rgba(255,255,255,0.05), transparent 50%)"
        }}
        aria-hidden
      />
      {heroImageUrl ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden>
          <Image
            src={heroImageUrl}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060a10]/40 via-[#0a1018]/85 to-[#060a10]" />
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-6 lg:px-10 lg:pb-10">
        <Link href={venueHref} className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm">
          ← {venueName}
        </Link>

        <header className="mt-4 sm:mt-5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)] sm:text-[0.65rem]">
            Concession item
          </p>
          {badges ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{badges}</div> : null}
          <h1 className="mt-2 max-w-3xl text-[clamp(1.65rem,5.5vw,2.75rem)] font-black leading-[1.08] tracking-tight text-white">
            {foodName}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.8125rem] font-medium leading-relaxed text-white/78 sm:text-sm">
            {metaLine}
          </p>
        </header>

        {stats ? <div className="mt-4 sm:mt-5">{stats}</div> : null}

        <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href={reviewHref} className="media-primary-button w-full justify-center sm:w-auto">
            {reviewCtaLabel}
          </Link>
          <Link
            href={venueHref}
            className="media-cta-outline w-full justify-center border-white/20 bg-white/10 text-white/90 hover:border-white/35 hover:text-white sm:inline-flex sm:w-auto"
          >
            Back to {venueName}
          </Link>
        </div>
        {reviewHint ? (
          <p className="mt-2.5 max-w-xl text-[0.7rem] leading-snug text-white/62 sm:text-xs">{reviewHint}</p>
        ) : null}
      </div>
    </section>
  );
}
