export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <p className="mb-5 inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
          Account placeholder
        </p>
        <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl">
          Sign in to review
        </h1>
        <p className="mt-5 text-base leading-7 text-zinc-300 sm:text-lg">
          Anyone can browse Stadium Slop. A free profile and on-site location
          check are required to leave verified reviews and move venue
          scoreboards.
        </p>

        <div className="mt-8 grid gap-3">
          {["Continue with email", "Continue with Google", "Continue with Apple"].map(
            (label) => (
              <button
                key={label}
                type="button"
                disabled
                className="cursor-not-allowed rounded-full border border-zinc-700 px-6 py-4 text-sm font-black text-zinc-300"
              >
                {label}
              </button>
            )
          )}
        </div>

        <p className="mt-6 text-sm text-zinc-500">Authentication coming soon.</p>
      </section>
    </main>
  );
}
