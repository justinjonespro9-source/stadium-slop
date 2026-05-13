-- CreateEnum
CREATE TYPE "ReplayValue" AS ENUM ('GAME_DAY_STARTER', 'SOLID_ROTATION_PICK', 'BENCH_OPTION', 'CUT_FROM_THE_ROSTER');

-- CreateEnum
CREATE TYPE "PriceCheck" AS ENUM ('WORTH_THE_PRICE_OF_ADMISSION', 'FAIR_DEAL', 'STADIUM_TAX');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "replayValue" "ReplayValue",
ADD COLUMN "priceCheck" "PriceCheck";
