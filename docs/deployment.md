# Stadium Slop — deployment readiness

First Vercel deployment checklist. This app is **sports-first MVP**: real Postgres + optional Cloudinary uploads; **mock** fan and admin gates until real auth ships.

---

## Required environment variables

| Variable | Required | Notes |
|----------|------------|--------|
| `DATABASE_URL` | **Yes** (production) | PostgreSQL connection string. Prisma reads this at build/runtime. |
| `CLOUDINARY_CLOUD_NAME` | For fan photo uploads | If any are missing, photo uploads are disabled; reviews still save. Server-only — never expose in client bundles. |
| `CLOUDINARY_API_KEY` | For fan photo uploads | Same as above. |
| `CLOUDINARY_API_SECRET` | For fan photo uploads | Same as above. |

Copy `.env.example` to `.env` locally. **Do not commit** `.env` or real secrets.

Optional / informational (usually set by the host, not hand-copied):

- `NODE_ENV` — `production` on Vercel.
- `VERCEL_URL` — Vercel sets for preview/production URLs (useful for absolute links if you add them later).

Optional tuning:

- `STADIUM_SLOP_DB_QUERY_TIMEOUT_MS` — Milliseconds for the home page venue list DB call before falling back to sample data (default **4000**). Helps local dev when `DATABASE_URL` points at an unreachable host (TCP hang) so `/` still responds.

### Dev server appears “Ready” but `curl` / the browser hangs

1. **Use the bound host** — Default `npm run dev` listens on **127.0.0.1** (see `package.json`). Open **http://127.0.0.1:3000** or run `curl -sS http://127.0.0.1:3000/health` (avoids some macOS **`localhost` → IPv6** stalls when the server is IPv4-only). Use **`npm run dev:lan`** to bind `0.0.0.0` if you need phone/other devices on the LAN.
2. **Smoke test without DB** — `GET /health` returns `{"ok":true}` with no Prisma. If `/health` works but `/` is slow, investigate Postgres or raise `STADIUM_SLOP_DB_QUERY_TIMEOUT_MS` only while debugging.
3. **Turbopack vs webpack** — If the first request never completes, try **`npm run dev:webpack`** (webpack dev server) as a comparison.

---

## Local setup

```bash
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL (and Cloudinary if testing uploads)
npm run db:generate
npm run db:migrate
npm run db:seed   # optional: sample venues/items/reviews
npm run dev
```

Health checks before deploy:

```bash
npm run typecheck
npm run build
```

---

## Prisma: generate, migrate, seed

| Goal | Command |
|------|---------|
| Generate client (after schema change or fresh install) | `npm run db:generate` |
| Apply migrations in **development** | `npm run db:migrate` (runs `prisma migrate dev`) |
| Apply migrations in **CI / Vercel / production DB** | `npm run db:migrate:deploy` (runs `prisma migrate deploy`) |
| Seed sample data (dev/demo) | `npm run db:seed` |

Seed is configured in `prisma.config.ts` (`migrations.seed`). It upserts sample venues, vendors, items, reviews, and photos — safe to re-run in dev; **review before running against a production DB** (it overwrites/upserts by slug).

---

## Vercel deployment

1. **Create project** — import the Git repo; framework preset Next.js; Node 20+ recommended.
2. **Environment variables** — in Vercel Project → Settings → Environment Variables, add at minimum:
   - `DATABASE_URL` for Production (and Preview if previews use a DB).
   - Cloudinary trio for Production if uploads should work there.
3. **Build command** — default `next build` is fine. Ensure `postinstall` runs `prisma generate` (see `package.json`) so `@prisma/client` exists before build.
4. **Database** — use a managed Postgres (Neon, Supabase, RDS, etc.). Run **`npm run db:migrate:deploy`** against that database from your machine or a CI job **before** or **right after** first deploy so schema matches the app (Vercel does not run migrations automatically unless you add a step).
5. **Preview deployments** — either point `DATABASE_URL` in Preview to a dedicated preview DB or omit DB-dependent features; avoid pointing previews at production unless intentional.

---

## Cloudinary setup

1. Create a [Cloudinary](https://cloudinary.com/) account (free tier is enough to start).
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret** into env vars (server-only).
3. `next.config.ts` already allows `res.cloudinary.com` for `next/image` remote patterns.
4. Unsigned upload presets are **not** required for the current server-side upload flow (API secret used on the server). Keep secrets off the client.

---

## Domains: stadiumslop.com / stadiumslop.app

- In Vercel → Project → **Domains**, add the apex and/or `www` records Vercel shows (usually A/AAAA or CNAME to Vercel).
- Point **both** `stadiumslop.com` and `stadiumslop.app` only if you own both; each is added as a separate domain or redirect rule as needed.
- Enable **HTTPS** (default on Vercel). Plan redirects (e.g. apex → `www`) in Vercel or DNS.
- After go-live, update any hardcoded marketing URLs, OAuth callback URLs (when you add real auth), and Cloudinary **allowed fetch** / security settings if you restrict by domain.

---

## Current limitations (production honesty)

Document these for stakeholders and future you:

| Topic | Status |
|-------|--------|
| **Fan “sign-in”** | Mock cookie gate (`lib/user-auth.ts`). Not real email/password or OAuth. |
| **Admin console** | Mock cookie value (`lib/admin-auth.ts`). Anyone who knows the cookie can access `/admin` — **treat as dev/demo only** until real auth. |
| **Email** | No transactional email, password reset, or notifications. |
| **Payments** | No Stripe or billing. |
| **Uploads** | Fan photos **auto-publish**; safety is **report → admin hide** (no pre-moderation queue before public display). |
| **Edge auth** | `proxy.ts` does optimistic redirect for `/admin/*`; not a substitute for server-side authorization on every sensitive action (add checks when you harden admin APIs). |

**Do not** ship public marketing claiming “secure accounts” until real auth replaces the mocks.

---

## Next.js 16: Middleware → Proxy

The admin gate lives in root **`proxy.ts`** (formerly `middleware.ts`). Next.js 16 deprecates the `middleware` filename in favor of **`proxy`**; behavior and `config.matcher` are unchanged. If you upgrade tooling and see old references, use the official codemod: `npx @next/codemod@canary middleware-to-proxy .`

---

## Quick pre-flight checklist

- [ ] `DATABASE_URL` set on Vercel (Production).
- [ ] Migrations applied: `npm run db:migrate:deploy` against prod DB.
- [ ] Cloudinary vars set if uploads are required in prod.
- [ ] `npm run build` passes locally with production-like env (or in CI).
- [ ] Admin URL understood as **mock-protected** only.
- [ ] Domain DNS + Vercel domains configured if using custom hostnames.
