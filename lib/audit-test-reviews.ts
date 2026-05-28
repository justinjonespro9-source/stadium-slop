import { EntityStatus, type PrismaClient } from "@prisma/client";

import { DEMO_USERS } from "@/lib/demo-density-seed";
import { DEV_SCORECARD_PREFIX } from "@/lib/dev-demo-scorecards";
import {
  MOCK_REVIEWER_EMAIL,
  MOCK_REVIEWER_USER_ID
} from "@/lib/user-auth";

export type TestReviewFlagReason =
  | "already_test_review"
  | "already_hidden_or_archived"
  | "dev_scorecard_seed_id"
  | "dev_scorecard_game_day_key"
  | "demo_seed_user"
  | "mock_reviewer_user"
  | "picsum_placeholder_photo"
  | "note_test_keyword"
  | "note_lorem_ipsum"
  | "photo_text_shoe_non_food"
  | "photo_url_placeholder";

/** Strong signals safe for automated apply (mark test + hide). */
export const AUTO_APPLY_FLAG_REASONS: ReadonlySet<TestReviewFlagReason> = new Set([
  "already_test_review",
  "dev_scorecard_seed_id",
  "dev_scorecard_game_day_key",
  "demo_seed_user",
  "mock_reviewer_user",
  "picsum_placeholder_photo",
  "note_test_keyword",
  "note_lorem_ipsum"
]);

const NOTE_TEST_PATTERN =
  /\b(test|asdf|qwerty|delete\s*me|placeholder|fake\s*review|sample\s*review)\b/i;
const NOTE_LOREM_PATTERN = /\b(lorem\s+ipsum|ipsum\s+dolor)\b/i;
const SHOE_NON_FOOD_PATTERN =
  /\b(shoe|shoes|sneaker|sneakers|footwear|boots|nike\s+air|jordan\s+\d)\b/i;
const PLACEHOLDER_URL_PATTERN =
  /picsum\.photos|placeholder\.com|via\.placeholder|dummyimage\.com/i;

const DEMO_USER_IDS = new Set<string>(DEMO_USERS.map((u) => u.id));

export type AuditedTestReviewRow = {
  reviewId: string;
  foodItem: string;
  foodSlug: string;
  venue: string;
  venueSlug: string;
  photoUrls: string[];
  reviewerDisplay: string;
  reviewerEmail: string | null;
  reviewerId: string;
  note: string | null;
  createdAt: Date;
  status: EntityStatus;
  isTestReview: boolean;
  flags: TestReviewFlagReason[];
  autoApply: boolean;
};

export type TestReviewAuditSummary = {
  rows: AuditedTestReviewRow[];
  flagged: AuditedTestReviewRow[];
  autoApplyCandidates: AuditedTestReviewRow[];
  alreadyExcluded: number;
};

function collectPhotoText(
  photos: { url: string | null; alt: string; caption: string | null }[]
): string {
  return photos
    .map((p) => [p.url, p.alt, p.caption].filter(Boolean).join(" "))
    .join(" ");
}

function flagReview(row: {
  id: string;
  gameDayKey: string;
  note: string | null;
  status: EntityStatus;
  isTestReview: boolean;
  userId: string;
  user: { id: string; email: string; displayName: string; handle: string };
  photos: { url: string | null; alt: string; caption: string | null }[];
}): TestReviewFlagReason[] {
  const flags = new Set<TestReviewFlagReason>();

  if (row.isTestReview) {
    flags.add("already_test_review");
  }
  if (row.status !== EntityStatus.ACTIVE) {
    flags.add("already_hidden_or_archived");
  }
  if (row.id.startsWith(`${DEV_SCORECARD_PREFIX}-`)) {
    flags.add("dev_scorecard_seed_id");
  }
  if (row.gameDayKey.includes(DEV_SCORECARD_PREFIX)) {
    flags.add("dev_scorecard_game_day_key");
  }
  if (DEMO_USER_IDS.has(row.userId) || row.user.email.endsWith("@demo.stadium-slop.invalid")) {
    flags.add("demo_seed_user");
  }
  if (row.userId === MOCK_REVIEWER_USER_ID || row.user.email === MOCK_REVIEWER_EMAIL) {
    flags.add("mock_reviewer_user");
  }

  const note = row.note?.trim() ?? "";
  if (note && NOTE_TEST_PATTERN.test(note)) {
    flags.add("note_test_keyword");
  }
  if (note && NOTE_LOREM_PATTERN.test(note)) {
    flags.add("note_lorem_ipsum");
  }

  const photoBlob = collectPhotoText(row.photos);
  if (PLACEHOLDER_URL_PATTERN.test(photoBlob)) {
    flags.add(row.photos.some((p) => /picsum\.photos/i.test(p.url ?? ""))
      ? "picsum_placeholder_photo"
      : "photo_url_placeholder");
  }
  if (SHOE_NON_FOOD_PATTERN.test(photoBlob)) {
    flags.add("photo_text_shoe_non_food");
  }

  return [...flags];
}

