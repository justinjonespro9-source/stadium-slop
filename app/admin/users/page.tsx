import Image from "next/image";
import Link from "next/link";

import {
  demoteUserToReviewer,
  promoteUserToAdmin
} from "@/app/admin/users/actions";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import {
  formatAdminUserDate,
  userInitials,
  userRoleLabel,
  userStatusLabel
} from "@/lib/admin/users";
import { prisma } from "@/lib/prisma";
import { normalizePublicImageUrl } from "@/lib/image-url";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const actor = await requireAdminAccess();

  const { q, error } = await searchParams;
  const query = (q ?? "").trim();

  const where =
    query.length > 0
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" as const } },
            { displayName: { contains: query, mode: "insensitive" as const } },
            { handle: { contains: query, mode: "insensitive" as const } }
          ]
        }
      : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        displayName: true,
        email: true,
        handle: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        verifiedGameDayReviewCount: true,
        photoUploadCount: true,
        _count: {
          select: {
            reviews: true,
            photos: true,
            priceReports: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  const listError =
    error === "missing-user" ? "Missing user id for that action." : null;

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
            User accounts
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Contributors
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Manage roles and account status. Promote trusted operators to ADMIN;
            suspend abusive accounts. Users are not deleted from this view.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
            {total} account{total === 1 ? "" : "s"}
            {query ? ` matching “${query}”` : ""}
            {users.length < total ? ` · showing ${users.length}` : ""}
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
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          method="get"
          action="/admin/users"
        >
          <label className="grid flex-1 gap-2 text-sm font-bold text-zinc-300">
            Search users
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Name, email, or handle"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-[var(--slop-orange)] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)]"
          >
            Search
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-zinc-800">
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-black/80 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-4 py-3">Fan</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">Prices</th>
                <th className="px-4 py-3">GD verified</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                    No users match this search.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const avatarUrl = normalizePublicImageUrl(user.avatarUrl);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-900/80 hover:bg-zinc-950/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt=""
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full border border-zinc-700 object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-black text-zinc-300">
                              {userInitials(user.displayName)}
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-black text-white hover:text-[var(--slop-orange)]"
                            >
                              {user.displayName}
                            </Link>
                            <p className="text-xs text-zinc-500">{user.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            user.role === "ADMIN"
                              ? "border-[var(--slop-orange)]/50 text-[var(--slop-orange)]"
                              : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {userRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {userStatusLabel(user.status)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatAdminUserDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {user._count.reviews}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {user._count.photos}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {user._count.priceReports}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {user.verifiedGameDayReviewCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                          >
                            View
                          </Link>
                          {user.role !== "ADMIN" ? (
                            <form action={promoteUserToAdmin}>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                className="rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                              >
                                Promote
                              </button>
                            </form>
                          ) : user.id !== actor.userId ? (
                            <form action={demoteUserToReviewer}>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                className="rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 hover:border-amber-600 hover:text-amber-200"
                              >
                                Demote
                              </button>
                            </form>
                          ) : (
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-600">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          TODO: dedicated account suspension workflow (email notices, sign-in
          block copy) — status uses existing{" "}
          <code className="text-zinc-500">User.status</code> (SUSPENDED / ACTIVE).
        </p>
      </section>
    </main>
  );
}
