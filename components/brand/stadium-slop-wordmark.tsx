import { CheeseburgerO } from "@/components/brand/cheeseburger-o";

type StadiumSlopWordmarkProps = {
  className?: string;
};

/**
 * Single-line header wordmark — STADIUM (white) + SL[burger]P (orange).
 * Does not replace /branding image files.
 */
export function StadiumSlopWordmark({ className = "" }: StadiumSlopWordmarkProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black leading-none tracking-tight sm:gap-2 ${className}`}
    >
      <span className="text-[0.58rem] uppercase tracking-[0.2em] text-white sm:text-[0.62rem]">
        STADIUM
      </span>
      <span className="inline-flex items-center text-[1.05rem] tracking-[-0.04em] sm:text-xl">
        <span className="text-[var(--media-orange-bright)]">SL</span>
        <CheeseburgerO className="mx-0.5 h-[0.95em] w-[0.95em] shrink-0 sm:h-[1em] sm:w-[1em]" />
        <span className="text-[var(--media-orange-bright)]">P</span>
      </span>
    </span>
  );
}
