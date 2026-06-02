import type { ReactElement, ReactNode } from "react";

import { FONT, OG } from "@/lib/og-brand";

import { OG_CARD } from "@/lib/site-metadata";

export type OgSize = typeof OG_CARD;

export function OgScoreboardShell({
  children,
  size = OG_CARD,
  footerBadge = "FAN SCOREBOARD"
}: {
  children: ReactNode;
  size?: OgSize;
  /** Right footer label (e.g. StadiumSlop.com on homepage share card). */
  footerBadge?: string;
}): ReactElement {
  const rimOuter = 5;
  const rimGold = 6;
  const rimAccent = 2;
  const padX = 48;
  const padY = 40;

  return (
    /* Layer 1: gunmetal outer rim */
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        padding: rimOuter,
        fontFamily: FONT,
        background: "linear-gradient(155deg, #02060c 0%, #11191f 30%, #080e16 60%, #0a1018 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.6)"
      }}
    >
      {/* Layer 2: metallic gold trim */}
      <div
        style={{
          flex: 1,
          display: "flex",
          padding: rimGold,
          background: `linear-gradient(145deg, #ffeba8 0%, #ffd458 14%, ${OG.goldBright} 30%, ${OG.gold} 52%, #b8891f 78%, #a07818 90%, ${OG.goldDim} 100%)`,
          boxShadow: "inset 0 1px 0 rgba(255,245,200,0.6), inset 0 -1px 0 rgba(0,0,0,0.35)"
        }}
      >
        {/* Layer 3: crimson accent */}
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: rimAccent,
            background: `linear-gradient(160deg, ${OG.red} 0%, #d94a3d 30%, #b83428 60%, #9a2f24 100%)`
          }}
        >
          {/* Inner card body */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              padding: `${padY}px ${padX}px`,
              background: `linear-gradient(145deg, ${OG.navyMid} 0%, ${OG.navy} 42%, ${OG.navyDeep} 100%)`,
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(244,179,33,0.15)"
            }}
          >
            {/* Ambient light wash */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "radial-gradient(ellipse 90% 60% at 50% -8%, rgba(244,179,33,0.14), transparent 55%), radial-gradient(circle at 100% 0%, rgba(198,61,47,0.1), transparent 42%)"
              }}
            />

            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                flexDirection: "column"
              }}
            >
              {children}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 20,
                borderTop: "1px solid rgba(245,233,208,0.18)",
                paddingTop: 16
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 22,
                  fontWeight: 900,
                  color: OG.cream
                }}
              >
                <span>Stadium</span>
                <span style={{ color: OG.goldBright }}>Slop</span>
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: OG.gold
                }}
              >
                {footerBadge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
