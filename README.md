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
npm run admin:set          # create the admin account (prompts for email, name, password)
npm run dev                # http://localhost:3000
```

Set `SESSION_SECRET` in `.env` to a random string (`openssl rand -base64 32`).

Store name, contact details and social links live in `lib/site.ts`.

Product photos go to Cloudinary when the `CLOUDINARY_*` variables are set. Without them, photos are saved in `.uploads/` (not committed), which only works for local development.

`npm run db:local` prints a `postgres://…` TCP URL. Put that in `.env` as `DATABASE_URL`. To stop it later, run `npx prisma dev stop tati-bari`.

## Deploying to Vercel

`vercel.json` holds the build settings: `npm ci` (whose `postinstall` generates the Prisma client), then on production builds only `prisma migrate deploy` before `next build`. Preview builds skip migrations so a branch can't change the live database. Functions run in `cle1` (Cleveland), next to the Neon database in `us-east-2`.

1. Import the GitHub repo in Vercel (Add New → Project). The framework is detected as Next.js; leave the build settings as they are.
2. Under Settings → Environment Variables, add these for **Production** (and Preview, if you use preview deploys):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled URL (host contains `-pooler`) |
   | `DIRECT_URL` | Neon direct URL (same, without `-pooler`). Used by migrations during the build. |
   | `SESSION_SECRET` | A new random string (`openssl rand -base64 32`), not the local one |
   | `NEXT_PUBLIC_SITE_URL` | The public site URL, e.g. `https://your-domain.com` (no trailing slash) |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials. Required: Vercel has no disk for uploads. |

   Leave `ALLOW_LOCAL_UPLOADS` unset. `NEXT_PUBLIC_SITE_URL` is built into the client bundle, so redeploy after changing it.
3. Deploy. Pushes to `main` then deploy to production automatically.
4. After adding a custom domain, update `NEXT_PUBLIC_SITE_URL` and redeploy.

Product photos saved to `.uploads/` during local development are not deployed. Re-upload those in the admin (with Cloudinary configured) before going live.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `lint` / `typecheck` | ESLint and TypeScript checks |
| `db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `db:deploy` | Apply existing migrations (production) |
| `db:seed` | Run `prisma/seed.ts` (categories, sample products, a sample discount). It is safe to run more than once. |
| `db:studio` | Open Prisma Studio to browse data |
| `db:generate` | Regenerate the Prisma client |
| `db:local` | Start the local Prisma Postgres server in the background |
| `admin:set` | Create or update the single admin account. Changing the password signs out all sessions. |

## Project layout

```
app/          routes, layouts, route handlers
components/   shared UI (components/ui = shadcn/ui)
features/     feature modules: products, cart, checkout, orders, customers, admin
lib/          db client, env validation, auth, image storage, utilities (lib/generated = Prisma client, not committed)
prisma/       schema, migrations, seed
types/        shared TypeScript types
docs/         plan and project docs
```

Admin auth lives in `lib/auth/`. `proxy.ts` does a quick cookie check on `/admin/*`; every admin page and server action must also call `requireAdmin()`.

Server-only code (`lib/db.ts`, `lib/env.ts`, `lib/auth/session.ts`) imports `server-only`, so importing it from a client component fails the build.
