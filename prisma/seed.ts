import { foodItems, vendors, venues } from "../lib/sample-data";

async function main() {
  console.log("Stadium Slop seed placeholder");
  console.log(
    `Ready to seed ${venues.length} venues, ${vendors.length} vendors, and ${foodItems.length} items from lib/sample-data.ts.`
  );
  console.log("Database writes are intentionally not enabled yet.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
