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
  header:
    "h-auto w-[220px] max-w-[58vw] shrink-0 object-contain object-center md:w-[260px] md:max-w-none md:object-left",
  scorecard:
    "h-auto w-[13.5rem] max-w-[calc(100%-5rem)] shrink-0 object-contain object-left",
  compact: "h-auto w-[11rem] max-w-[calc(100%-6.5rem)] shrink-0 object-contain object-left"
};

const SIZE_HINT: Record<StadiumSlopWordmarkSize, string> = {
  header: "(max-width: 768px) 480px, 520px",
  scorecard: "432px",
  compact: "352px"
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
