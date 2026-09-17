# Tangail Saree E-Commerce — V1 Build Plan

Source: `Tangail_Saree_Ecommerce_Website_Requirements.pdf` (V1 MVP).

Stack: Next.js 16.3 (App Router) + React 19 + TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod, PostgreSQL + Prisma, deployed on Vercel.

> Next.js 16 has breaking changes (e.g. `middleware.ts` → `proxy.ts`). Check `node_modules/next/dist/docs/` before writing code for each phase.

## Estimate

- Active build time: ~10–14 hours across 4–6 sessions.
- Calendar time to launch: ~1–1.5 weeks, including review, real product content, and infra setup.

## Decisions (answer before Phase 1)

| # | Question | Recommendation | Answer |
|---|---|---|---|
| 1 | Database host | Neon (free Postgres) | |
| 2 | Image storage | Cloudinary (automatic resizing) | Cloudinary assumed; code supports it, account still needed |
| 3 | Delivery charge | Flat, or inside/outside Dhaka (e.g. ৳70 / ৳130) | |
| 4 | Payment | Cash on delivery only for V1 | |
| 5 | Site language | English, Bangla, or both (+1–2 h) | |
| 6 | Brand | Name, logo, colors, Facebook URL, phone/WhatsApp | |
| 7 | New-order email alert | Yes, via Resend (+~30 min) | |

## Phases

Each phase ends with something working you can review before moving on.

### Phase 1 — Setup (~1 h) ✅
- [x] Install Prisma, Zod, React Hook Form, shadcn/ui
- [x] Folder layout: `app/`, `components/`, `features/`, `lib/`, `prisma/`, `types/`
- [x] `.env.example` with all required variables; env validation in `lib/env.ts`
- [x] Prisma client singleton in `lib/db.ts`
- [x] Seed script (categories now; sample products added in Phase 2)
- [x] Local Postgres via `npm run db:local`; first migration (`Category`) applied

### Phase 2 — Database schema (~1 h) ✅
- [x] Models: `Category` (done in Phase 1), `Product`, `ProductImage`, `Customer`, `CustomerAddress`, `Order`, `OrderItem`, `OrderStatusHistory`, `AdminUser`, `Discount`
- [x] Money stored as integer taka
- [x] `OrderItem` stores price snapshot (product name, code, unit price, discount, final unit price, line total)
- [x] `Order` stores customer/delivery snapshot (name, phone, address, district, area, postal code), subtotal, discount, delivery charge, total
- [x] `OrderStatus` enum: Pending, Confirmed, Preparing, Shipped, Delivered, Cancelled, Returned
- [x] Optional courier name + tracking number on `Order`
- [x] Human-friendly order number (e.g. `TS-000123`): sequential `Order.number`, formatted in `features/orders/order-number.ts`
- [x] Migration `catalog_orders_admin` applied, with CHECK constraints on prices and totals
- [x] Seed: 6 sample products (no images yet) + 1 sample order discount

### Phase 3 — Admin authentication (~1–1.5 h) ✅
Single admin account and no customer login. The safeguards are kept small but complete.
- [x] Email + password login: scrypt-hashed password (`lib/auth/password.ts`), HMAC-signed httpOnly cookie scoped to `/admin`, valid for 7 days
- [x] `proxy.ts` sends visitors without a validly signed cookie to `/admin/login`
- [x] `requireAdmin()` (`lib/auth/session.ts`) re-checks the session against the database in every admin page and action
- [x] Login lockout: 5 failed attempts lock the account for 15 min; login errors don't reveal whether the email exists
- [x] `npm run admin:set` creates or updates the single admin; changing the password signs out all sessions
- [x] Logout signs out every device (bumps `AdminUser.sessionVersion`)

### Phase 4 — Product & category management (~2 h) ✅
- [x] Category CRUD (`/admin/categories`); only empty categories can be deleted
- [x] Product create / edit / archive / restore; delete only when the product is not in any order
- [x] Fields: name, slug, product code/SKU, description, saree details (fabric, colour, length, blouse piece, care), category, regular price, sale price, sale start/end (Bangladesh time), availability, optional stock, featured
- [x] Multiple image upload with ordering; the first photo is the main one. Photos are resized in the browser, then re-encoded server-side to WebP (max 2000 px, metadata incl. GPS removed)
- [x] Image storage: Cloudinary when `CLOUDINARY_*` is set, local `.uploads/` folder otherwise (development only)
- [x] Admin product list with search (name/code), category / availability / archived filters and pagination
- [x] Shared price rule `features/catalog/pricing.ts` (sale window), reused by the storefront and checkout

