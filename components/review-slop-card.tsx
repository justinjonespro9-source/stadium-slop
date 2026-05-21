import type { ReactNode } from "react";

import {
  SlopScorecardFlipCard,
  type SlopScorecardFlipCardProps
} from "@/components/slop-scorecard-flip-card";

/** Server-friendly alias — renders the flip Slop Scorecard (client). */
export function ReviewSlopCard(
  props: SlopScorecardFlipCardProps & { cardIndex?: number }
) {
  const { cardIndex = 0, ...rest } = props;
  return <SlopScorecardFlipCard cardIndex={cardIndex} {...rest} />;
}

export type { SlopScorecardFlipCardProps };
