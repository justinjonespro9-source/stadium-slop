type StadiumSlopWordmarkProps = {
  className?: string;
  /** Show compact single-line layout on very small screens */
  compact?: boolean;
};

/**
 * Text wordmark for media nav — does not replace /branding image files.
 * Reserves a dashed circle for a future cheeseburger “O” in SLOP.
 */
export function StadiumSlopWordmark({
  className = "",
  compact = false
}: StadiumSlopWordmarkProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-baseline gap-1 font-black tracking-tight ${className}`}
      >
        <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white">STADIUM</span>
        <span className="text-base text-[var(--media-orange-bright)]">SLOP</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="text-[0.58rem] font-black uppercase tracking-[0.24em] text-white sm:text-[0.62rem]">
        STADIUM
      </span>
      <span className="mt-1 inline-flex items-center gap-0 font-black tracking-[-0.04em]">
        <span className="text-xl text-[var(--media-orange-bright)] sm:text-2xl">SL</span>
        <span
          className="mx-0.5 inline-flex h-[0.92em] w-[0.92em] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--media-orange-bright)]/55 bg-[rgba(255,107,26,0.12)]"
          aria-hidden
          title="Cheeseburger O — coming soon"
        />
        <span className="text-xl text-[var(--media-orange-bright)] sm:text-2xl">P</span>
      </span>
    </span>
  );
}
