import type { Metadata } from "next";
import Link from "next/link";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/page-header";
import { firstParam, pageParam, Pagination } from "@/components/admin/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listOrders } from "@/features/admin/orders/queries";
import { ALL_STATUSES, ORDER_STATUS } from "@/features/orders/status";
import { requireAdmin } from "@/lib/auth/session";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "অর্ডার" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const params = await searchParams;
  const query = firstParam(params.q).slice(0, 100);
  const statusParam = firstParam(params.status);
  const status = ALL_STATUSES.includes(statusParam as OrderStatus) ? (statusParam as OrderStatus) : undefined;
  const page = pageParam(params.page);

  const { orders, total, statusCounts, pageCount } = await listOrders({ query, status, page });
  const allCount = Object.values(statusCounts).reduce((sum, n) => sum + (n ?? 0), 0);

  const href = (changes: { status?: OrderStatus | null; page?: number }) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    const nextStatus = changes.status === undefined ? status : changes.status;
    if (nextStatus) search.set("status", nextStatus);
    if (changes.page && changes.page > 1) search.set("page", String(changes.page));
    const qs = search.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  const tabs: { value: OrderStatus | null; label: string; count: number }[] = [
    { value: null, label: "সব", count: allCount },
    ...ALL_STATUSES.map((value) => ({
      value,
      label: ORDER_STATUS[value].label,
      count: statusCounts[value] ?? 0,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="অর্ডার" description={`${total}টি অর্ডার`} />

      <nav aria-label="অবস্থা অনুযায়ী ফিল্টার" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {tabs.map((tab) => {
            const active = (tab.value ?? undefined) === status;
            return (
              <li key={tab.label}>
                <Link
                  href={href({ status: tab.value, page: 1 })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {tab.label}
                  <span className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
                    {tab.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" role="search" className="flex flex-wrap gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <Input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="অর্ডার নম্বর, ফোন নম্বর বা নাম"
          aria-label="অর্ডার খুঁজুন"
          className="w-full sm:w-72"
        />
        <Button type="submit" variant="secondary">
          খুঁজুন
        </Button>
        {query && (
          <Link
            href={status ? `/admin/orders?status=${status}` : "/admin/orders"}
            className={buttonVariants({ variant: "ghost" })}
          >
            মুছুন
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">
          {query || status ? "কোনো অর্ডার মেলেনি।" : "এখনও কোনো অর্ডার নেই। গ্রাহক চেকআউট করলে এখানে দেখা যাবে।"}
        </p>
      ) : (
        <OrdersTable orders={orders} />
      )}

      <Pagination page={page} pageCount={pageCount} href={(target) => href({ page: target })} />
    </div>
  );
}
