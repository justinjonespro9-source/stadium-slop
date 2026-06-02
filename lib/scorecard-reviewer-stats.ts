import "server-only";

import { prisma } from "@/lib/prisma";

export type ReviewerCareerStats = {
  venuesReviewed: number;
  itemsReviewed: number;
  helpfulEarned: number;
};

/** Lifetime public stats for scorecard backs (per reviewer). */
export async function reviewerCareerStatsByUserId(
  userIds: string[]
): Promise<Map<string, ReviewerCareerStats>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, ReviewerCareerStats>();
  if (unique.length === 0) {
    return map;
  }

  const [users, venueGroups] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: unique } },
      select: {
        id: true,
        helpfulLikesReceived: true,
        _count: {
          select: {
            reviews: { where: { status: "ACTIVE", isTestReview: false } }
          }
        }
      }
    }),
    prisma.review.groupBy({
      by: ["userId", "venueId"],
      where: { userId: { in: unique }, status: "ACTIVE", isTestReview: false }
    })
  ]);

  const venuesByUser = new Map<string, number>();
  for (const row of venueGroups) {
    venuesByUser.set(row.userId, (venuesByUser.get(row.userId) ?? 0) + 1);
  }

  for (const user of users) {
    map.set(user.id, {
      venuesReviewed: venuesByUser.get(user.id) ?? 0,
      itemsReviewed: user._count.reviews,
      helpfulEarned: user.helpfulLikesReceived
    });
  }

  return map;
}
