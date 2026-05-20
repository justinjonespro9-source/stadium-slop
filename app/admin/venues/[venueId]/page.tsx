import { VenueType } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { VENUE_TYPE_OPTIONS } from "@/lib/venue-display";

const VENDOR_LIST_CAP = 60;
const ITEM_LIST_CAP = 80;

type AdminVenueDetailPageProps = {
  params: Promise<{
    venueId: string;
  }>;
  searchParams: Promise<{ vendorQ?: string; itemQ?: string }>;
};

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function updateVenue(formData: FormData) {
  "use server";

  await requireAdminAccess();
  const venueId = String(formData.get("venueId") ?? "");
  const reviewRadiusMeters = Number(formData.get("reviewRadiusMeters"));

  const rawType = String(formData.get("venueType") ?? VenueType.STADIUM);
  const venueType = Object.values(VenueType).includes(rawType as VenueType)
    ? (rawType as VenueType)
    : VenueType.STADIUM;

  await prisma.venue.update({
    where: { id: venueId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim() || "USA",
      region: String(formData.get("region") ?? "").trim() || "North America",
      leagues: parseList(formData.get("leagues")),
      teams: parseList(formData.get("teams")),
      sports: parseList(formData.get("sports")),
      primarySport: String(formData.get("primarySport") ?? "").trim() || null,
      recurringEvents: parseList(formData.get("recurringEvents")),
      surfaceType: String(formData.get("surfaceType") ?? "").trim() || null,
      venueType,
      reviewRadiusMeters: Number.isFinite(reviewRadiusMeters)
        ? reviewRadiusMeters
        : 800
    }
  });

  const slug = String(formData.get("slug") ?? "").trim();
  if (slug) {
    revalidatePath(`/venues/${slug}`);
  }

  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${venueId}`);
  redirect(`/admin/venues/${venueId}`);
}

async function createVendor(formData: FormData) {
  "use server";

  await requireAdminAccess();
  const venueId = String(formData.get("venueId") ?? "");
  const name = String(formData.get("vendorName") ?? "").trim();
  const slug = String(formData.get("vendorSlug") ?? "").trim();

  if (!venueId || !name || !slug) {
    redirect(`/admin/venues/${venueId}`);
  }

  await prisma.vendor.upsert({
    where: {
      venueId_slug: {
        venueId,
        slug
      }
    },
    update: {
      name,
      section: String(formData.get("vendorSection") ?? "").trim(),
      location: String(formData.get("vendorLocation") ?? "").trim(),
      status: "ACTIVE"
    },
    create: {
      venueId,
      name,
      slug,
      section: String(formData.get("vendorSection") ?? "").trim(),
      location: String(formData.get("vendorLocation") ?? "").trim(),
      status: "ACTIVE"
    }
  });

  revalidatePath(`/admin/venues/${venueId}`);
  redirect(`/admin/venues/${venueId}`);
}

function matchesQuery(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default async function AdminVenueDetailPage({
  params,
  searchParams
}: AdminVenueDetailPageProps) {
  await requireAdminAccess();

  const { venueId } = await params;
  const { vendorQ = "", itemQ = "" } = await searchParams;
  const vq = vendorQ.trim();
  const iq = itemQ.trim();

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    include: {
      vendors: {
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { items: true }
          }
        }
      },
      items: {
        orderBy: { name: "asc" },
        include: {
          vendor: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!venue) {
    notFound();
  }

  const vendorsFiltered = vq
    ? venue.vendors.filter(
        (v) => matchesQuery(v.name, vq) || matchesQuery(v.slug, vq)
      )
    : venue.vendors;

  const vendorsTruncated = !vq && vendorsFiltered.length > VENDOR_LIST_CAP;
  const vendorsShown = vendorsTruncated
    ? vendorsFiltered.slice(0, VENDOR_LIST_CAP)
    : vendorsFiltered;

  const itemsFiltered = iq
    ? venue.items.filter(
        (it) =>
          matchesQuery(it.name, iq) ||
          matchesQuery(it.slug, iq) ||
          matchesQuery(it.vendor.name, iq)
      )
    : venue.items;

  const itemsTruncated = !iq && itemsFiltered.length > ITEM_LIST_CAP;
  const itemsShown = itemsTruncated
    ? itemsFiltered.slice(0, ITEM_LIST_CAP)
    : itemsFiltered;

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin/venues"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Venue edit
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {venue.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/venues/${venue.slug}`}
              className="inline-flex rounded-full border border-[var(--slop-orange)] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)] hover:bg-[var(--slop-orange)] hover:text-[var(--slop-ink)]"
            >
              View public venue
            </Link>
            <p className="text-xs text-zinc-500">
              {venue.vendors.length} vendors · {venue.items.length} items in database
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <form action={updateVenue} className="brand-panel rounded-3xl border p-5">
            <input type="hidden" name="venueId" value={venue.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name", venue.name],
                ["slug", "Slug", venue.slug],
                ["city", "City", venue.city],
                ["state", "State", venue.state],
                ["country", "Country", venue.country],
                ["region", "Region", venue.region],
                ["leagues", "Leagues / tours (comma)", venue.leagues.join(", ")],
                ["teams", "Teams", venue.teams.join(", ")],
                ["sports", "Sports", venue.sports.join(", ")],
                [
                  "primarySport",
                  "Primary sport (optional)",
                  venue.primarySport ?? ""
                ],
                [
                  "recurringEvents",
                  "Signature events (comma, optional)",
                  venue.recurringEvents.join(", ")
                ],
                [
                  "surfaceType",
                  "Surface / course type (optional)",
                  venue.surfaceType ?? ""
                ],
                [
                  "reviewRadiusMeters",
                  "Review radius meters",
                  String(venue.reviewRadiusMeters)
                ]
              ].map(([name, label, value]) => (
                <label key={name} className="grid gap-2 text-sm font-bold text-zinc-300">
                  {label}
                  <input
                    name={name}
                    defaultValue={value}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                Venue type
                <select
                  name="venueType"
                  defaultValue={venue.venueType}
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                >
                  {VENUE_TYPE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="brand-cta mt-5 rounded-full px-6 py-3 text-sm font-black"
            >
              Save venue
            </button>
          </form>

          <div className="grid gap-5">
            <section className="brand-card rounded-3xl border p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-black">Vendors</h2>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                  Showing {vendorsShown.length}
                  {vq ? ` of ${venue.vendors.length}` : vendorsTruncated ? ` of ${venue.vendors.length}` : ""}
                </p>
              </div>
              <form
                className="mt-3 flex flex-wrap gap-2"
                method="get"
                action={`/admin/venues/${venue.id}`}
              >
                <input
                  name="vendorQ"
                  type="search"
                  defaultValue={vq}
                  placeholder="Filter vendors…"
                  className="min-w-[12rem] flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />
                {iq ? <input type="hidden" name="itemQ" value={iq} /> : null}
                <button
                  type="submit"
                  className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-bold text-zinc-300"
                >
                  Filter
                </button>
                {vq ? (
                  <Link
                    href={iq ? `/admin/venues/${venue.id}?itemQ=${encodeURIComponent(iq)}` : `/admin/venues/${venue.id}`}
                    className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-400"
                  >
                    Clear vendor filter
                  </Link>
                ) : null}
              </form>
              <form action={createVendor} className="mt-4 grid gap-3 rounded-2xl bg-black p-4">
                <input type="hidden" name="venueId" value={venue.id} />
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-500">
                  Add Vendor
                </p>
                <input
                  name="vendorName"
                  required
                  placeholder="Vendor name"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorSlug"
                  required
                  placeholder="vendor-slug"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorSection"
                  required
                  placeholder="Section or concourse"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorLocation"
                  required
                  placeholder="Location"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  className="brand-cta rounded-full px-5 py-3 text-sm font-black"
                >
                  Add vendor
                </button>
              </form>
              <div className="mt-4 grid gap-2">
                {vendorsShown.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/admin/vendors/${vendor.id}`}
                    className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-[var(--slop-orange)]"
                  >
                    <p className="font-black">{vendor.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {vendor.section} · {vendor.location} · {vendor._count.items} items
                    </p>
                  </Link>
                ))}
              </div>
              {vendorsTruncated ? (
                <p className="mt-3 text-xs text-zinc-500">
                  List capped at {VENDOR_LIST_CAP} for performance. Use the filter to find a vendor.
                </p>
              ) : null}
            </section>

            <section className="brand-card rounded-3xl border p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-black">Food items</h2>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                  Showing {itemsShown.length}
                  {iq ? ` of ${venue.items.length}` : itemsTruncated ? ` of ${venue.items.length}` : ""}
                </p>
              </div>
              <form
                className="mt-3 flex flex-wrap gap-2"
                method="get"
                action={`/admin/venues/${venue.id}`}
              >
                {vq ? <input type="hidden" name="vendorQ" value={vq} /> : null}
                <input
                  name="itemQ"
                  type="search"
                  defaultValue={iq}
                  placeholder="Filter items…"
                  className="min-w-[12rem] flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-bold text-zinc-300"
                >
                  Filter
                </button>
                {iq ? (
                  <Link
                    href={vq ? `/admin/venues/${venue.id}?vendorQ=${encodeURIComponent(vq)}` : `/admin/venues/${venue.id}`}
                    className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-400"
                  >
                    Clear item filter
                  </Link>
                ) : null}
              </form>
              <div className="mt-4 grid gap-2">
                {itemsShown.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/items/${item.id}`}
                    className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-[var(--slop-orange)]"
                  >
                    <p className="font-black">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.vendor.name} · {item.status}
                    </p>
                  </Link>
                ))}
              </div>
              {itemsTruncated ? (
                <p className="mt-3 text-xs text-zinc-500">
                  List capped at {ITEM_LIST_CAP} for performance. Use the filter to find an item.
                </p>
              ) : null}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
