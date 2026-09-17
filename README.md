# Tangail Saree Store

Online store and admin dashboard for Tangail sarees. Build plan: [docs/PLAN.md](docs/PLAN.md).

Stack: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod, Prisma 7 + PostgreSQL.

## Local setup

Requires Node.js 20+.

```bash
npm install                # also generates the Prisma client
cp .env.example .env       # then set DATABASE_URL
npm run db:local           # optional: start a local Postgres (no Docker needed)
npm run db:migrate         # apply migrations
npm run db:seed            # add starter data
npm run dev                # http://localhost:3000
```

`npm run db:local` prints a `postgres://…` TCP URL. Put that in `.env` as `DATABASE_URL`. To stop it later, run `npx prisma dev stop tati-bari`.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `lint` / `typecheck` | ESLint and TypeScript checks |
| `db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `db:deploy` | Apply existing migrations (production) |
| `db:seed` | Run `prisma/seed.ts`. It is safe to run more than once. |
| `db:studio` | Open Prisma Studio to browse data |
| `db:generate` | Regenerate the Prisma client |
| `db:local` | Start the local Prisma Postgres server in the background |

## Project layout

```
app/          routes, layouts, route handlers
components/   shared UI (components/ui = shadcn/ui)
features/     feature modules: products, cart, checkout, orders, customers, admin
lib/          db client, env validation, utilities (lib/generated = Prisma client, not committed)
prisma/       schema, migrations, seed
types/        shared TypeScript types
docs/         plan and project docs
```

Server-only code (`lib/db.ts`, `lib/env.ts`) imports `server-only`, so importing it from a client component fails the build.
