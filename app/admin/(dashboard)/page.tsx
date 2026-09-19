import type { Metadata } from "next";
import Link from "next/link";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardStats } from "@/features/admin/orders/queries";
import { ORDER_STATUS } from "@/features/orders/status";
import { requireAdmin } from "@/lib/auth/session";
import { formatTaka } from "@/lib/format";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ড্যাশবোর্ড" };

const WORK_QUEUE: { status: OrderStatus; hint: string }[] = [
  { status: "PENDING", hint: "নিশ্চিত করতে কল করুন" },
  { status: "CONFIRMED", hint: "শাড়ি সংগ্রহ করুন" },
  { status: "PREPARING", hint: "প্যাক করে হস্তান্তর করুন" },
  { status: "SHIPPED", hint: "কুরিয়ারের কাছে" },
];

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const sales = [
    { label: "আজ", ...stats.sales.today },
    { label: "গত ৭ দিন", ...stats.sales.last7Days },
    { label: "এই মাসে", ...stats.sales.thisMonth },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`হ্যালো, ${admin.name.split(" ")[0]}`} description="আপনার মনোযোগ প্রয়োজন এমন বিষয়গুলো এখানে।" />

      <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
        <h2 id="queue-heading" className="text-lg font-semibold">
          যেসব অর্ডার সামলাতে হবে
        </h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {WORK_QUEUE.map(({ status, hint }) => {
            const count = stats.byStatus[status] ?? 0;
            return (
              <li key={status}>
                <Link
                  href={`/admin/orders?status=${status}`}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50",
                    status === "PENDING" && count > 0 && "border-amber-400 bg-amber-50",
                  )}
                >
                  <span className="text-sm text-muted-foreground">{ORDER_STATUS[status].label}</span>
                  <span className="text-3xl font-semibold tabular-nums">{count}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="sales-heading" className="flex flex-col gap-3">
        <h2 id="sales-heading" className="text-lg font-semibold">
          বিক্রয়
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {sales.map((period) => (
            <li key={period.label} className="flex flex-col gap-1 rounded-xl border bg-card p-4">
              <span className="text-sm text-muted-foreground">{period.label}</span>
              <span className="text-2xl font-semibold tabular-nums">{formatTaka(period.total)}</span>
              <span className="text-xs text-muted-foreground">{period.orders}টি অর্ডার</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          ডেলিভারিসহ অর্ডারের সর্বমোট, বাতিল ও ফেরত দেওয়া অর্ডার বাদে। বাংলাদেশ সময়।
        </p>
      </section>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recent-heading" className="text-lg font-semibold">
            সাম্প্রতিক অর্ডার
          </h2>
          <Link href="/admin/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
            সব অর্ডার
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-muted-foreground">এখনও কোনো অর্ডার নেই।</p>
        ) : (
          <OrdersTable orders={stats.recentOrders} />
        )}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 text-sm">
        <span>
          শপে {stats.activeProducts}টি পণ্য
          {stats.unavailableProducts > 0 && `, ${stats.unavailableProducts}টি স্টকে নেই`}।
        </span>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          পণ্য যোগ করুন
        </Link>
        {stats.unavailableProducts > 0 && (
          <Link href="/admin/products?availability=UNAVAILABLE" className={buttonVariants({ variant: "outline", size: "sm" })}>
            স্টকে নেই এমন দেখুন
          </Link>
        )}
      </section>
    </div>
  );
}
