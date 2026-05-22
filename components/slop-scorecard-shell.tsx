import type { ReactNode } from "react";

/** Premium multi-layer trading-card shell (Stadium Slop palette). */
export function SlopScorecardFrame({
  face,
  children,
  className = ""
}: {
  face: "front" | "back";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`slop-scorecard-collectible slop-scorecard-collectible--${face} ${className}`.trim()}
      data-face={face}
    >
      <span className="slop-scorecard-corner-accent slop-scorecard-corner-accent--tl" aria-hidden />
      <span className="slop-scorecard-corner-accent slop-scorecard-corner-accent--tr" aria-hidden />
      <span className="slop-scorecard-corner-accent slop-scorecard-corner-accent--bl" aria-hidden />
      <span className="slop-scorecard-corner-accent slop-scorecard-corner-accent--br" aria-hidden />
      <span className="slop-scorecard-edge-accent slop-scorecard-edge-accent--top" aria-hidden />
      <span className="slop-scorecard-edge-accent slop-scorecard-edge-accent--bottom" aria-hidden />
      <span className="slop-scorecard-corner-star slop-scorecard-corner-star--tl" aria-hidden>
        ✦
      </span>
      <span className="slop-scorecard-corner-star slop-scorecard-corner-star--tr" aria-hidden>
        ✦
      </span>
      <span className="slop-scorecard-corner-star slop-scorecard-corner-star--bl" aria-hidden>
        ✦
      </span>
      <span className="slop-scorecard-corner-star slop-scorecard-corner-star--br" aria-hidden>
        ✦
      </span>

      <div className="slop-scorecard-collectible-aura slop-scorecard-chamfer" aria-hidden />
      <div className="slop-scorecard-collectible-rim slop-scorecard-chamfer">
        <div className="slop-scorecard-collectible-gold slop-scorecard-chamfer">
          <div className="slop-scorecard-collectible-inner slop-scorecard-chamfer">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
