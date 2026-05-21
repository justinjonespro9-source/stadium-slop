/**
 * Lightweight timezone sanity check for flagship MLB parks.
 * Usage: npx tsx scripts/verify-venue-timezones.ts
 */
import { verifyVenueTimezoneSamples } from "../lib/venue-timezone";

const results = verifyVenueTimezoneSamples();
let failed = 0;

for (const row of results) {
  const status = row.ok ? "OK" : "FAIL";
  if (!row.ok) failed += 1;
  console.log(`${status} · ${row.label}`);
  console.log(`  ${row.utc} → ${row.display} (${row.timeZone})`);
}

if (failed > 0) {
  console.error(`\n${failed} sample(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${results.length} samples passed.`);
