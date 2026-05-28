import Image from "next/image";

import {
  STADIUM_SLOP_WORDMARK_HEIGHT,
  STADIUM_SLOP_WORDMARK_SRC,
  STADIUM_SLOP_WORDMARK_WIDTH
} from "@/lib/branding";

export type StadiumSlopWordmarkSize = "header" | "scorecard" | "compact";

type StadiumSlopWordmarkProps = {
  className?: string;
  priority?: boolean;
  size?: StadiumSlopWordmarkSize;
};

const SIZE_CLASS: Record<StadiumSlopWordmarkSize, string> = {
  /** Height-capped so the nav bar stays ~4rem; width follows aspect ratio up to max-width. */
  header:
    "h-auto max-h-[2.5rem] w-auto max-w-[min(12.8125rem,58vw)] shrink-0 object-contain object-center md:max-h-[2.65rem] md:max-w-[16.25rem] md:object-left",
  scorecard:
    "h-auto w-[9.5rem] max-w-[calc(100%-4.25rem)] shrink-0 object-contain object-left",
  compact: "h-auto w-[8.75rem] max-w-[calc(100%-5.5rem)] shrink-0 object-contain object-left"
};

const SIZE_HINT: Record<StadiumSlopWordmarkSize, string> = {
  header: "(max-width: 768px) 410px, 520px",
  scorecard: "304px",
  compact: "280px"
};

/**
 * Single-line Stadium Slop wordmark image — aspect ratio preserved, never stretched.
 */
export function StadiumSlopWordmark({
  className = "",
  priority = false,
  size = "header"
}: StadiumSlopWordmarkProps) {
  return (
    <Image
      src={STADIUM_SLOP_WORDMARK_SRC}
      alt="Stadium Slop"
      width={STADIUM_SLOP_WORDMARK_WIDTH}
      height={STADIUM_SLOP_WORDMARK_HEIGHT}
      priority={priority}
      sizes={SIZE_HINT[size]}
      className={[SIZE_CLASS[size], className].filter(Boolean).join(" ")}
    />
  );
}
