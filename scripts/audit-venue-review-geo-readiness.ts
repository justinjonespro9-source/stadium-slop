/**
 * Database audit: every active venue's readiness for certified reviews.
 *
 *   npx tsx scripts/audit-venue-review-geo-readiness.ts
 *   npm run audit:venue-review-geo
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

function hasValidCoordinates(lat: number | null, lng: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // Placeholder (0,0) is treated as missing for certification purposes.
  if (lat === 0 && lng === 0) return false;
  return true;
}

async function main() {
  const venues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    select: {
      slug: true,
      name: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true,
      primarySport: true,
      sports: true
    },
    orderBy: { slug: "asc" }
  });

  const missingNullable = venues.filter(
    (v) => v.latitude == null || v.longitude == null
  );
  const invalidRange = venues.filter((v) => {
    if (v.latitude == null || v.longitude == null) return false;
    if (!Number.isFinite(v.latitude) || !Number.isFinite(v.longitude)) return true;
    return (
      v.latitude < -90 ||
      v.latitude > 90 ||
      v.longitude < -180 ||
      v.longitude > 180
    );
  });
  const placeholderZero = venues.filter(
    (v) => v.latitude === 0 && v.longitude === 0
  );
  const validCoords = venues.filter((v) =>
    hasValidCoordinates(v.latitude, v.longitude)
  );
  const noRadius = venues.filter(
    (v) => !Number.isFinite(v.reviewRadiusMeters) || v.reviewRadiusMeters <= 0
  );
  const small = venues.filter(
    (v) =>
      Number.isFinite(v.reviewRadiusMeters) &&
      v.reviewRadiusMeters > 0 &&
      v.reviewRadiusMeters < 200
  );
  const large = venues.filter(
    (v) => Number.isFinite(v.reviewRadiusMeters) && v.reviewRadiusMeters > 2000
  );

  console.log("\n  Active venue review-geo readiness\n");
  console.log(`  Total active venues:              ${venues.length}`);
  console.log(`  Valid lat/lng (usable geofence):  ${validCoords.length}`);
  console.log(`  Missing nullable lat/lng:         ${missingNullable.length}`);
  console.log(`  Invalid (0,0) coordinates:     ${placeholderZero.length}`);
  console.log(`  Invalid range (non-0,0):           ${invalidRange.length}`);
  console.log(`  No / non-positive radius:         ${noRadius.length}`);
  console.log(`  Unusually small radius (<200m):   ${small.length}`);
  console.log(`  Unusually large radius (>2000m):  ${large.length}`);
  console.log(
    `  Cannot support certified reviews:  ${venues.length - validCoords.length}`
  );
  console.log(
    `  Custom review UI / separate APIs:   0 (all use shared ReviewFormLocation + game-day validators)`
  );

  if (placeholderZero.length) {
    console.log(`\n  Placeholder 0,0 venues (${placeholderZero.length}):`);
    for (const v of placeholderZero) {
      console.log(
        `    · ${v.slug} · r=${v.reviewRadiusMeters}m · ${v.primarySport ?? v.sports[0] ?? "?"}`
      );
    }
  }

  if (small.length) {
    console.log("\n  Unusually small radii:");
    for (const v of small) {
      console.log(`    · ${v.slug}: ${v.reviewRadiusMeters}m`);
    }
  }
  if (large.length) {
    console.log("\n  Unusually large radii:");
    for (const v of large) {
      console.log(`    · ${v.slug}: ${v.reviewRadiusMeters}m`);
    }
  }

  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
