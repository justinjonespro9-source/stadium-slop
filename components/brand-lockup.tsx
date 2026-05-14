import Image from "next/image";

type BrandLockupProps = {
  /** Icon only — header mobile, tight spaces */
  compact?: boolean;
};

export function BrandLockup({ compact = false }: BrandLockupProps) {
  if (compact) {
    return (
      <span className="inline-flex items-center">
        <Image
          src="/branding/stadium-slop-icon.png"
          alt="Stadium Slop"
          width={40}
          height={40}
          className="h-9 w-9 object-contain sm:h-10 sm:w-10"
          priority
        />
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Image
        src="/branding/stadium-slop-wordmark.png"
        alt="Stadium Slop"
        width={220}
        height={48}
        className="h-9 w-auto max-w-[min(100%,14rem)] object-contain object-left sm:h-11"
        priority
      />
      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[var(--slop-gold-dim)]">
        Eats in the Seats
      </p>
    </div>
  );
}
