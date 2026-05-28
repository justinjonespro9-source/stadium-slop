-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "placementKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "sponsorName" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdPlacement_placementKey_status_idx" ON "AdPlacement"("placementKey", "status");
