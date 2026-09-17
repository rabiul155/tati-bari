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

export const metadata: Metadata = { title: "Dashboard" };

const WORK_QUEUE: { status: OrderStatus; hint: string }[] = [
  { status: "PENDING", hint: "Call to confirm" },
  { status: "CONFIRMED", hint: "Source the sarees" },
  { status: "PREPARING", hint: "Pack and hand over" },
  { status: "SHIPPED", hint: "With the courier" },
];

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const sales = [
    { label: "Today", ...stats.sales.today },
    { label: "Last 7 days", ...stats.sales.last7Days },
    { label: "This month", ...stats.sales.thisMonth },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Hello, ${admin.name.split(" ")[0]}`} description="Here is what needs your attention." />

      <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
        <h2 id="queue-heading" className="text-lg font-semibold">
          Orders to handle
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
          Sales
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {sales.map((period) => (
            <li key={period.label} className="flex flex-col gap-1 rounded-xl border bg-card p-4">
              <span className="text-sm text-muted-foreground">{period.label}</span>
              <span className="text-2xl font-semibold tabular-nums">{formatTaka(period.total)}</span>
              <span className="text-xs text-muted-foreground">
                {period.orders} order{period.orders === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Order totals including delivery, excluding cancelled and returned orders. Bangladesh time.
        </p>
      </section>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recent orders
          </h2>
          <Link href="/admin/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
            All orders
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <OrdersTable orders={stats.recentOrders} />
        )}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 text-sm">
        <span>
          {stats.activeProducts} products in the shop
          {stats.unavailableProducts > 0 && `, ${stats.unavailableProducts} out of stock`}.
        </span>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          Add product
        </Link>
        {stats.unavailableProducts > 0 && (
          <Link href="/admin/products?availability=UNAVAILABLE" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View out of stock
          </Link>
        )}
      </section>
    </div>
  );
}
