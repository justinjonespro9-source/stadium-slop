import { prisma } from "@/lib/prisma";
import { slugFilterInsensitive } from "@/lib/public-data";

export type ResolvedPriceReportTarget = {
  venue: {
    id: string;
    slug: string;
    name: string;
  };
  foodItem: {
    id: string;
    slug: string;
    name: string;
    basePrice: { toString(): string } | null;
    reportedPrice: { toString(): string } | null;
  };
};

/** Resolve ACTIVE venue + food item for fan price reports (case-insensitive slugs). */
export async function resolveFoodItemForPriceReport(
  venueSlug: string,
  foodSlug: string
): Promise<ResolvedPriceReportTarget | null> {
  const normalizedVenue = venueSlug.trim();
  const normalizedFood = decodeURIComponent(foodSlug).trim();

  if (!normalizedVenue || !normalizedFood) {
    return null;
  }

  const venue = await prisma.venue.findFirst({
    where: {
      slug: slugFilterInsensitive(normalizedVenue),
      status: "ACTIVE"
    },
    select: { id: true, slug: true, name: true }
  });

  if (!venue) {
    return null;
  }

  const foodItem = await prisma.foodItem.findFirst({
    where: {
      slug: slugFilterInsensitive(normalizedFood),
      status: "ACTIVE",
      venueId: venue.id
    },
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true,
      reportedPrice: true
    }
  });

  if (!foodItem) {
    return null;
  }

  return { venue, foodItem };
}

export function formatPriceUsd(
  value: { toString(): string } | number | null | undefined
): string | null {
  if (value == null) {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `$${n.toFixed(2)}`;
}
