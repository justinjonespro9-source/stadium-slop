import Link from "next/link";
import { notFound } from "next/navigation";
import { GameStatus } from "@prisma/client";

import {
  extendGameReviewWindow,
  updateGameSchedule
} from "@/app/admin/games/actions";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import {
  formatAdminGameDateTime,
  formatVenueTimeZoneAbbrev,
  gameStatusLabel,
  getVenueTimeZone,
  toDatetimeLocalValueForTimeZone
} from "@/lib/admin/games";
import {
  formatGameDayPollingWindowHoursLabel,
  formatGameDayPollingWindowRangeForVenue
} from "@/lib/game-day";
import { formatGameDisplayName } from "@/lib/game-display";
import { prisma } from "@/lib/prisma";

type AdminGameDetailPageProps = {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function flashMessage(error?: string, updated?: string) {
  if (error === "invalid-fields") {
    return "Check all date/time fields and away team name.";
  }
  if (error === "invalid-status") return "Invalid game status.";
  if (error === "invalid-window") {
    return "Polling close must be after polling open.";
  }
  if (error === "extend-unchanged") {
    return "Review window is already at or past that extension.";
  }
  if (updated === "saved") return "Game schedule saved.";
  if (updated === "recalculated") {
    return "Schedule saved with polling window recalculated from first pitch.";
  }
  if (updated === "extended") return "Review window extended.";
  return null;
}

export default async function AdminGameDetailPage({
  params,
  searchParams
}: AdminGameDetailPageProps) {
  await requireAdminAccess();
  const { gameId } = await params;
  const query = await searchParams;
  const flash = flashMessage(query.error, query.updated);

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      league: true,
      season: true,
      homeTeamSlug: true,
      homeTeamName: true,
      awayTeamName: true,
      isNeutralSite: true,
      startsAt: true,
      pollingOpensAt: true,
      pollingClosesAt: true,
      estimatedEndsAt: true,
      status: true,
      externalId: true,
      createdAt: true,
      updatedAt: true,
      venue: {
        select: { id: true, name: true, slug: true, state: true, country: true }
      }
    }
  });

  if (!game) {
    notFound();
  }

  const matchupLabel = formatGameDisplayName(game);
  const venueTimeZone = getVenueTimeZone(game.venue);
  const venueZoneLabel = formatVenueTimeZoneAbbrev(venueTimeZone, game.startsAt);
  const now = new Date();
  const pollingActive =
    now >= game.pollingOpensAt &&
    now < game.pollingClosesAt &&
    game.status !== "CANCELED" &&
    game.status !== "POSTPONED";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin/games"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to game schedules
        </Link>

        <header className="brand-card mt-5 rounded-3xl border p-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            {game.league} · {game.season}
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {matchupLabel}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {game.venue.name} ·{" "}
            <Link
              href={`/venues/${game.venue.slug}`}
              className="font-bold text-[var(--slop-orange)] hover:underline"
            >
              Public venue page
            </Link>
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
            Times in venue local · {venueTimeZone} ({venueZoneLabel})
          </p>
          <dl className="mt-4 grid gap-2 text-sm text-zinc-500 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">External ID</dt>
              <dd className="mt-0.5 font-mono text-zinc-300">
                {game.externalId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">Polling now</dt>
              <dd className="mt-0.5 font-bold text-zinc-300">
                {pollingActive ? "Active window" : "Not active"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">Last updated</dt>
              <dd className="mt-0.5">
                {formatAdminGameDateTime(game.updatedAt, venueTimeZone)}
              </dd>
            </div>
            {game.estimatedEndsAt ? (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider">
                  Est. end
                </dt>
                <dd className="mt-0.5">
                  {formatAdminGameDateTime(game.estimatedEndsAt, venueTimeZone)}
                </dd>
              </div>
            ) : null}
          </dl>
        </header>

        {flash ? (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-900/80 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100"
          >
            {flash}
          </p>
        ) : null}

        <form
          action={updateGameSchedule}
          className="brand-card mt-6 space-y-5 rounded-3xl border p-5"
        >
          <input type="hidden" name="gameId" value={game.id} />

          <h2 className="text-lg font-black">Edit schedule</h2>
          <p className="text-sm text-zinc-500">
            Default window rule: {formatGameDayPollingWindowHoursLabel()}. Current
            range (venue local):{" "}
            {formatGameDayPollingWindowRangeForVenue(
              game.pollingOpensAt,
              game.pollingClosesAt,
              venueTimeZone
            )}
            .
          </p>

          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Away team
            <input
              name="awayTeamName"
              type="text"
              required
              defaultValue={game.awayTeamName}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Status
            <select
              name="status"
              defaultValue={game.status}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {Object.values(GameStatus).map((status) => (
                <option key={status} value={status}>
                  {gameStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            First pitch (startsAt)
            <input
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocalValueForTimeZone(
                game.startsAt,
                venueTimeZone
              )}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Polling opens
            <input
              name="pollingOpensAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocalValueForTimeZone(
                game.pollingOpensAt,
                venueTimeZone
              )}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Polling closes
            <input
              name="pollingClosesAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocalValueForTimeZone(
                game.pollingClosesAt,
                venueTimeZone
              )}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
            <button
              type="submit"
              className="rounded-full border border-[var(--slop-orange)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-orange)]"
            >
              Save changes
            </button>
            <button
              type="submit"
              name="recalculateWindow"
              value="1"
              className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-200"
            >
              Save &amp; recalc window from first pitch
            </button>
          </div>
        </form>

        <section className="brand-card mt-6 rounded-3xl border p-5">
          <h2 className="text-lg font-black">Extend review window</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Pushes polling close later for rain delays or extra innings. Closes at{" "}
            {formatAdminGameDateTime(game.pollingClosesAt, venueTimeZone)} (venue
            local).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["1h", "+1 hour"],
                ["2h", "+2 hours"],
                ["eod", "End of day"]
              ] as const
            ).map(([extend, label]) => (
              <form key={extend} action={extendGameReviewWindow}>
                <input type="hidden" name="gameId" value={game.id} />
                <input type="hidden" name="extend" value={extend} />
                <button
                  type="submit"
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-300 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
