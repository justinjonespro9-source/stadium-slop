/**
 * Persist shared-venue team tenants on Venue.teams[] (no menu duplication).
 *
 * Usage: npx tsx scripts/sync-shared-venue-teams.ts
 */

import { prisma } from "../lib/prisma";
import { resolveVenueTeams } from "../lib/venue-teams";

async function main() {
  const venues = await prisma.venue.findMany({
    select: { id: true, slug: true, name: true, teams: true }
  });

  let updated = 0;
  for (const venue of venues) {
    const next = resolveVenueTeams(venue.slug, venue.teams);
    const changed =
      next.length !== venue.teams.length ||
      next.some((team, i) => team !== venue.teams[i]);
    if (!changed) {
      continue;
    }
    await prisma.venue.update({
      where: { id: venue.id },
      data: { teams: next }
    });
    updated += 1;
    console.log(`${venue.slug}: ${venue.teams.join(" | ")} → ${next.join(" | ")}`);
  }

  console.log(`Updated ${updated} of ${venues.length} venues.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
