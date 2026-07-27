#!/usr/bin/env npx tsx
/**
 * College venue inventory audit — categorized stdout report.
 *
 *   npx tsx scripts/audit-college-venues.ts
 *   npm run audit:college-venues
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { SEC_PRIMARY_FOOTBALL_SLUGS } from "../lib/ncaa-venue-registry";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

/** 2026 Big Ten football primary home stadiums (+ Martin temporary NU home). */
export const BIG_TEN_FOOTBALL_SLUGS = new Set([
  "memorial-stadium-illinois",
  "memorial-stadium-indiana",
  "kinnick-stadium",
  "secu-stadium",
  "michigan-stadium",
  "spartan-stadium",
  "huntington-bank-stadium",
  "memorial-stadium-nebraska",
  "ryan-field",
  "northwestern-medicine-field-at-martin-stadium",
  "ohio-stadium",
  "autzen-stadium",
  "beaver-stadium",
  "ross-ade-stadium",
  "shi-stadium",
  "rose-bowl",
  "los-angeles-memorial-coliseum",
  "husky-stadium",
  "camp-randall-stadium"
]);

const OTHER_P4_FOOTBALL_SLUGS = new Set([
  "bryant-denny-stadium",
  "neyland-stadium",
  "tiger-stadium",
  "kyle-field",
  "sanford-stadium",
  "darrell-k-royal-texas-memorial-stadium"
]);

const NOTRE_DAME_SLUGS = new Set(["notre-dame-stadium"]);
const G5_SLUGS = new Set(["snapdragon-stadium"]);
const BASKETBALL_SLUGS = new Set([
  "cameron-indoor-stadium",
  "allen-fieldhouse",
  "rupp-arena"
]);

type Bucket =
  | "Big Ten football"
  | "Other Power Four football"
  | "Notre Dame"
  | "Group of Five"
  | "College basketball"
  | "Multi-tenant / other college";

type AuditRow = {
  name: string;
  slug: string;
  school: string | null;
  teams: string[];
  conference: string;
  sport: string;
  venueType: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  status: string;
  activeMenuItems: number;
  games2026: number;
  bucket: Bucket;
};

function conferenceFromLeagues(leagues: string[]): string {
  const skip = new Set(["ncaa", "fbs", "fcs", "division i", "mls", "nwsl", "nfl", "mlb"]);
  for (const l of leagues) {
    const key = l.trim().toLowerCase();
    if (!skip.has(key) && key.length > 0) return l.trim();
  }
  return leagues.join(", ") || "—";
}

function categorize(v: {
  slug: string;
  leagues: string[];
  sports: string[];
  venueType: string;
  teams: string[];
}): Bucket {
  const slug = v.slug.toLowerCase();
  if (BIG_TEN_FOOTBALL_SLUGS.has(slug)) return "Big Ten football";
  if (NOTRE_DAME_SLUGS.has(slug)) return "Notre Dame";
  if (G5_SLUGS.has(slug) || slug === "snapdragon-stadium") return "Group of Five";
  if (BASKETBALL_SLUGS.has(slug) || v.sports.some((s) => /basketball/i.test(s))) {
    if (!v.sports.some((s) => /football/i.test(s))) return "College basketball";
  }
  if (OTHER_P4_FOOTBALL_SLUGS.has(slug)) return "Other Power Four football";
  const leagues = v.leagues.map((l) => l.toLowerCase());
  if (leagues.includes("big ten") && v.sports.some((s) => /football/i.test(s))) {
    return "Big Ten football";
  }
  if (
    leagues.some((l) => ["sec", "acc", "big 12", "big twelve"].includes(l)) &&
    v.sports.some((s) => /football/i.test(s))
  ) {
    return "Other Power Four football";
  }
  if (v.teams.length > 1 || leagues.includes("mls") || leagues.includes("nwsl")) {
    return "Multi-tenant / other college";
  }
  return "Multi-tenant / other college";
}

function printTable(title: string, rows: AuditRow[]) {
  console.log(`\n## ${title} (${rows.length})\n`);
  if (rows.length === 0) {
    console.log("_None_\n");
    return;
  }
  console.log(
    "| Name | Slug | School/Team | Conf | Sport | Type | City/State | Lat/Lng | Radius | Status | Menus | 2026 Games |"
  );
  console.log(
    "| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | ---: | ---: |"
  );
  for (const r of rows) {
    const team = r.school ? `${r.school} / ${r.teams.join("; ")}` : r.teams.join("; ");
    console.log(
      `| ${r.name} | \`${r.slug}\` | ${team} | ${r.conference} | ${r.sport} | ${r.venueType} | ${r.city}, ${r.state} | ${r.latitude}, ${r.longitude} | ${r.reviewRadiusMeters} | ${r.status} | ${r.activeMenuItems} | ${r.games2026} |`
    );
  }
}

