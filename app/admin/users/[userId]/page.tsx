import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  demoteUserToReviewer,
  promoteUserToAdmin,
  reactivateUserAccount,
  suspendUserAccount
} from "@/app/admin/users/actions";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import {
  formatAdminUserDate,
  userInitials,
  userRoleLabel,
  userStatusLabel
} from "@/lib/admin/users";
import { formatPriceUsd } from "@/lib/price-report";
import { prisma } from "@/lib/prisma";
import { normalizePublicImageUrl } from "@/lib/image-url";

type AdminUserDetailPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function flashMessage(error?: string, updated?: string) {
  if (error === "self-demotion") {
    return "You cannot demote your own admin account while signed in.";
  }
  if (error === "self-suspend") {
    return "You cannot suspend your own account while signed in.";
  }
  if (updated === "role") {
    return "Role updated.";
  }
  if (updated === "status") {
    return "Account status updated.";
  }
  return null;
}

export default async function AdminUserDetailPage({
  params,
  searchParams
}: AdminUserDetailPageProps) {
  const actor = await requireAdminAccess();
  const { userId } = await params;
  const query = await searchParams;
  const flash = flashMessage(query.error, query.updated);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      handle: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      verifiedGameDayReviewCount: true,
      photoUploadCount: true,
      helpfulLikesReceived: true,
      homeVenue: { select: { name: true, slug: true } },
      _count: {
        select: {
          reviews: true,
          photos: true,
          priceReports: true
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const [recentReviews, recentPhotos, recentPriceReports] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        slopScore: true,
        verifiedGameDay: true,
        gameDayKey: true,
        updatedAt: true,
        foodItem: {
          select: {
            name: true,
            slug: true,
            venue: { select: { slug: true, name: true } }
          }
        }
      }
    }),
    prisma.foodPhoto.findMany({
      where: { uploaderUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        url: true,
        alt: true,
        createdAt: true,
        foodItem: { select: { name: true, slug: true, venue: { select: { slug: true } } } }
      }
    }),
    prisma.priceReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        reportedPrice: true,
        status: true,
        createdAt: true,
        foodItem: { select: { name: true, slug: true } },
        venue: { select: { name: true, slug: true } }
      }
    })
  ]);

  const avatarUrl = normalizePublicImageUrl(user.avatarUrl);
  const isSelf = actor.userId === user.id;
  const canDemote = user.role === "ADMIN" && !isSelf;
  const canPromote = user.role !== "ADMIN";
  const canSuspend = user.status === "ACTIVE" && !isSelf;
  const canReactivate = user.status === "SUSPENDED";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin/users"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to users
        </Link>

        {flash ? (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100"
          >
            {flash}
          </p>
        ) : null}

        <header className="mt-5 brand-panel rounded-[2rem] border p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={72}
                height={72}
                className="h-[4.5rem] w-[4.5rem] rounded-2xl border border-zinc-700 object-cover"
              />
            ) : (
              <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-xl font-black text-zinc-300">
                {userInitials(user.displayName)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-black sm:text-4xl">{user.displayName}</h1>
              <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
              <p className="text-xs text-zinc-500">{user.handle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {userRoleLabel(user.role)}
                </span>
                <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {userStatusLabel(user.status)}
                </span>
                {isSelf ? (
                  <span className="rounded-full border border-[var(--slop-orange)]/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--slop-orange)]">
                    You
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Joined {formatAdminUserDate(user.createdAt)}
                {user.homeVenue
                  ? ` · Home venue ${user.homeVenue.name}`
                  : null}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 border-t border-zinc-800 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Reviews", user._count.reviews],
              ["Photos uploaded", user._count.photos],
              ["Price reports", user._count.priceReports],
              ["Game-day verified", user.verifiedGameDayReviewCount],
              ["Helpful likes received", user.helpfulLikesReceived],
              ["Photo upload counter", user.photoUploadCount]
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl bg-black px-3 py-2">
                <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500">
                  {label}
                </dt>
                <dd className="mt-0.5 text-lg font-black tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
            {canPromote ? (
              <form action={promoteUserToAdmin}>
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="rounded-full border border-[var(--slop-orange)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-orange)]"
                >
                  Promote to ADMIN
                </button>
              </form>
            ) : null}
            {canDemote ? (
              <form action={demoteUserToReviewer}>
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="rounded-full border border-amber-800 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-amber-200"
                >
                  Demote to REVIEWER
                </button>
              </form>
            ) : null}
            {isSelf && user.role === "ADMIN" ? (
              <p className="text-xs text-zinc-500">
                Self-demotion blocked while you are signed in as this user.
              </p>
            ) : null}
            {canSuspend ? (
              <form action={suspendUserAccount}>
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="rounded-full border border-red-900/80 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-300"
                >
                  Suspend account
                </button>
              </form>
            ) : null}
            {canReactivate ? (
              <form action={reactivateUserAccount}>
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="rounded-full border border-emerald-800 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-200"
                >
                  Reactivate
                </button>
              </form>
            ) : null}
            {isSelf ? (
              <p className="w-full text-xs text-zinc-600">
                You cannot suspend your own account from this panel.
              </p>
            ) : null}
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="brand-card rounded-3xl border p-4 lg:col-span-1">
            <h2 className="text-lg font-black">Recent reviews</h2>
            <ul className="mt-3 space-y-3">
              {recentReviews.length === 0 ? (
                <li className="text-sm text-zinc-500">No reviews yet.</li>
              ) : (
                recentReviews.map((review) => {
                  const itemPath =
                    review.foodItem.venue.slug && review.foodItem.slug
                      ? `/venues/${review.foodItem.venue.slug}/${review.foodItem.slug}`
                      : null;
                  return (
                    <li key={review.id} className="rounded-xl bg-black p-3 text-sm">
                      <p className="font-bold">{review.foodItem.name}</p>
                      <p className="text-xs text-zinc-500">
                        {review.foodItem.venue.name} · {Number(review.slopScore).toFixed(1)}/10
                        {review.verifiedGameDay ? " · verified" : ""}
                      </p>
                      <p className="mt-1 text-[0.65rem] text-zinc-600">
                        {formatAdminUserDate(review.updatedAt)}
                      </p>
                      {itemPath ? (
                        <Link
                          href={itemPath}
                          className="mt-1 inline-block text-xs font-bold text-[var(--slop-orange)] hover:underline"
                        >
                          Public item
                        </Link>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="brand-card rounded-3xl border p-4 lg:col-span-1">
            <h2 className="text-lg font-black">Recent photos</h2>
            <ul className="mt-3 space-y-3">
              {recentPhotos.length === 0 ? (
                <li className="text-sm text-zinc-500">No photos yet.</li>
              ) : (
                recentPhotos.map((photo) => {
                  const thumb = normalizePublicImageUrl(photo.url);
                  return (
                    <li key={photo.id} className="rounded-xl bg-black p-3 text-sm">
                      <div className="flex gap-3">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={photo.alt}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg border border-zinc-800 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-500">
                            —
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold line-clamp-1">
                            {photo.foodItem?.name ?? photo.alt}
                          </p>
                          <p className="text-[0.65rem] text-zinc-600">
                            {formatAdminUserDate(photo.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="brand-card rounded-3xl border p-4 lg:col-span-1">
            <h2 className="text-lg font-black">Recent price reports</h2>
            <ul className="mt-3 space-y-3">
              {recentPriceReports.length === 0 ? (
                <li className="text-sm text-zinc-500">No price reports yet.</li>
              ) : (
                recentPriceReports.map((report) => (
                  <li key={report.id} className="rounded-xl bg-black p-3 text-sm">
                    <p className="font-bold">{report.foodItem.name}</p>
                    <p className="text-xs text-zinc-500">
                      {report.venue.name} · {formatPriceUsd(report.reportedPrice) ?? "—"} ·{" "}
                      {report.status}
                    </p>
                    <p className="mt-1 text-[0.65rem] text-zinc-600">
                      {formatAdminUserDate(report.createdAt)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
