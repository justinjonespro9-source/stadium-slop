import { prisma } from "./prisma";
import {
  MOCK_REVIEWER_EMAIL,
  MOCK_REVIEWER_USER_ID,
  mockReviewerProfile
} from "./user-auth";

export async function ensureMockReviewerUser(homeVenueId?: string) {
  return prisma.user.upsert({
    where: { id: MOCK_REVIEWER_USER_ID },
    update: {
      email: MOCK_REVIEWER_EMAIL,
      ...(homeVenueId !== undefined ? { homeVenueId } : {})
    },
    create: {
      id: MOCK_REVIEWER_USER_ID,
      email: MOCK_REVIEWER_EMAIL,
      displayName: mockReviewerProfile.displayName,
      handle: mockReviewerProfile.handle,
      homeVenueId
    }
  });
}
