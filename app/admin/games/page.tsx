import Link from "next/link";
import { GameStatus } from "@prisma/client";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import {
  buildAdminGamesWhere,
  formatAdminGameDateTime,
  gameStatusLabel,
  type AdminGamesListFilters
} from "@/lib/admin/games";
import { formatHomeTeamLabel } from "@/lib/game-day";
import { prisma } from "@/lib/prisma";

type AdminGamesPageProps = {
  searchParams: Promise<{
    league?: string;
    status?: string;
    q?: string;
    range?: string;
    error?: string;
  }>;
};

const RANGE_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" }
] as const;

function parseRange(raw?: string): AdminGamesListFilters["range"] {
  if (raw === "past" || raw === "all" || raw === "upcoming") {
    return raw;
  }
  return "upcoming";
}

function parseStatus(raw?: string): GameStatus | undefined {
  if (raw && Object.values(GameStatus).includes(raw as GameStatus)) {
    return raw as GameStatus;
  }
  return undefined;
}

function listErrorMessage(error?: string) {
  if (error === "missing-game") return "Missing game id for that action.";
  if (error === "not-found") return "Game not found.";
  return null;
}

export default async function AdminGamesPage({ searchParams }: AdminGamesPageProps) {
  await requireAdminAccess();

  const params = await searchParams;
  const filters: AdminGamesListFilters = {
    league: params.league?.trim() || undefined,
    status: parseStatus(params.status),
    q: params.q?.trim() || undefined,
    range: parseRange(params.range)
  };

  const where = buildAdminGamesWhere(filters);
  const now = new Date();
  const orderBy =
    filters.range === "past"
      ? ({ startsAt: "desc" as const })
      : ({ startsAt: "asc" as const });

  const [games, total, leagues] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      take: 250,
      select: {
        id: true,
        league: true,
        season: true,
        homeTeamSlug: true,
        awayTeamName: true,
        startsAt: true,
        pollingOpensAt: true,
        pollingClosesAt: true,
        status: true,
        externalId: true,
        venue: { select: { name: true, slug: true } }
      }
    }),
    prisma.game.count({ where }),
    prisma.game.findMany({
      distinct: ["league"],
      select: { league: true },
      orderBy: { league: "asc" }
    })
  ]);

  const listError = listErrorMessage(params.error);

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to admin
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Game schedules
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Home games
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Review imported MLB games and adjust first pitch, polling windows, and
            status for delays or postponements. Public venue pages still only show
            the active window or next home game.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
            {total} game{total === 1 ? "" : "s"}
            {games.length < total ? ` · showing ${games.length}` : ""}
          </p>
        </header>

        {listError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-sm text-amber-100"
          >
            {listError}
          </p>
        ) : null}

        <form
          className="mt-6 grid gap-3 rounded-[2rem] border border-zinc-800 bg-black/40 p-4 sm:grid-cols-2 lg:grid-cols-5"
          method="get"
          action="/admin/games"
        >
          <label className="grid gap-2 text-sm font-bold text-zinc-300 lg:col-span-2">
            Venue / team search
            <input
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              placeholder="Venue slug, team, external id"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            League
            <select
              name="league"
              defaultValue={filters.league ?? ""}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">All leagues</option>
              {leagues.map((row) => (
                <option key={row.league} value={row.league}>
                  {row.league}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Status
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">Any status</option>
              {Object.values(GameStatus).map((status) => (
                <option key={status} value={status}>
                  {gameStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            When
            <select
              name="range"
              defaultValue={filters.range ?? "upcoming"}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              className="rounded-full border border-[var(--slop-orange)] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)]"
            >
              Apply filters
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-zinc-600">
          Sync MLB: <code className="text-zinc-400">npm run sync:mlb-schedule</code>
          {" · "}
          Demo seed: <code className="text-zinc-400">npm run seed:game-schedule</code>
          {/* TODO: MLS schedule import and filters when league data is wired. */}
        </p>

        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-zinc-800">
          <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-black/80 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-4 py-3">League</th>
                <th className="px-4 py-3">Home</th>
                <th className="px-4 py-3">Away</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Starts</th>
                <th className="px-4 py-3">Poll opens</th>
                <th className="px-4 py-3">Poll closes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">External ID</th>
                <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                    No games match these filters.
                  </td>
                </tr>
              ) : (
                games.map((game) => {
                  const isActive =
                    now >= game.pollingOpensAt &&
                    now <= game.pollingClosesAt &&
                    game.status !== "CANCELED" &&
                    game.status !== "POSTPONED";
                  return (
                    <tr
                      key={game.id}
                      className="border-b border-zinc-900/80 hover:bg-zinc-950/50"
                    >
                      <td className="px-4 py-3 font-bold">{game.league}</td>
                      <td className="px-4 py-3">
                        {formatHomeTeamLabel(game.homeTeamSlug)}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{game.awayTeamName}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold">{game.venue.name}</span>
                        <p className="text-xs text-zinc-500">{game.venue.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {formatAdminGameDateTime(game.startsAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatAdminGameDateTime(game.pollingOpensAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatAdminGameDateTime(game.pollingClosesAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? "border-emerald-700 text-emerald-300"
                              : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {gameStatusLabel(game.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                        {game.externalId ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/games/${game.id}`}
                          className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--slop-orange)] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
