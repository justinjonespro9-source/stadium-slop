/**
 * Upsert placeholder MLB home games for Game Day Mode development.
 *
 * Usage: npm run seed:game-schedule
 *
 * TODO: Replace mock rows with SportsDataIO / Sportradar / TheSportsDB import.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  getMockMlbGameSeeds,
  mockMlbGameToPrismaData
} from "../lib/schedules/mock-mlb-schedule";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const seedNow = new Date();
  const rows = getMockMlbGameSeeds(seedNow);
  let upserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const venue = await prisma.venue.findUnique({
      where: { slug: row.venueSlug },
      select: { id: true, slug: true }
    });

    if (!venue) {
      console.warn(`Skipping game ${row.externalId}: venue "${row.venueSlug}" not in DB`);
      skipped += 1;
      continue;
    }

    const data = mockMlbGameToPrismaData(row, venue.id);
    await prisma.game.upsert({
      where: { externalId: row.externalId },
      create: data,
      update: {
        ...data,
        updatedAt: seedNow
      }
    });
    upserted += 1;
    console.log(
      `Upserted ${row.externalId} @ ${venue.slug} — ${row.awayTeamName} @ ${row.homeTeamSlug} (${row.startsAt.toISOString()})`
    );
  }

  console.log(`Done. ${upserted} upserted, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
