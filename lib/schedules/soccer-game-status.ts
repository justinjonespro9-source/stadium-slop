import { GameStatus } from "@prisma/client";

/** Map soccer feed status strings to Prisma `GameStatus`. */
export function mapSoccerFeedStatusToGameStatus(
  rawStatus: string | undefined,
  options?: { hasFinalScore?: boolean }
): GameStatus {
  const status = (rawStatus ?? "").trim().toLowerCase();

  if (
    status.includes("postpon") ||
    status.includes("delayed") ||
    status === "ppd"
  ) {
    return GameStatus.POSTPONED;
  }

  if (status.includes("cancel") || status === "canc") {
    return GameStatus.CANCELED;
  }

  if (
    status.includes("final") ||
    status.includes("whistle") ||
    status.includes("full time") ||
    status.includes("fulltime") ||
    status === "played" ||
    options?.hasFinalScore
  ) {
    return GameStatus.FINAL;
  }

  if (
    status.includes("live") ||
    status.includes("progress") ||
    status.includes("half") ||
    status.includes("1st") ||
    status.includes("2nd")
  ) {
    return GameStatus.LIVE;
  }

  return GameStatus.SCHEDULED;
}
