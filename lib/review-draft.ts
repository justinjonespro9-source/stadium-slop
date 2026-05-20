import { PhotoType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { buildGameDayKey } from "@/lib/game-day";

export async function findTodaysReviewForItem(options: {
  userId: string;
  foodItemId: string;
  venueSlug: string;
}) {
  const gameDayKey = buildGameDayKey(options.venueSlug, new Date());

  return prisma.review.findUnique({
    where: {
      userId_foodItemId_gameDayKey: {
        userId: options.userId,
        foodItemId: options.foodItemId,
        gameDayKey
      }
    },
    include: {
      photos: {
        where: { status: "ACTIVE", photoType: PhotoType.FOOD },
        orderBy: { createdAt: "desc" },
        take: 3
      }
    }
  });
}
