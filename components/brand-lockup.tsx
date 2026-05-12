type BrandLockupProps = {
  compact?: boolean;
};

export function BrandLockup({ compact = false }: BrandLockupProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--slop-cream)] bg-[var(--slop-red)] font-black text-[var(--slop-cream)] shadow-[4px_4px_0_var(--slop-orange)] ${
          compact ? "h-10 w-10 text-base" : "h-12 w-12 text-lg"
        }`}
      >
        SS
      </div>
      <div className="leading-none">
        <p
          className={`font-black uppercase tracking-tight text-[var(--slop-cream)] ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          Stadium Slop
        </p>
        <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[var(--slop-blue)]">
          Eats in the Seats
        </p>
      </div>
    </div>
  );
}
