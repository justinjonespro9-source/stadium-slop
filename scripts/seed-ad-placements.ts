/**
 * Seed house ads for SNG LABS and Team-M8tes.
 *
 * Usage: npx tsx scripts/seed-ad-placements.ts
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type SeedAd = {
  placementKey: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  sponsorName: string;
};

const TEAM_M8TES: Omit<SeedAd, "placementKey"> = {
  title: "Single sports fan? Find your Team-M8.",
  body: "Team-M8tes connects fans through the teams they love — because loyalty matters.",
  ctaLabel: "Check it out",
  ctaHref: "https://team-m8tes.com",
  sponsorName: "Team-M8tes"
};

const SNG_LABS: Omit<SeedAd, "placementKey"> = {
  title: "Built by SNG LABS",
  body: "Fan-first products for sports, food, games, and live experiences.",
  ctaLabel: "Learn more",
  ctaHref: "/claim",
  sponsorName: "SNG LABS"
};

const PLACEMENTS: SeedAd[] = [
  { placementKey: "home.hero.secondary", ...SNG_LABS },
  { placementKey: "home.featured.banner", ...TEAM_M8TES },
  { placementKey: "venue.sidebar", ...SNG_LABS },
  { placementKey: "venue.mobile.inline", ...TEAM_M8TES },
  { placementKey: "item.detail.inline", ...TEAM_M8TES },
  { placementKey: "rankings.banner", ...SNG_LABS },
  { placementKey: "worldcup.guide.banner", ...TEAM_M8TES },
  { placementKey: "review.confirmation", ...SNG_LABS }
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  for (const seed of PLACEMENTS) {
    const existing = await prisma.adPlacement.findFirst({
      where: { placementKey: seed.placementKey },
      orderBy: { updatedAt: "desc" }
    });

    const data = {
      placementKey: seed.placementKey,
      title: seed.title,
      body: seed.body,
      ctaLabel: seed.ctaLabel,
      ctaHref: seed.ctaHref,
      sponsorName: seed.sponsorName,
      status: EntityStatus.ACTIVE,
      startsAt: null,
      endsAt: null
    };

    if (existing) {
      await prisma.adPlacement.update({
        where: { id: existing.id },
        data
      });
      console.log(`Updated ad: ${seed.placementKey}`);
    } else {
      await prisma.adPlacement.create({ data });
      console.log(`Created ad: ${seed.placementKey}`);
    }
  }

  const count = await prisma.adPlacement.count({
    where: { status: EntityStatus.ACTIVE }
  });
  console.log(`\nActive ad placements: ${count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
