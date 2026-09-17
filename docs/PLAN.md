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
| 2 | Image storage | Cloudinary (automatic resizing) | |
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

### Phase 3 — Admin authentication (~1–1.5 h)
- [ ] Email + password login (hashed passwords), signed httpOnly session cookie
- [ ] `proxy.ts` protects all `/admin` routes
- [ ] Session re-checked inside every admin server action / route handler
- [ ] Seed command to create the first admin user
- [ ] Logout

### Phase 4 — Product & category management (~2 h)
- [ ] Category CRUD
- [ ] Product create / edit / archive (no hard delete if referenced by orders)
- [ ] Fields: name, slug, product code/SKU, description, saree details, category, regular price, sale price, sale start/end, availability
- [ ] Multiple image upload with ordering and a primary image
- [ ] Admin product list with search and filters

### Phase 5 — Storefront pages (~2–2.5 h)
- [ ] Site layout: header, footer, social links
- [ ] Home: brand intro, featured, new arrivals, on sale, categories, trust info
- [ ] Shop: product grid, category / price filters, sort (URL search params)
- [ ] Product details: gallery, code, description, details, price / sale price, availability, quantity selector, Add to Cart
- [ ] About / Contact page
- [ ] Open Graph metadata so Facebook product links preview well

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
