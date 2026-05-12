import {
  foodItems,
  foodReviews,
  vendors,
  venues,
  foodPhotos
} from "@/lib/sample-data";

const adminSections = [
  {
    title: "Venues",
    count: venues.length,
    action: "Edit venue",
    detail: "Manage venue basics, teams, leagues, and review radius."
  },
  {
    title: "Vendors",
    count: vendors.length,
    action: "Add vendor",
    detail: "Create or correct stand names, sections, and line intel."
  },
  {
    title: "Items",
    count: foodItems.length,
    action: "Add item",
    detail: "Maintain reviewable food and drink listings."
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

export default function AdminPage() {
  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header>
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Admin foundation
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Stadium Slop Admin
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Mock management dashboard for future site operations. No real auth,
            database writes, moderation actions, or mutations are wired up yet.
          </p>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Venues", venues.length],
            ["Vendors", vendors.length],
            ["Items", foodItems.length],
            ["Photos", foodPhotos.length]
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
                <button
                  type="button"
                  disabled
                  className="mt-5 cursor-not-allowed rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500"
                >
                  {section.action}
                </button>
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
      </section>
    </main>
  );
}
