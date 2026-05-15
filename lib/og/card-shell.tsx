import type { ReactElement, ReactNode } from "react";

import { FONT, OG } from "@/lib/og-brand";

import { OG_CARD } from "@/lib/site-metadata";

export type OgSize = typeof OG_CARD;

export function OgScoreboardShell({
  children,
  size = OG_CARD
}: {
  children: ReactNode;
  size?: OgSize;
}): ReactElement {
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: FONT,
        background: `linear-gradient(145deg, ${OG.navyMid} 0%, ${OG.navy} 42%, ${OG.navyDeep} 100%)`,
        overflow: "hidden",
        padding: "48px 56px",
        justifyContent: "space-between",
        alignItems: "stretch"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 60% at 50% -8%, rgba(244,179,33,0.16), transparent 55%), radial-gradient(circle at 100% 0%, rgba(198,61,47,0.12), transparent 42%)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size.width,
          height: "6px",
          background: `linear-gradient(90deg, ${OG.red}, ${OG.gold}, ${OG.goldBright})`
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
          marginTop: 24,
          borderTop: "1px solid rgba(245,233,208,0.22)",
          paddingTop: 20
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
          FAN SCOREBOARD
        </div>
      </div>
    </div>
  );
}
