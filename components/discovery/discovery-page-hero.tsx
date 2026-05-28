import Link from "next/link";
import type { ReactNode } from "react";

type DiscoveryPageHeroProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

export function DiscoveryPageHero({
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
  description,
  children
}: DiscoveryPageHeroProps) {
  return (
    <section className="media-discovery-hero relative overflow-hidden text-white shadow-[var(--media-shadow-hero)]">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#121a28_0%,#0a1018_65%,#060a10_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 75% 55% at 50% -15%, rgba(255,107,26,0.2), transparent 52%)"
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-6 lg:px-10">
        {backHref && backLabel ? (
          <Link href={backHref} className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm">
            ← {backLabel}
          </Link>
        ) : null}

        <header className={backHref ? "mt-3 sm:mt-4" : ""}>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)] sm:text-[0.65rem]">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-[clamp(1.5rem,5vw,2.5rem)] font-black leading-[1.1] tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-[0.8125rem] font-semibold text-white/85 sm:text-sm">{subtitle}</p>
          ) : null}
          {description ? (
            <div className="mt-2 max-w-2xl text-[0.75rem] leading-relaxed text-white/65 sm:text-sm">
              {description}
            </div>
          ) : null}
        </header>

        {children ? <div className="mt-4 sm:mt-5">{children}</div> : null}
      </div>
    </section>
  );
}
