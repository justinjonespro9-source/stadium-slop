import Image from "next/image";
import type { ReactNode } from "react";

type HomeHeroProps = {
  children: ReactNode;
};

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--slop-line-strong)] shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(21,42,61,0.95)_0%,rgba(6,15,24,0.98)_45%,rgba(6,15,24,1)_100%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(244,179,33,0.22), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255,107,53,0.12), transparent 50%)"
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[url('/branding/stadium-slop-icon.png')] bg-[length:min(420px,70vw)] bg-[position:120%_20%] bg-no-repeat opacity-[0.07] sm:bg-[position:95%_30%]"
        aria-hidden
      />

      <div className="relative grid gap-0 lg:grid-cols-[1fr_min(42%,280px)] lg:items-stretch">
        <div className="px-4 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--slop-gold-dim)]">
            Stadium Slop
          </p>
          <h1 className="mt-2 max-w-xl text-3xl font-black leading-[1.08] tracking-tight text-[var(--slop-cream)] sm:text-4xl lg:text-[2.65rem]">
            Find the best eats at every stadium.
          </h1>
          <p className="mt-3 max-w-lg text-base font-semibold leading-snug text-[var(--slop-cream-muted)] sm:text-lg">
            Real fans. Real reviews. Real good (and bad) food.
          </p>
          <div className="mt-5 sm:mt-6">{children}</div>
        </div>

        <div
          className="relative hidden min-h-[12rem] border-t border-[var(--slop-line-strong)]/60 bg-[color:rgba(6,15,24,0.35)] lg:block lg:min-h-0 lg:border-l lg:border-t-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(244,179,33,0.12)] to-transparent" />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-[var(--slop-gold)]/40 bg-[var(--slop-navy-deep)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <Image
                src="/branding/stadium-slop-icon.png"
                alt=""
                fill
                className="object-contain p-3"
                sizes="112px"
              />
            </div>
            <div className="flex gap-2 text-3xl" aria-hidden>
              <span className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.6)] px-3 py-2">
                🌭
              </span>
              <span className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.6)] px-3 py-2">
                🍕
              </span>
              <span className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.6)] px-3 py-2">
                🥤
              </span>
            </div>
            <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
              Game-day eats intel
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
