/**
 * Dry-run or apply one league's regular-season schedule.
 * Callers run NBA and NHL as separate processes. This function never reads
 * or writes the other league's games.
 */

import type { PrismaClient } from "@prisma/client";

import {
  arenaMappedGameToPrismaData,
  planArenaScheduleWrites,
  type ExistingArenaScheduleGame,
  type MapArenaScheduleResult
} from "@/lib/schedules/arena-schedule";
import { ensureArenaScheduleVenues } from "@/lib/schedules/arena-schedule-venues";

export async function runArenaScheduleSync(options: {
  prisma: PrismaClient;
  league: "NBA" | "NHL";
  season: number;
  apply: boolean;
  sourceLabel: string;
  result: MapArenaScheduleResult;
}): Promise<void> {
  const { prisma, league, season, apply, sourceLabel, result } = options;
  const { parsed, mapped, skipped, duplicateEventIds } = result;

  console.log(`\n  ${league} ${season} regular-season schedule sync (2026–27)`);
  console.log(`  Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`  Source: ${sourceLabel}\n`);

  const venueEnsure = await ensureArenaScheduleVenues(prisma, league, apply);
  console.log("  Venues");
  for (const row of venueEnsure) {
    console.log(`    ${row.slug.padEnd(28)} ${row.action}`);
  }

  console.log(`\n  Events parsed: ${parsed}`);
  console.log(`  Mapped:        ${mapped.length}`);
  console.log(`  Skipped:       ${skipped.length}`);
  console.log(`  Duplicate source ids collapsed: ${duplicateEventIds.length}`);

  for (const row of skipped) {
    console.warn(
      `  Skip ${league.toLowerCase()}-${row.eventId}: ${row.reason} · ${row.awayTeamName ?? "?"} @ ${row.homeTeamName ?? "?"} · ${row.venueName ?? "—"} · ${row.startsAt}`
    );
  }

  const venueRows = await prisma.venue.findMany({
    select: { id: true, slug: true }
  });
  const venueIdBySlug = new Map(venueRows.map((venue) => [venue.slug, venue.id]));
  const plannedCreates = new Set(
    venueEnsure
      .filter((row) => row.action === "create" || row.action === "created")
      .map((row) => row.slug)
  );

  const unresolved = new Map<string, number>();
  for (const game of mapped) {
    if (venueIdBySlug.has(game.venueSlug)) continue;
    if (!apply && plannedCreates.has(game.venueSlug)) continue;
    unresolved.set(game.venueSlug, (unresolved.get(game.venueSlug) ?? 0) + 1);
  }

  const existingRows = await prisma.game.findMany({
    where: { league, season },
    select: {
      externalId: true,
      startsAt: true,
      status: true,
      homeTeamSlug: true,
      homeTeamName: true,
      awayTeamName: true,
      isNeutralSite: true,
      season: true,
      pollingOpensAt: true,
      pollingClosesAt: true,
      estimatedEndsAt: true,
      venue: { select: { slug: true } }
    }
  });

  const existing: ExistingArenaScheduleGame[] = existingRows.map((game) => ({
    externalId: game.externalId,
    startsAt: game.startsAt,
    status: game.status,
    venueSlug: game.venue.slug,
    homeTeamSlug: game.homeTeamSlug,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    isNeutralSite: game.isNeutralSite,
    season: game.season,
    pollingOpensAt: game.pollingOpensAt,
    pollingClosesAt: game.pollingClosesAt,
    estimatedEndsAt: game.estimatedEndsAt
  }));

  const plan = planArenaScheduleWrites(existing, mapped);
  const neutral = mapped.filter((game) => game.isNeutralSite).length;
  const cup = mapped.filter((game) =>
    game.eventNotes.some((note) => note.toLowerCase().includes("nba cup"))
  ).length;
  const special = mapped.filter((game) =>
    game.eventNotes.some((note) => /global series|winter classic|stadium series|heritage classic|mexico|paris|manchester/i.test(note))
  ).length;

  console.log("\n── Projected changes ────────────────────────────────");
  console.log(`  Current ${league} ${season} games: ${existing.length}`);
  console.log(`  Create:              ${plan.create.length}`);
  console.log(`  Update:              ${plan.update.length}`);
  console.log(`  Unchanged:           ${plan.unchanged.length}`);
  console.log(`  Duplicates to resolve: ${plan.duplicateExternalIds.length + plan.nullExternalIds}`);
  if (plan.duplicateExternalIds.length > 0) {
    console.log(`    duplicate external ids: ${[...new Set(plan.duplicateExternalIds)].join(", ")}`);
  }
  console.log(`  Null external ids:   ${plan.nullExternalIds}`);
  console.log(`  Not in source (left untouched): ${plan.notInSource.length}`);
  console.log(`  Unresolved venues:   ${unresolved.size}`);
  for (const [slug, count] of unresolved) {
    console.log(`    ${slug} · ${count} games`);
  }
  console.log(`  Neutral-site games:  ${neutral}`);
  console.log(`  NBA Cup-note games:  ${cup}`);
  console.log(`  Special-event notes: ${special}`);
  const statusCounts = new Map<string, number>();
  for (const game of mapped) {
    statusCounts.set(game.status, (statusCounts.get(game.status) ?? 0) + 1);
  }
  console.log(
    `  Statuses:            ${[...statusCounts.entries()].map(([status, count]) => `${status}=${count}`).join("  ")}`
  );
  const first = mapped[0];
  const last = mapped[mapped.length - 1];
  if (first) console.log(`  Earliest:            ${first.startsAt.toISOString()} ${first.awayTeamName} @ ${first.homeTeamName}`);
  if (last) console.log(`  Latest:              ${last.startsAt.toISOString()} ${last.awayTeamName} @ ${last.homeTeamName}`);
  console.log(`  Venues in mapped set: ${new Set(mapped.map((game) => game.venueSlug)).size}`);

  const blocked =
    skipped.length > 0 ||
    unresolved.size > 0 ||
    plan.duplicateExternalIds.length > 0 ||
    plan.nullExternalIds > 0 ||
    duplicateEventIds.length > 0;

  if (blocked) {
    console.error("\n  Not writing. Resolve skips, venues, or duplicate ids first.\n");
    process.exitCode = 1;
    return;
  }

  if (!apply) {
    console.log("\n  Dry run only. Re-run with --apply to write this league.\n");
    return;
  }

  const syncNow = new Date();
  for (const game of [...plan.create, ...plan.update]) {
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      throw new Error(`Venue ${game.venueSlug} disappeared before write (${game.externalId})`);
    }
    const data = arenaMappedGameToPrismaData(game, venueId);
    await prisma.game.upsert({
      where: { externalId: game.externalId },
      create: data,
      update: { ...data, updatedAt: syncNow }
    });
  }

  const after = await prisma.game.count({ where: { league, season } });
  console.log(`\n  Done. ${league} ${season} Game rows now: ${after}\n`);
}