async function main() {
  const venues = await prisma.venue.findMany({ orderBy: { name: "asc" } });
  const foodCounts = await prisma.foodItem.groupBy({
    by: ["venueId"],
    where: { status: "ACTIVE" },
    _count: true
  });
  const foodMap = new Map(foodCounts.map((r) => [r.venueId, r._count]));
  const gameCounts = await prisma.game.groupBy({
    by: ["venueId"],
    where: { season: 2026, league: { in: ["NCAA Football", "NCAA"] } },
    _count: true
  });
  const gameMap = new Map(gameCounts.map((r) => [r.venueId, r._count]));
  // Also count any 2026 games at college venues (league may vary during rollout)
  const allGameCounts = await prisma.game.groupBy({
    by: ["venueId"],
    where: { season: 2026 },
    _count: true
  });
  const allGameMap = new Map(allGameCounts.map((r) => [r.venueId, r._count]));

  const collegeish = venues.filter((v) => {
    const leagues = (v.leagues ?? []).map((x) => x.toLowerCase());
    return (
      v.venueType === "COLLEGE_STADIUM" ||
      Boolean(v.school) ||
      leagues.some((l) =>
        ["ncaa", "big ten", "sec", "acc", "big 12", "mountain west", "independent", "fbs"].some(
          (k) => l.includes(k)
        )
      ) ||
      BIG_TEN_FOOTBALL_SLUGS.has(v.slug) ||
      OTHER_P4_FOOTBALL_SLUGS.has(v.slug) ||
      BASKETBALL_SLUGS.has(v.slug) ||
      G5_SLUGS.has(v.slug) ||
      NOTRE_DAME_SLUGS.has(v.slug)
    );
  });

  const rows: AuditRow[] = collegeish.map((v) => {
    const bucket = categorize(v);
    return {
      name: v.name,
      slug: v.slug,
      school: v.school,
      teams: v.teams,
      conference: conferenceFromLeagues(v.leagues),
      sport: v.primarySport ?? v.sports.join(", ") ?? "—",
      venueType: v.venueType,
      city: v.city,
      state: v.state,
      latitude: v.latitude,
      longitude: v.longitude,
      reviewRadiusMeters: v.reviewRadiusMeters,
      status: v.status,
      activeMenuItems: foodMap.get(v.id) ?? 0,
      games2026: gameMap.get(v.id) ?? allGameMap.get(v.id) ?? 0,
      bucket
    };
  });

  console.log("# College venue inventory audit\n");
  console.log(`Total college-related venues: **${rows.length}**`);

  const buckets: Bucket[] = [
    "Big Ten football",
    "Other Power Four football",
    "Notre Dame",
    "Group of Five",
    "College basketball",
    "Multi-tenant / other college"
  ];
  for (const b of buckets) {
    printTable(b, rows.filter((r) => r.bucket === b));
  }

  const bigTenPrimary = [
    "memorial-stadium-illinois",
    "memorial-stadium-indiana",
    "kinnick-stadium",
    "secu-stadium",
    "michigan-stadium",
    "spartan-stadium",
    "huntington-bank-stadium",
    "memorial-stadium-nebraska",
    "ryan-field",
    "ohio-stadium",
    "autzen-stadium",
    "beaver-stadium",
    "ross-ade-stadium",
    "shi-stadium",
    "rose-bowl",
    "los-angeles-memorial-coliseum",
    "husky-stadium",
    "camp-randall-stadium"
  ];
  const present = new Set(rows.map((r) => r.slug));
  const missing = bigTenPrimary.filter((s) => !present.has(s));
  console.log("\n## Big Ten primary stadium coverage\n");
  console.log(`Present: ${bigTenPrimary.length - missing.length} / ${bigTenPrimary.length}`);
  if (missing.length) {
    console.log(`Missing: ${missing.map((s) => `\`${s}\``).join(", ")}`);
  } else {
    console.log("Missing: none");
  }
  const martin = present.has("northwestern-medicine-field-at-martin-stadium");
  console.log(
    `Martin Stadium (NU temporary): ${martin ? "present" : "MISSING"}`
  );

  const secPrimary = [...SEC_PRIMARY_FOOTBALL_SLUGS];
  const secMissing = secPrimary.filter((s) => !present.has(s));
  console.log("\n## SEC primary stadium coverage\n");
  console.log(`Present: ${secPrimary.length - secMissing.length} / ${secPrimary.length}`);
  if (secMissing.length) {
    console.log(`Missing: ${secMissing.map((s) => `\`${s}\``).join(", ")}`);
  } else {
    console.log("Missing: none");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
