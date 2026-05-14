# Stadium Slop

Fan-powered stadium food ratings: venues, stands, slop scores, and optional game-day photos.

## Stack

- **Next.js** (App Router) + **React**
- **PostgreSQL** + **Prisma** (with `pg` adapter)
- **Cloudinary** (optional server-side fan photo uploads)

## Documentation

- **[Deployment & first Vercel checklist](docs/deployment.md)** — env vars, migrations, seed, Vercel, Cloudinary, domains, and **current MVP limitations** (mock auth, no Stripe, upload behavior).

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env — at minimum DATABASE_URL; add Cloudinary vars to test uploads
npm run db:migrate
npm run db:seed   # optional sample data
npm run dev
# Prefer http://127.0.0.1:3000 in the browser if localhost hangs (see docs/deployment.md)
```

Open **http://127.0.0.1:3000** (recommended) or [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack, **127.0.0.1**) |
| `npm run dev:webpack` | Dev server with **webpack** (if Turbopack stalls) |
| `npm run dev:lan` | Dev on **0.0.0.0** (LAN / device testing; see `docs/deployment.md` if `localhost` hangs) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` (local) |
| `npm run db:migrate:deploy` | `prisma migrate deploy` (CI / prod DB) |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | Seed sample venues/items (see `docs/deployment.md`) |
| `npm run import:mlb` | `npm run import:mlb -- ./path/to.json` → `scripts/apply-mlb-import.ts` (see `data/mlb/README.md`) |
| `npm run lint` | ESLint |

`postinstall` runs `prisma generate` so Vercel/builds have a generated client after `npm install`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
