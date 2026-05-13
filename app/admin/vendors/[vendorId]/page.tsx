import { EntityStatus, ItemCategory, ItemType } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

type AdminVendorDetailPageProps = {
  params: Promise<{
    vendorId: string;
  }>;
};

async function updateVendor(formData: FormData) {
  "use server";

  const vendorId = String(formData.get("vendorId") ?? "");

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      venueId: String(formData.get("venueId") ?? ""),
      section: String(formData.get("section") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      lineIntel: String(formData.get("lineIntel") ?? "").trim() || null,
      status: String(formData.get("status") ?? EntityStatus.ACTIVE) as EntityStatus
    }
  });

  revalidatePath("/admin/venues");
  revalidatePath(`/admin/vendors/${vendorId}`);
  redirect(`/admin/vendors/${vendorId}`);
}

async function createFoodItem(formData: FormData) {
  "use server";

  const vendorId = String(formData.get("vendorId") ?? "");
  const name = String(formData.get("itemName") ?? "").trim();
  const slug = String(formData.get("itemSlug") ?? "").trim();
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

  if (!vendor || !name || !slug) {
    redirect(`/admin/vendors/${vendorId}`);
  }

  const reportedPriceValue = String(formData.get("reportedPrice") ?? "").trim();
  const reportedPrice = reportedPriceValue ? Number(reportedPriceValue) : null;

  await prisma.foodItem.upsert({
    where: {
      venueId_slug: {
        venueId: vendor.venueId,
        slug
      }
    },
    update: {
      name,
      vendorId,
      customCategoryLabel: String(formData.get("customCategoryLabel") ?? "").trim(),
      category: String(formData.get("category") ?? ItemCategory.OTHER) as ItemCategory,
      description: String(formData.get("description") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      sections: String(formData.get("sections") ?? "")
        .split(",")
        .map((section) => section.trim())
        .filter(Boolean),
      reportedPrice,
      status: "ACTIVE"
    },
    create: {
      name,
      slug,
      venueId: vendor.venueId,
      vendorId,
      itemType: ItemType.FOOD,
      category: String(formData.get("category") ?? ItemCategory.OTHER) as ItemCategory,
      customCategoryLabel: String(formData.get("customCategoryLabel") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      sections: String(formData.get("sections") ?? "")
        .split(",")
        .map((section) => section.trim())
        .filter(Boolean),
      reportedPrice,
      tags: [],
      status: "ACTIVE"
    }
  });

  revalidatePath(`/admin/vendors/${vendorId}`);
  redirect(`/admin/vendors/${vendorId}`);
}

export default async function AdminVendorDetailPage({
  params
}: AdminVendorDetailPageProps) {
  const { vendorId } = await params;
  const [vendor, venues] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        venue: true,
        items: {
          orderBy: { name: "asc" }
        }
      }
    }),
    prisma.venue.findMany({
      orderBy: [{ state: "asc" }, { name: "asc" }]
    })
  ]);

  if (!vendor) {
    notFound();
  }

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href={`/admin/venues/${vendor.venueId}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venue
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Vendor edit
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {vendor.name}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">{vendor.venue.name}</p>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <form action={updateVendor} className="brand-panel rounded-3xl border p-5">
            <input type="hidden" name="vendorId" value={vendor.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name", vendor.name],
                ["slug", "Slug", vendor.slug],
                ["section", "Section", vendor.section],
                ["location", "Location", vendor.location]
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
                Venue
                <select
                  name="venueId"
                  defaultValue={vendor.venueId}
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                >
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                Status
                <select
                  name="status"
                  defaultValue={vendor.status}
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                >
                  <option value={EntityStatus.ACTIVE}>Active</option>
                  <option value={EntityStatus.HIDDEN}>Inactive / hidden</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-300 sm:col-span-2">
                Line intel
                <textarea
                  name="lineIntel"
                  defaultValue={vendor.lineIntel ?? ""}
                  className="min-h-24 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              className="brand-cta mt-5 rounded-full px-6 py-3 text-sm font-black"
            >
              Save vendor
            </button>
          </form>

          <section className="brand-card rounded-3xl border p-5">
            <h2 className="text-xl font-black">Items</h2>
            <form action={createFoodItem} className="mt-4 grid gap-3 rounded-2xl bg-black p-4">
              <input type="hidden" name="vendorId" value={vendor.id} />
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-500">
                Add Food Item
              </p>
              <input
                name="itemName"
                required
                placeholder="Item name"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                name="itemSlug"
                required
                placeholder="item-slug"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                name="customCategoryLabel"
                placeholder="Display category"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <select
                name="category"
                defaultValue={ItemCategory.OTHER}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              >
                {Object.values(ItemCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                name="reportedPrice"
                type="number"
                step="0.01"
                placeholder="Reported price"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                name="sections"
                placeholder="Sections, comma-separated"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                name="location"
                required
                placeholder="Location"
                defaultValue={vendor.location}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <textarea
                name="description"
                required
                placeholder="Description"
                className="min-h-24 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                className="brand-cta rounded-full px-5 py-3 text-sm font-black"
              >
                Add food item
              </button>
            </form>
            <div className="mt-4 grid gap-2">
              {vendor.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/items/${item.id}`}
                  className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-[var(--slop-orange)]"
                >
                  <p className="font-black">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {item.customCategoryLabel ?? item.category} · {item.status}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
