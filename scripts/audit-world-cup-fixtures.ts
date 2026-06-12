#!/usr/bin/env npx tsx
/**
 * Audit World Cup 2026 fixture data and imported game rows.
 *
 * Usage:
 *   npx tsx scripts/audit-world-cup-fixtures.ts
 *   npx tsx scripts/audit-world-cup-fixtures.ts --verbose
 *   npx tsx scripts/audit-world-cup-fixtures.ts --limit=10
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START,
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START,
  getGameDayWindow
} from "@/lib/game-day";
import { buildWorldCup2026Fixtures } from "@/lib/schedules/world-cup-2026-fixture-seeds";
import { formatWorldCupLocalKickoff } from "@/lib/schedules/world-cup-local-kickoff";
import { getWorldCupVenueTimeZone } from "@/lib/schedules/world-cup-fixture-timezone";
import { worldCupLocalKickoffToUtc } from "@/lib/schedules/world-cup-local-kickoff";
import { WORLD_CUP_LEAGUE } from "@/lib/schedules/world-cup-schedule";
import { WORLD_CUP_VENUE_SLUGS } from "@/lib/schedules/world-cup-venue-map";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const verbose = process.argv.includes("--verbose");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "10", 10) : 10;

function isPlaceholderTeam(name: string): boolean {
  const n = name.trim();
  return (
    n === "TBD" ||
    /^Group [A-L] /i.test(n) ||
    /^Match \d+ (Winner|Loser)/i.test(n) ||
    /3rd Place/i.test(n) ||
    /Runners Up/i.test(n)
  );
}

async function main() {
  const file = buildWorldCup2026Fixtures();
  const fixtures = file.fixtures;

  let groupWithRealTeams = 0;
  let groupPlaceholders = 0;
  let knockoutPlaceholders = 0;
  const timezoneIssues: string[] = [];
  const groupTbdIssues: string[] = [];

  console.log("# World Cup 2026 Fixture Audit\n");

  for (const f of fixtures) {
    const isGroup = f.stage === "Group Stage";
    const t1 = f.teamOneName ?? "TBD";
    const t2 = f.teamTwoName ?? "TBD";
    const p1 = isPlaceholderTeam(t1);
    const p2 = isPlaceholderTeam(t2);

    if (isGroup) {
      if (p1 || p2) {
        groupPlaceholders += 1;
        if (t1 === "TBD" || t2 === "TBD") {
          groupTbdIssues.push(`${f.matchId}: ${t1} vs ${t2}`);
        }
      } else {
        groupWithRealTeams += 1;
      }
    } else if (p1 || p2) {
      knockoutPlaceholders += 1;
    }

    const expectedUtc = worldCupLocalKickoffToUtc(
      f.localDate,
      f.localTime,
      f.venueSlug
    );
    if (expectedUtc !== f.startsAt) {
      timezoneIssues.push(
        `${f.matchId} ${f.venueSlug}: expected ${expectedUtc}, got ${f.startsAt}`
      );
    }

    const tz = getWorldCupVenueTimeZone(f.venueSlug);
    if (tz !== f.venueTimeZone) {
      timezoneIssues.push(
        `${f.matchId} timezone mismatch: seed ${f.venueTimeZone} vs map ${tz}`
      );
    }
  }

  const venues = await prisma.venue.findMany({
    where: { slug: { in: [...WORLD_CUP_VENUE_SLUGS] } },
    select: { id: true, slug: true, timeZone: true }
  });
  const venueBySlug = new Map(venues.map((v) => [v.slug, v]));

  const games = await prisma.game.findMany({
    where: { league: WORLD_CUP_LEAGUE },
    select: {
      externalId: true,
      startsAt: true,
      pollingOpensAt: true,
      pollingClosesAt: true,
      venueId: true,
      venue: { select: { slug: true, timeZone: true } }
    },
    orderBy: { startsAt: "asc" }
  });

  const dbIssues: string[] = [];
  for (const g of games) {
    if (!g.venueId) dbIssues.push(`${g.externalId}: missing venueId`);
    if (!g.pollingOpensAt || !g.pollingClosesAt) {
      dbIssues.push(`${g.externalId}: missing polling window`);
    }
    if (!g.venue.timeZone) {
      dbIssues.push(`${g.venue.slug}: venue missing timeZone`);
    }
    const window = getGameDayWindow(g.startsAt);
    const openDelta =
      (g.pollingOpensAt.getTime() - window.pollingOpensAt.getTime()) / 60_000;
    const closeDelta =
      (g.pollingClosesAt.getTime() - window.pollingClosesAt.getTime()) / 60_000;
    if (openDelta !== 0 || closeDelta !== 0) {
      dbIssues.push(
        `${g.externalId}: polling window drift (open ${openDelta}m, close ${closeDelta}m)`
      );
    }
  }

  console.log("## Fixture file summary\n");
  console.log(`| Metric | Count |`);
  console.log(`|--------|------:|`);
  console.log(`| Total fixtures | ${fixtures.length} |`);
  console.log(`| Group stage with real teams (both sides) | ${groupWithRealTeams} |`);
  console.log(`| Group stage with any placeholder | ${groupPlaceholders} |`);
  console.log(`| Knockout with placeholders (expected) | ${knockoutPlaceholders} |`);
  console.log(`| Timezone conversion issues | ${timezoneIssues.length} |`);
  console.log(`| Group-stage TBD issues | ${groupTbdIssues.length} |`);

  console.log("\n## Review window policy\n");
  console.log(
    `- Opens **${GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START} minutes** before kickoff`
  );
  console.log(
    `- Closes **${GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START / 60} hours** after kickoff`
  );

  console.log(`\n## First ${limit} fixtures (local → UTC)\n`);
  console.log(
    "| matchId | venueSlug | timeZone | local kickoff | UTC | teams |"
  );
  console.log("|--------|-----------|----------|---------------|-----|-------|");
  for (const f of fixtures.slice(0, limit)) {
    const local = `${f.localDate} ${f.localTime}`;
    const display = formatWorldCupLocalKickoff(f.startsAt, f.venueSlug);
    console.log(
      `| ${f.matchId} | ${f.venueSlug} | ${f.venueTimeZone} | ${local} (${display}) | ${f.startsAt} | ${f.teamOneName} vs ${f.teamTwoName} |`
    );
  }

  console.log("\n## Database summary\n");
  console.log(`| Metric | Count |`);
  console.log(`|--------|------:|`);
  console.log(`| Host venues in DB | ${venues.length} / ${WORLD_CUP_VENUE_SLUGS.length} |`);
  console.log(`| World Cup games in DB | ${games.length} |`);
  console.log(`| DB issues | ${dbIssues.length} |`);

  if (groupTbdIssues.length) {
    console.log("\n## Group-stage TBD issues\n");
    for (const line of groupTbdIssues) console.log(`- ${line}`);
  }
  if (timezoneIssues.length) {
    console.log("\n## Timezone issues\n");
    for (const line of timezoneIssues) console.log(`- ${line}`);
  }
  if (dbIssues.length) {
    console.log("\n## Database issues\n");
    for (const line of dbIssues.slice(0, 20)) console.log(`- ${line}`);
  }

  if (verbose) {
    console.log("\n## Venue timezone map\n");
    for (const slug of WORLD_CUP_VENUE_SLUGS) {
      const v = venueBySlug.get(slug);
      console.log(`- ${slug}: ${getWorldCupVenueTimeZone(slug)} (DB: ${v?.timeZone ?? "missing"})`);
    }
  }

  const failed =
    groupTbdIssues.length > 0 ||
    timezoneIssues.length > 0 ||
    dbIssues.length > 0 ||
    venues.length !== WORLD_CUP_VENUE_SLUGS.length;

  if (failed) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
