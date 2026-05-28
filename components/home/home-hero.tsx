import type { ReactNode } from "react";

type HomeHeroProps = {
  children: ReactNode;
};

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--media-nav)] text-white shadow-[var(--media-shadow-hero)]">
      <div
        className="absolute inset-0 bg-[linear-gradient(125deg,#0a1018_0%,#121a28_42%,#0c1220_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 15% 0%, rgba(255,107,26,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 20%, rgba(255,255,255,0.06), transparent 50%), linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55) 100%)"
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.03) 48px, rgba(255,255,255,0.03) 49px)"
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-10 lg:py-14">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--media-orange-bright)]">
            Stadium Slop
          </p>
          <h1 className="mt-3 max-w-xl text-[clamp(2rem,5.5vw,3.25rem)] font-black leading-[1.05] tracking-tight text-white">
            Find the best eats at{" "}
            <span className="text-[var(--media-orange-bright)]">every stadium.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-white/75 sm:text-lg">
            Real fans. Real reviews. Real good (and bad) food.
          </p>
          <div className="mt-6 sm:mt-7">{children}</div>
        </div>

        <div
          className="relative mx-auto flex w-full max-w-md items-center justify-center lg:mx-0 lg:max-w-none"
          aria-hidden
        >
          <div className="relative aspect-[4/3] w-full max-w-[22rem] lg:max-w-none">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[rgba(255,107,26,0.25)] via-transparent to-[rgba(255,255,255,0.06)] blur-2xl" />
            <div className="absolute inset-[8%] rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(12,18,32,0.85)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 sm:gap-5 sm:p-8">
                <div className="flex gap-3 sm:gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-4xl shadow-lg sm:h-20 sm:w-20 sm:text-5xl">
                    🌭
                  </span>
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-4xl shadow-lg sm:h-20 sm:w-20 sm:text-5xl">
                    🍕
                  </span>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-3xl shadow-lg sm:h-16 sm:w-16 sm:text-4xl">
                    🥤
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--media-orange)]/40 bg-[rgba(255,107,26,0.15)] text-3xl shadow-lg sm:h-16 sm:w-16 sm:text-4xl">
                    🏟️
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />
    </section>
  );
}
