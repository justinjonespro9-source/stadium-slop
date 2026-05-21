"use server";

import { GameStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  applyRecalculatedPollingWindow,
  extendPollingClosesAt,
  parseDatetimeLocalValue
} from "@/lib/admin/games";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

const GAME_STATUSES = new Set<string>(Object.values(GameStatus));

function revalidateGamePaths(gameId: string, venueSlug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${gameId}`);
  revalidatePath(`/venues/${venueSlug}`);
}

async function loadGameForAdmin(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      venue: { select: { slug: true } }
    }
  });
}

function redirectGameDetail(
  gameId: string,
  params: { error?: string; updated?: string }
) {
  const search = new URLSearchParams();
  if (params.error) search.set("error", params.error);
  if (params.updated) search.set("updated", params.updated);
  const qs = search.toString();
  redirect(`/admin/games/${gameId}${qs ? `?${qs}` : ""}`);
}

export async function updateGameSchedule(formData: FormData) {
  await requireAdminAccess();

  const gameId = String(formData.get("gameId") ?? "").trim();
  if (!gameId) {
    redirect("/admin/games?error=missing-game");
  }

  const game = await loadGameForAdmin(gameId);
  if (!game) {
    redirect("/admin/games?error=not-found");
  }

  const startsAt = parseDatetimeLocalValue(String(formData.get("startsAt") ?? ""));
  const pollingOpensAt = parseDatetimeLocalValue(
    String(formData.get("pollingOpensAt") ?? "")
  );
  const pollingClosesAt = parseDatetimeLocalValue(
    String(formData.get("pollingClosesAt") ?? "")
  );
  const awayTeamName = String(formData.get("awayTeamName") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  const recalculateWindow = formData.get("recalculateWindow") === "1";

  if (!startsAt || !pollingOpensAt || !pollingClosesAt || !awayTeamName) {
    redirectGameDetail(gameId, { error: "invalid-fields" });
  }

  if (!GAME_STATUSES.has(statusRaw)) {
    redirectGameDetail(gameId, { error: "invalid-status" });
  }

  if (pollingClosesAt.getTime() < pollingOpensAt.getTime()) {
    redirectGameDetail(gameId, { error: "invalid-window" });
  }

  const status = statusRaw as GameStatus;
  const windowPatch = recalculateWindow
    ? applyRecalculatedPollingWindow(startsAt)
    : {};

  await prisma.game.update({
    where: { id: gameId },
    data: {
      startsAt,
      awayTeamName,
      status,
      pollingOpensAt: windowPatch.pollingOpensAt ?? pollingOpensAt,
      pollingClosesAt: windowPatch.pollingClosesAt ?? pollingClosesAt,
      estimatedEndsAt: windowPatch.estimatedEndsAt ?? undefined
    }
  });

  revalidateGamePaths(gameId, game.venue.slug);
  redirectGameDetail(gameId, {
    updated: recalculateWindow ? "recalculated" : "saved"
  });
}

export async function extendGameReviewWindow(formData: FormData) {
  await requireAdminAccess();

  const gameId = String(formData.get("gameId") ?? "").trim();
  const extend = String(formData.get("extend") ?? "").trim();

  if (!gameId) {
    redirect("/admin/games?error=missing-game");
  }

  if (extend !== "1h" && extend !== "2h" && extend !== "eod") {
    redirectGameDetail(gameId, { error: "invalid-extend" });
  }

  const existing = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      pollingClosesAt: true,
      startsAt: true,
      venue: { select: { slug: true } }
    }
  });

  if (!existing) {
    redirect("/admin/games?error=not-found");
  }

  const currentClose = existing.pollingClosesAt;
  if (!currentClose) {
    redirectGameDetail(gameId, { error: "invalid-window" });
  }

  const nextClose = extendPollingClosesAt(
    currentClose,
    extend,
    existing.startsAt
  );

  if (nextClose.getTime() === currentClose.getTime()) {
    redirectGameDetail(gameId, { error: "extend-unchanged" });
  }

  await prisma.game.update({
    where: { id: gameId },
    data: { pollingClosesAt: nextClose }
  });

  revalidateGamePaths(gameId, existing.venue.slug);
  redirectGameDetail(gameId, { updated: "extended" });
}