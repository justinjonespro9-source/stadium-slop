import Image from "next/image";

/** Intrinsic pixels of `/public/branding/stadium-slop-wordmark.png` */
const WORDMARK_WIDTH = 1971;
const WORDMARK_HEIGHT = 798;

type StadiumSlopWordmarkProps = {
  className?: string;
  /** Lighter lockup for tight mobile header */
  priority?: boolean;
};

/**
 * Single-line Stadium Slop wordmark from `/public/branding/stadium-slop-wordmark.png`.
 */
export function StadiumSlopWordmark({
  className = "",
  priority = true
}: StadiumSlopWordmarkProps) {
  return (
    <Image
      src="/branding/stadium-slop-wordmark.png"
      alt="Stadium Slop"
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      priority={priority}
      sizes="(max-width: 640px) 168px, 220px"
      className={[
        "h-7 w-auto max-w-[min(100%,10.5rem)] object-contain object-left sm:h-8 sm:max-w-[12rem] md:h-9 md:max-w-[13.5rem]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