function isAutoApply(flags: TestReviewFlagReason[]): boolean {
  return flags.some((f) => AUTO_APPLY_FLAG_REASONS.has(f));
}

export async function auditLikelyTestReviews(
  prisma: PrismaClient
): Promise<TestReviewAuditSummary> {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      gameDayKey: true,
      note: true,
      status: true,
      isTestReview: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true
        }
      },
      foodItem: {
        select: { name: true, slug: true }
      },
      venue: {
        select: { name: true, slug: true }
      },
      photos: {
        select: {
          url: true,
          alt: true,
          caption: true,
          status: true
        }
      }
    }
  });

  const rows: AuditedTestReviewRow[] = reviews.map((review) => {
    const activePhotos = review.photos.filter((p) => p.status === EntityStatus.ACTIVE);
    const flags = flagReview({
      ...review,
      photos: activePhotos.length > 0 ? activePhotos : review.photos
    });

    return {
      reviewId: review.id,
      foodItem: review.foodItem.name,
      foodSlug: review.foodItem.slug,
      venue: review.venue.name,
      venueSlug: review.venue.slug,
      photoUrls: review.photos
        .map((p) => p.url?.trim())
        .filter((url): url is string => Boolean(url)),
      reviewerDisplay: `${review.user.displayName} (${review.user.handle})`,
      reviewerEmail: review.user.email,
      reviewerId: review.userId,
      note: review.note,
      createdAt: review.createdAt,
      status: review.status,
      isTestReview: review.isTestReview,
      flags,
      autoApply: isAutoApply(flags)
    };
  });

  const flagged = rows.filter((r) => r.flags.length > 0);
  const autoApplyCandidates = flagged.filter((r) => r.autoApply);
  const alreadyExcluded = rows.filter(
    (r) => r.isTestReview || r.status !== EntityStatus.ACTIVE
  ).length;

  return {
    rows,
    flagged,
    autoApplyCandidates,
    alreadyExcluded
  };
}

export type ApplyTestReviewCleanupResult = {
  reviewsMarkedTest: number;
  reviewsHidden: number;
  photosHidden: number;
  skippedNotFlagged: number;
};

/**
 * Marks flagged reviews as test content and hides them from public surfaces.
 * Does not delete rows — preserves admin/contributor upload flows.
 */
export async function applyTestReviewCleanup(
  prisma: PrismaClient,
  reviewIds: string[]
): Promise<ApplyTestReviewCleanupResult> {
  if (reviewIds.length === 0) {
    return {
      reviewsMarkedTest: 0,
      reviewsHidden: 0,
      photosHidden: 0,
      skippedNotFlagged: 0
    };
  }

  const audit = await auditLikelyTestReviews(prisma);
  const allowed = new Set(
    audit.autoApplyCandidates.map((row) => row.reviewId)
  );
  const toApply = reviewIds.filter((id) => allowed.has(id));
  const skippedNotFlagged = reviewIds.length - toApply.length;

  if (toApply.length === 0) {
    return {
      reviewsMarkedTest: 0,
      reviewsHidden: 0,
      photosHidden: 0,
      skippedNotFlagged
    };
  }

  const reviewUpdate = await prisma.review.updateMany({
    where: { id: { in: toApply } },
    data: {
      isTestReview: true,
      status: EntityStatus.HIDDEN
    }
  });

  const photoUpdate = await prisma.foodPhoto.updateMany({
    where: { reviewId: { in: toApply } },
    data: { status: EntityStatus.HIDDEN }
  });

  return {
    reviewsMarkedTest: reviewUpdate.count,
    reviewsHidden: reviewUpdate.count,
    photosHidden: photoUpdate.count,
    skippedNotFlagged
  };
}