### Phase 5 — Storefront pages (~2–2.5 h) ✅
- [x] Site layout: header, footer, contact/social links from `lib/site.ts` (placeholders until decision 6; empty links are hidden)
- [x] Home: brand intro, featured, categories, on sale, new arrivals, trust info
- [x] Shop (`/shop`): product grid, category chips, price range, in-stock filter, sort, pagination (URL search params)
- [x] Product details (`/products/[slug]`): gallery, code, description, details, price / sale price, availability, quantity selector. Add to Cart is disabled until Phase 6
- [x] About / Contact page (`/about`, placeholder story)
- [x] Open Graph + Product JSON-LD; Cloudinary photos are served to Facebook as 1200×630 JPEG; default share image; `sitemap.xml`, `robots.txt`
- [x] Caching: home and product pages refresh every 5 min (sale windows) and immediately after admin edits
- [x] Warm cream / maroon theme and serif headings (placeholder until brand colours are chosen)

### Phase 6 — Cart (~1 h)
- [ ] Client cart persisted in localStorage (product id + quantity only)
- [ ] Add / update quantity / remove, cart badge in header
- [ ] Cart page: items, unit prices, discounts, subtotal, delivery charge, total
- [ ] Prices refreshed from the server; client totals are display-only

### Phase 7 — Guest checkout & order creation (~1.5–2 h)
- [ ] Checkout form: name, phone (Bangladesh format), address, district, area, optional postal code
- [ ] Zod validation on client and server
- [ ] Server recalculates all prices, sale windows, order discount, delivery charge
- [ ] Reject unavailable/archived products
- [ ] Upsert `Customer` by phone; save `CustomerAddress`
- [ ] Create `Order` + `OrderItem`s + initial `OrderStatusHistory` in one transaction
- [ ] Order confirmation page: order number, summary, total, delivery info, next steps
- [ ] Clear cart after successful order
- [ ] Save placed orders (order number + phone) in localStorage for a "My orders" page
- [ ] Order lookup when localStorage is lost. **Decide:** phone + order number (recommended), or phone only with a reduced view (no name/address)
- [ ] (Optional) new-order email to admin

### Phase 8 — Admin order management (~2 h)
- [ ] Dashboard: pending / confirmed counts, sales summary, recent orders
- [ ] Order list with status filter and search (order number, phone)
- [ ] Order detail: customer, items, pricing, discount, delivery, current status, history
- [ ] Status update with optional note → writes `OrderStatusHistory` with timestamp
- [ ] Courier name / tracking number fields
- [ ] Customers list and customer detail with previous orders

### Phase 9 — Discounts (~0.5–1 h)
- [ ] Admin CRUD for order-level discount (fixed amount above minimum order value, active dates, on/off)
- [ ] Applied server-side at checkout; shown in cart/checkout
- [ ] Applied discount saved on the order

### Phase 10 — Testing, security, deployment (~1.5–2 h)
- [ ] Unit tests for pricing logic (sale windows, order discount, delivery charge, totals)
- [ ] One end-to-end test: add items → checkout → order visible in admin
- [ ] Security checklist (requirements §19): admin routes protected, server validation, server-side totals, no price manipulation, price snapshots, secure env vars
- [ ] Deploy to Vercel, connect production DB and image storage
- [ ] Enable database backups
- [ ] Custom domain + HTTPS

## Owner to-do (outside the code)

- [ ] Real product photos and descriptions
- [ ] Create DB and image storage accounts (guidance provided)
- [ ] Register domain
- [ ] Test the full order flow on a phone before the Facebook launch

## Out of scope for V1

Customer accounts / OTP, online payment, courier API, live tracking, coupon engine, wishlist, reviews, advanced analytics, inventory/warehouse system, mobile app.
