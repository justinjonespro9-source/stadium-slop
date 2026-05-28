import type { ReactNode } from "react";

type AccountPageHeroProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
};

/** Compact dark header for /account — account scope only. */
export function AccountPageHero({
  eyebrow,
  title,
  description,
  children
}: AccountPageHeroProps) {
  return (
    <section className="media-account-hero relative overflow-hidden text-white shadow-[var(--media-shadow-hero)]">
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-10">
        <header>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)] sm:text-[0.65rem]">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 max-w-3xl text-[clamp(1.35rem,4.5vw,2rem)] font-black leading-[1.12] tracking-tight text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[0.75rem] leading-relaxed text-white/70 sm:text-sm">
              {description}
            </p>
          ) : null}
        </header>

        {children ? <div className="mt-3 sm:mt-4">{children}</div> : null}
      </div>
    </section>
  );
}
