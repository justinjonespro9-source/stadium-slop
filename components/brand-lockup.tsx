import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import Image from "next/image";

type BrandLockupProps = {
  /** Icon only — header mobile, tight spaces */
  compact?: boolean;
  /** Optional line under wordmark (default: Eats in the Seats). */
  kicker?: string;
};

export function BrandLockup({ compact = false, kicker = "Eats in the Seats" }: BrandLockupProps) {
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
      <StadiumSlopWordmark size="header" />
      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[var(--slop-cream-dim)]">
        {kicker}
      </p>
    </div>
  );
}
