import fs from "node:fs";
import path from "node:path";

/** Prefer PNG poster when present in /public/ads. */
export const TEAM_M8TES_POSTER_PNG = "/ads/team-m8tes-poster.png";
export const TEAM_M8TES_POSTER_SVG = "/ads/team-m8tes-poster.svg";

export const HOME_HERO_BACKGROUND = "/branding/home-hero-bg.png";
export const HOME_HERO_BACKGROUND_MOBILE = "/branding/home-hero-bg-mobile.png";

export function resolveHomeHeroMobileBackground(): string {
  const mobilePath = path.join(
    process.cwd(),
    "public",
    "branding",
    "home-hero-bg-mobile.png"
  );
  if (fs.existsSync(mobilePath)) {
    return HOME_HERO_BACKGROUND_MOBILE;
  }
  return HOME_HERO_BACKGROUND;
}

export function resolveTeamM8tesPosterUrl(): string {
  const pngPath = path.join(process.cwd(), "public", "ads", "team-m8tes-poster.png");
  if (fs.existsSync(pngPath)) {
    return TEAM_M8TES_POSTER_PNG;
  }
  return TEAM_M8TES_POSTER_SVG;
}
