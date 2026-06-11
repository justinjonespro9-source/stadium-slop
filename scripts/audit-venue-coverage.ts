#!/usr/bin/env npx tsx
/**
 * Venue coverage audit — stdout markdown tables.
 *   npx tsx scripts/audit-venue-coverage.ts
 */
import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { isFairVenueSlug } from "../lib/fair-import/venues";
import { MLS_NWSL_VENUE_GEO } from "../lib/mls-nwsl-venue-geo";
import { WORLD_CUP_HOST_VENUES } from "../lib/world-cup-stadium-food-guide";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const WORLD_CUP_SLUGS = new Set(
  WORLD_CUP_HOST_VENUES.flatMap((h) =>
    h.slugCandidates.map((s) => s.trim().toLowerCase())
  )
);

const MLS_NWSL_SLUGS = new Set(Object.keys(MLS_NWSL_VENUE_GEO));

const NCAA_FOOTBALL_SLUGS = new Set([
  "michigan-stadium",
  "ohio-stadium",
  "bryant-denny-stadium",
  "neyland-stadium",
  "notre-dame-stadium",
  "tiger-stadium",
  "kyle-field",
  "sanford-stadium",
  "darrell-k-royal-texas-memorial-stadium",
  "beaver-stadium",
  "snapdragon-stadium"
]);

function normLeagues(leagues: string[]): Set<string> {
  return new Set(leagues.map((l) => l.trim().toUpperCase()));
}

function normSports(sports: string[]): Set<string> {
  return new Set(sports.map((s) => s.trim().toLowerCase()));
}

type Category =
  | "NFL"
  | "MLB"
  | "NBA"
  | "NHL"
  | "MLS"
  | "NWSL"
  | "NCAA Football"
  | "NCAA Basketball"
  | "World Cup"
  | "State Fair"
  | "Other";

function primaryCategory(v: {
  slug: string;
  leagues: string[];
  sports: string[];
  primarySport: string | null;
}): Category {
  const slug = v.slug.toLowerCase();
  const leagues = normLeagues(v.leagues);
  const sports = normSports(v.sports);

  if (isFairVenueSlug(slug)) return "State Fair";

  if (leagues.has("NCAA") || NCAA_FOOTBALL_SLUGS.has(slug)) {
    const primary = (v.primarySport ?? "").trim().toLowerCase();
    if (
      primary === "basketball" ||
      (sports.has("basketball") && !sports.has("football") && !NCAA_FOOTBALL_SLUGS.has(slug))
    ) {
      return "NCAA Basketball";
    }
    if (
      primary === "football" ||
      sports.has("football") ||
      NCAA_FOOTBALL_SLUGS.has(slug)
    ) {
      return "NCAA Football";
    }
  }

  if (
    leagues.has("NCAA") &&
    (sports.has("basketball") || v.primarySport === "Basketball")
  ) {
    return "NCAA Basketball";
  }

  if (WORLD_CUP_SLUGS.has(slug)) return "World Cup";

  if (leagues.has("NWSL") || (MLS_NWSL_SLUGS.has(slug) && leagues.has("NWSL"))) {
    return "NWSL";
  }
  if (leagues.has("MLS") || MLS_NWSL_SLUGS.has(slug)) return "MLS";
  if (leagues.has("NFL")) return "NFL";
  if (leagues.has("NBA")) return "NBA";
  if (leagues.has("NHL")) return "NHL";
  if (leagues.has("MLB")) return "MLB";

  if (
    slug.startsWith("estadio-") &&
    (leagues.has("FIFA") || leagues.has("WORLD CUP") || WORLD_CUP_SLUGS.has(slug))
  ) {
    return "World Cup";
  }

  return "Other";
}

function leagueMembership(v: { slug: string; leagues: string[] }): Set<Category> {
  const out = new Set<Category>();
  const slug = v.slug.toLowerCase();
  const leagues = normLeagues(v.leagues);

  if (isFairVenueSlug(slug)) out.add("State Fair");
  if (WORLD_CUP_SLUGS.has(slug)) out.add("World Cup");
  if (leagues.has("NFL")) out.add("NFL");
  if (leagues.has("MLB")) out.add("MLB");
  if (leagues.has("NBA")) out.add("NBA");
  if (leagues.has("NHL")) out.add("NHL");
  if (leagues.has("MLS") || MLS_NWSL_SLUGS.has(slug)) out.add("MLS");
  if (leagues.has("NWSL")) out.add("NWSL");
  if (NCAA_FOOTBALL_SLUGS.has(slug) || (leagues.has("NCAA") && !out.has("NCAA Basketball"))) {
    const cat = primaryCategory({ ...v, sports: [], primarySport: null });
    if (cat === "NCAA Football" || cat === "NCAA Basketball") out.add(cat);
  }
  if (leagues.has("NCAA")) {
    const pc = primaryCategory(v as Parameters<typeof primaryCategory>[0]);
    if (pc === "NCAA Football" || pc === "NCAA Basketball") out.add(pc);
  }
  return out;
}

function buildHighProfileSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const h of WORLD_CUP_HOST_VENUES) {
    for (const s of h.slugCandidates) slugs.add(s.toLowerCase());
  }
  for (const s of Object.keys(MLS_NWSL_VENUE_GEO)) slugs.add(s.toLowerCase());
  for (const s of NCAA_FOOTBALL_SLUGS) slugs.add(s);
  return slugs;
}

function bucket(count: number): string {
  if (count <= 10) return "0–10";
  if (count <= 25) return "11–25";
  if (count <= 50) return "26–50";
  if (count <= 100) return "51–100";
  return "100+";
}

async function main() {
  const venues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    select: {
      slug: true,
      name: true,
      leagues: true,
      sports: true,
      primarySport: true,
      teams: true,
      _count: {
        select: {
          items: { where: { status: EntityStatus.ACTIVE, itemType: "FOOD" } }
        }
      }
    },
    orderBy: { slug: "asc" }
  });

  const totalVenues = venues.length;
  const totalItems = venues.reduce((s, v) => s + v._count.items, 0);

  const primaryCounts: Record<Category, number> = {
    NFL: 0,
    MLB: 0,
    NBA: 0,
    NHL: 0,
    MLS: 0,
    NWSL: 0,
    "NCAA Football": 0,
    "NCAA Basketball": 0,
    "World Cup": 0,
    "State Fair": 0,
    Other: 0
  };

  for (const v of venues) {
    primaryCounts[primaryCategory(v)] += 1;
  }

  const bucketCounts: Record<string, number> = {
    "0–10": 0,
    "11–25": 0,
    "26–50": 0,
    "51–100": 0,
    "100+": 0
  };
  for (const v of venues) {
    bucketCounts[bucket(v._count.items)] += 1;
  }

  const byItems = venues
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      items: v._count.items,
      category: primaryCategory(v),
      leagues: v.leagues.join(", ")
    }))
    .sort((a, b) => a.items - b.items || a.slug.localeCompare(b.slug));

  const highProfile = buildHighProfileSlugs();
  const highProfileLow = venues
    .filter((v) => highProfile.has(v.slug.toLowerCase()) && v._count.items < 20)
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      items: v._count.items,
      category: primaryCategory(v),
      leagues: v.leagues.join(", ")
    }))
    .sort((a, b) => a.items - b.items || a.slug.localeCompare(b.slug))
    .slice(0, 25);

  const fewest = byItems.slice(0, 25);

  console.log("# Stadium Slop — Venue Coverage Audit\n");
  console.log(`Generated: ${new Date().toISOString()}\n`);

  console.log("## Summary\n");
  console.log("| Metric | Count |");
  console.log("|--------|------:|");
  console.log(`| Total active venues | ${totalVenues} |`);
  console.log(`| Total active food items | ${totalItems} |`);
  console.log("");

  console.log("## Venues by type (primary category)\n");
  console.log("Each venue is assigned one primary category (multi-league venues use priority: State Fair → NCAA → World Cup → NWSL → MLS → NFL → NBA → NHL → MLB → Other).\n");
  console.log("| Type | Venues |");
  console.log("|------|-------:|");
  const typeOrder: Category[] = [
    "NFL",
    "MLB",
    "NBA",
    "NHL",
    "MLS",
    "NWSL",
    "NCAA Football",
    "NCAA Basketball",
    "World Cup",
    "State Fair",
    "Other"
  ];
  for (const t of typeOrder) {
    console.log(`| ${t} | ${primaryCounts[t]} |`);
  }
  console.log(`| **Total** | **${totalVenues}** |`);
  console.log("");

  console.log("## Food item distribution (active venues)\n");
  console.log("| Items per venue | Venues |");
  console.log("|-----------------|-------:|");
  for (const b of ["0–10", "11–25", "26–50", "51–100", "100+"]) {
    console.log(`| ${b} | ${bucketCounts[b]} |`);
  }
  console.log("");

  console.log("## Top 25 active venues with the fewest food items\n");
  console.log("| Rank | Venue | Slug | Items | Primary type |");
  console.log("|-----:|-------|------|------:|--------------|");
  fewest.forEach((v, i) => {
    console.log(
      `| ${i + 1} | ${v.name.replace(/\|/g, "\\|")} | \`${v.slug}\` | ${v.items} | ${v.category} |`
    );
  });
  console.log("");

  console.log("## Top 25 highest-profile venues with fewer than 20 food items\n");
  console.log(
    "High-profile set: FIFA 2026 host stadiums, MLS/NWSL registry venues, and flagged NCAA football stadiums.\n"
  );
  console.log("| Rank | Venue | Slug | Items | Primary type | Leagues |");
  console.log("|-----:|-------|------|------:|--------------|---------|");
  highProfileLow.forEach((v, i) => {
    console.log(
      `| ${i + 1} | ${v.name.replace(/\|/g, "\\|")} | \`${v.slug}\` | ${v.items} | ${v.category} | ${v.leagues.replace(/\|/g, "\\|")} |`
    );
  });
  if (highProfileLow.length === 0) {
    console.log("| — | *(none)* | — | — | — | — |");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
