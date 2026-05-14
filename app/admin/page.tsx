import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  foodItems,
  foodReviews,
  vendors,
  venues,
  foodPhotos
} from "@/lib/sample-data";
import { MOCK_ADMIN_COOKIE_NAME, hasMockAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { FAN_REPORT_REASON_LABELS } from "@/lib/reports";
import type { ReportReason } from "@prisma/client";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function mockAdminSignOut() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete(MOCK_ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

async function approvePriceReport(formData: FormData) {
  "use server";

  const reportId = String(formData.get("reportId") ?? "");
  const report = await prisma.priceReport.findUnique({
    where: { id: reportId }
  });

  if (!report || report.status !== "PENDING") {
    redirect("/admin");
  }

  await prisma.$transaction([
    prisma.priceReport.update({
      where: { id: report.id },
      data: { status: "APPROVED" }
    }),
    prisma.foodItem.update({
      where: { id: report.foodItemId },
      data: {
        reportedPrice: report.reportedPrice,
        priceReportCount: {
          increment: 1
        },
        priceLastConfirmedLabel: "Admin approved"
      }
    })
  ]);

  revalidatePath("/admin");
  redirect("/admin");
}

async function rejectPriceReport(formData: FormData) {
  "use server";

  const reportId = String(formData.get("reportId") ?? "");

  await prisma.priceReport.updateMany({
    where: {
      id: reportId,
      status: "PENDING"
    },
    data: {
      status: "REJECTED"
    }
  });

  revalidatePath("/admin");
  redirect("/admin");
}

async function approveSuggestedItem(formData: FormData) {
  "use server";

  const suggestionId = String(formData.get("suggestionId") ?? "");
  const suggestion = await prisma.suggestedItem.findUnique({
    where: { id: suggestionId },
    include: {
      venue: true,
      vendor: true
    }
  });

  if (!suggestion || suggestion.status !== "PENDING") {
    redirect("/admin");
  }

  if (!suggestion.vendor) {
    await prisma.suggestedItem.update({
      where: { id: suggestion.id },
      data: { status: "APPROVED" }
    });
    revalidatePath("/admin");
    redirect("/admin");
  }

  const slug = slugify(suggestion.name);
  const vendor = suggestion.vendor;

  await prisma.$transaction(async (tx) => {
    await tx.foodItem.upsert({
      where: {
        venueId_slug: {
          venueId: suggestion.venueId,
          slug
        }
      },
      update: {
        name: suggestion.name,
        vendorId: vendor.id,
        location: suggestion.locationHint ?? vendor.location,
        customCategoryLabel: suggestion.category ? null : "Fan suggested",
        availabilityStatus: "FAN_REPORTED",
        status: "ACTIVE"
      },
      create: {
        slug,
        name: suggestion.name,
        venueId: suggestion.venueId,
        vendorId: vendor.id,
        itemType: "FOOD",
        category: suggestion.category ?? "OTHER",
        customCategoryLabel: suggestion.category ? null : "Fan suggested",
        location: suggestion.locationHint ?? vendor.location,
        sections: [],
        description:
          suggestion.note ??
          "Fan-suggested item pending richer Stadium Slop details.",
        tags: ["Fan Suggested"],
        availabilityStatus: "FAN_REPORTED",
        status: "ACTIVE"
      }
    });

    await tx.suggestedItem.update({
      where: { id: suggestion.id },
      data: { status: "APPROVED" }
    });
  });

  revalidatePath("/admin");
  revalidatePath(`/venues/${suggestion.venue.slug}`);
  redirect("/admin");
}

async function rejectSuggestedItem(formData: FormData) {
  "use server";

  const suggestionId = String(formData.get("suggestionId") ?? "");

  await prisma.suggestedItem.updateMany({
    where: {
      id: suggestionId,
      status: "PENDING"
    },
    data: {
      status: "REJECTED"
    }
  });

  revalidatePath("/admin");
  redirect("/admin");
}

function labelForReportReason(reason: ReportReason): string {
  const map = FAN_REPORT_REASON_LABELS as Partial<Record<ReportReason, string>>;
  return map[reason] ?? reason.replace(/_/g, " ");
}

async function requireMockAdmin() {
  const cookieStore = await cookies();
  if (!hasMockAdminAccess(cookieStore.get(MOCK_ADMIN_COOKIE_NAME)?.value)) {
    redirect("/admin/login");
  }
}

async function markContentReportReviewed(formData: FormData) {
  "use server";

  await requireMockAdmin();
  const flagId = String(formData.get("flagId") ?? "");
  await prisma.reportFlag.updateMany({
    where: { id: flagId, status: "OPEN" },
    data: { status: "RESOLVED" }
  });
  revalidatePath("/admin");
  redirect("/admin");
}

async function dismissContentReport(formData: FormData) {
  "use server";

  await requireMockAdmin();
  const flagId = String(formData.get("flagId") ?? "");
  await prisma.reportFlag.updateMany({
    where: { id: flagId, status: "OPEN" },
    data: { status: "DISMISSED" }
  });
  revalidatePath("/admin");
  redirect("/admin");
}

async function hideReviewFromContentReport(formData: FormData) {
  "use server";

  await requireMockAdmin();
  const flagId = String(formData.get("flagId") ?? "");
  const flag = await prisma.reportFlag.findUnique({
    where: { id: flagId },
    include: {
      review: {
        include: {
          foodItem: { include: { venue: { select: { slug: true } } } }
        }
      }
    }
  });

  if (!flag?.reviewId || !flag.review) {
    redirect("/admin");
  }

  const fi = flag.review.foodItem;
  const itemPath =
    fi?.venue?.slug && fi.slug ? `/venues/${fi.venue.slug}/${fi.slug}` : null;

  await prisma.$transaction([
    prisma.review.update({
      where: { id: flag.reviewId },
      data: { status: "HIDDEN" }
    }),
    prisma.reportFlag.updateMany({
      where: {
        OR: [
          { reviewId: flag.reviewId, status: "OPEN" },
          { targetType: "REVIEW", targetId: flag.reviewId, status: "OPEN" }
        ]
      },
      data: { status: "RESOLVED" }
    })
  ]);

  if (itemPath) {
    revalidatePath(itemPath);
  }
  revalidatePath("/admin");
  redirect("/admin");
}

async function hidePhotoFromContentReport(formData: FormData) {
  "use server";

  await requireMockAdmin();
  const flagId = String(formData.get("flagId") ?? "");
  const flag = await prisma.reportFlag.findUnique({
    where: { id: flagId },
    include: {
      photo: {
        include: {
          foodItem: { include: { venue: { select: { slug: true } } } }
        }
      }
    }
  });

  if (!flag?.photoId || !flag.photo) {
    redirect("/admin");
  }

  const fi = flag.photo.foodItem;
  const itemPath =
    fi?.venue?.slug && fi.slug ? `/venues/${fi.venue.slug}/${fi.slug}` : null;

  await prisma.$transaction([
    prisma.foodPhoto.update({
      where: { id: flag.photoId },
      data: { status: "HIDDEN" }
    }),
    prisma.reportFlag.updateMany({
      where: {
        OR: [
          { photoId: flag.photoId, status: "OPEN" },
          { targetType: "PHOTO", targetId: flag.photoId, status: "OPEN" }
        ]
      },
      data: { status: "RESOLVED" }
    })
  ]);

  if (itemPath) {
    revalidatePath(itemPath);
  }
  revalidatePath("/admin");
  redirect("/admin");
}

const adminSections = [
  {
    title: "Venues",
    count: venues.length,
    action: "Edit venue",
    detail: "Manage venue basics, teams, leagues, and review radius.",
    href: "/admin/venues"
  },
  {
    title: "Vendors",
    count: vendors.length,
    action: "Add vendor",
    detail: "Create or correct stand names, sections, and line intel.",
    href: "/admin/venues"
  },
  {
    title: "Items",
    count: foodItems.length,
    action: "Add item",
    detail: "Maintain reviewable food and drink listings.",
    href: "/admin/venues"
  },
  {
    title: "Reviews",
    count: foodReviews.length,
    action: "Hide review",
    detail: "Moderate verified game-day review signals, notes, and photo context."
  },
  {
    title: "Users",
    count: 3,
    action: "Suspend user",
    detail: "Review sample profiles, reputation, ownership, and account status."
  },
  {
    title: "Reports / flags",
    count: 4,
    action: "Review flags",
    detail: "Triage duplicate reviews, suspicious activity, and bad intel."
  },
  {
    title: "Price updates",
    count: foodItems.filter((item) => item.priceReportCount).length,
    action: "Approve price update",
    detail: "Confirm reported prices and last-confirmed labels."
  },
  {
    title: "Suggested missing items",
    count: 5,
    action: "Review suggested item",
    detail: "Queue fan-suggested vendors, sections, and menu items."
  }
];

const moderationQueue = [
  {
    title: "Hide flagged review",
    count: 2,
    copy: "Check food-focused notes, photo context, and verified status."
  },
  {
    title: "Duplicate or suspicious activity",
    count: 1,
    copy: "Review repeated scores, duplicate submissions, and unusual helpful-like patterns."
  },
  {
    title: "Outdated prices",
    count: foodItems.filter((item) => (item.priceReportCount ?? 0) < 5).length,
    copy: "Prioritize low-confidence reported prices."
  },
  {
    title: "User suspension review",
    count: 3,
    copy: "Escalate users with repeated suspicious reviews or abusive profile details."
  }
];

async function getPendingAdminQueues() {
  try {
    const [priceReports, suggestedItems, contentReports] = await Promise.all([
      prisma.priceReport.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          foodItem: { select: { name: true } },
          venue: { select: { name: true } },
          user: { select: { handle: true } }
        }
      }),
      prisma.suggestedItem.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          venue: { select: { name: true } },
          vendor: { select: { name: true } },
          user: { select: { handle: true } }
        }
      }),
      prisma.reportFlag.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "asc" },
        take: 12,
        include: {
          reporter: { select: { handle: true, displayName: true } },
          review: {
            select: {
              id: true,
              status: true,
              slopScore: true,
              note: true,
              user: { select: { handle: true } },
              foodItem: {
                select: {
                  name: true,
                  slug: true,
                  venue: { select: { slug: true, name: true } }
                }
              }
            }
          },
          photo: {
            select: {
              id: true,
              url: true,
              status: true,
              foodItem: {
                select: {
                  name: true,
                  slug: true,
                  venue: { select: { slug: true } }
                }
              }
            }
          }
        }
      })
    ]);

    return { priceReports, suggestedItems, contentReports };
  } catch (error) {
    console.warn("Falling back to empty admin queues", error);
    return { priceReports: [], suggestedItems: [], contentReports: [] };
  }
}

export default async function AdminPage() {
  const { priceReports, suggestedItems, contentReports } =
    await getPendingAdminQueues();

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="brand-panel rounded-[2rem] border p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                SNG LABS
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                Admin Console
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Mock-gated management dashboard for Stadium Slop operations.
                Admin actions are logged conceptually; full audit log comes
                later.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--slop-line)] bg-[var(--slop-ink)] p-4 sm:min-w-56">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slop-blue)]">
                Mock signed-in admin
              </p>
              <p className="mt-2 font-black">SNG LABS Operator</p>
              <form action={mockAdminSignOut}>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Venues", venues.length],
            ["Vendors", vendors.length],
            ["Items", foodItems.length],
            ["Photos", foodPhotos.length],
            ["Pending prices", priceReports.length],
            ["Pending items", suggestedItems.length],
            ["Open fan reports", contentReports.length]
          ].map(([label, count]) => (
            <div
              key={label}
              className="brand-card rounded-3xl border p-4"
            >
              <p className="text-3xl font-black">{count}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Management
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {adminSections.map((section) => (
              <article
                key={section.title}
                className="brand-card rounded-3xl border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black">{section.title}</h2>
                  <span className="rounded-full bg-[var(--slop-orange)] px-3 py-1 text-sm font-black text-[var(--slop-ink)]">
                    {section.count}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {section.detail}
                </p>
                {section.href ? (
                  <Link
                    href={section.href}
                    className="mt-5 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                  >
                    {section.action}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 cursor-not-allowed rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500"
                  >
                    {section.action}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="brand-panel mt-8 rounded-[2rem] border p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Moderation queue
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {moderationQueue.map((item) => (
              <article key={item.title} className="rounded-2xl bg-black p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-black">{item.title}</h2>
                  <span className="text-sm font-black text-zinc-400">
                    {item.count}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="brand-panel mt-8 rounded-[2rem] border p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Fan content reports
          </p>
          <div className="mt-3 grid gap-3">
            {contentReports.length > 0 ? (
              contentReports.map((flag) => {
                const itemLink =
                  flag.review?.foodItem?.venue?.slug && flag.review.foodItem.slug
                    ? `/venues/${flag.review.foodItem.venue.slug}/${flag.review.foodItem.slug}`
                    : flag.photo?.foodItem?.venue?.slug && flag.photo.foodItem.slug
                      ? `/venues/${flag.photo.foodItem.venue.slug}/${flag.photo.foodItem.slug}`
                      : null;
                const itemLabel =
                  flag.review?.foodItem?.name ??
                  flag.photo?.foodItem?.name ??
                  "Unknown item";

                return (
                  <article key={flag.id} className="rounded-2xl bg-black p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black">{itemLabel}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Target:{" "}
                          <span className="font-bold text-zinc-400">
                            {flag.targetType}
                          </span>{" "}
                          · {labelForReportReason(flag.reason)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Reporter: {flag.reporter.displayName} (@
                          {flag.reporter.handle})
                        </p>
                        {flag.review ? (
                          <p className="mt-2 text-sm text-zinc-400">
                            Review @{flag.review.user.handle} ·{" "}
                            {Number(flag.review.slopScore).toFixed(1)}/10
                            {flag.review.note ? ` · “${flag.review.note.slice(0, 120)}${flag.review.note.length > 120 ? "…" : ""}”` : ""}
                          </p>
                        ) : null}
                        {flag.photo?.url ? (
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            Photo: {flag.photo.url}
                          </p>
                        ) : null}
                        {flag.note ? (
                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            Note: {flag.note}
                          </p>
                        ) : null}
                        {itemLink ? (
                          <Link
                            href={itemLink}
                            className="mt-2 inline-flex text-xs font-bold text-[var(--slop-orange)] hover:underline"
                          >
                            View item page
                          </Link>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-800/60 px-2 py-1 text-xs font-bold uppercase tracking-[0.15em] text-amber-200/90">
                        Open
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={markContentReportReviewed}>
                        <input type="hidden" name="flagId" value={flag.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-300"
                        >
                          Mark reviewed
                        </button>
                      </form>
                      <form action={dismissContentReport}>
                        <input type="hidden" name="flagId" value={flag.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-400"
                        >
                          Dismiss
                        </button>
                      </form>
                      {flag.reviewId && flag.review ? (
                        <form action={hideReviewFromContentReport}>
                          <input type="hidden" name="flagId" value={flag.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-900/60 px-3 py-1.5 text-xs font-bold text-red-300/90"
                          >
                            Hide review
                          </button>
                        </form>
                      ) : null}
                      {flag.photoId && flag.photo ? (
                        <form action={hidePhotoFromContentReport}>
                          <input type="hidden" name="flagId" value={flag.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-900/60 px-3 py-1.5 text-xs font-bold text-red-300/90"
                          >
                            Hide photo
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-2xl bg-black p-4 text-sm text-zinc-500">
                No open fan content reports.
              </p>
            )}
          </div>
        </section>

        <section className="brand-panel mt-8 rounded-[2rem] border p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Pending approval
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-black">Price reports</h2>
              <div className="mt-3 grid gap-3">
                {priceReports.length > 0 ? (
                  priceReports.map((report) => (
                    <article key={report.id} className="rounded-2xl bg-black p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{report.foodItem.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {report.venue.name} · ${Number(report.reportedPrice).toFixed(2)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            Needs review · {report.user.handle}
                          </p>
                          {report.note ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              {report.note}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full border border-zinc-800 px-2 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                          Pending
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <form action={approvePriceReport}>
                          <input type="hidden" name="reportId" value={report.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-[var(--slop-orange)] px-3 py-1.5 text-xs font-bold text-[var(--slop-orange)]"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={rejectPriceReport}>
                          <input type="hidden" name="reportId" value={report.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-400"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-2xl bg-black p-4 text-sm text-zinc-500">
                    No pending price reports.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black">Suggested items</h2>
              <div className="mt-3 grid gap-3">
                {suggestedItems.length > 0 ? (
                  suggestedItems.map((item) => (
                    <article key={item.id} className="rounded-2xl bg-black p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{item.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {item.venue.name} · {item.vendor?.name ?? "Vendor unclear"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            Needs review · {item.user.handle}
                          </p>
                          {item.locationHint ? (
                            <p className="mt-2 text-sm text-zinc-400">
                              Location: {item.locationHint}
                            </p>
                          ) : null}
                          {item.note ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full border border-zinc-800 px-2 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                          Pending
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <form action={approveSuggestedItem}>
                          <input
                            type="hidden"
                            name="suggestionId"
                            value={item.id}
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-[var(--slop-orange)] px-3 py-1.5 text-xs font-bold text-[var(--slop-orange)]"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={rejectSuggestedItem}>
                          <input
                            type="hidden"
                            name="suggestionId"
                            value={item.id}
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-400"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-2xl bg-black p-4 text-sm text-zinc-500">
                    No pending suggested items.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
