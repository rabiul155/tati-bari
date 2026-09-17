import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { firstParam, pageParam, Pagination } from "@/components/admin/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCustomers } from "@/features/admin/orders/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const params = await searchParams;
  const query = firstParam(params.q).slice(0, 100);
  const page = pageParam(params.page);
  const { customers, total, pageCount } = await listCustomers({ query, page });

  const href = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return `/admin/customers${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description={`${total} customer${total === 1 ? "" : "s"}`} />

      <form method="get" role="search" className="flex flex-wrap gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Name or phone"
          aria-label="Search customers"
          className="w-full sm:w-72"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {query && (
          <Link href="/admin/customers" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        )}
      </form>

      {customers.length === 0 ? (
        <p className="text-muted-foreground">{query ? "No customers match." : "No customers yet."}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead>Last order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const address = customer.addresses[0];
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  </TableCell>
                  <TableCell>{address ? `${address.area}, ${address.district}` : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{customer._count.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatTaka(customer.totalSpent)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Pagination page={page} pageCount={pageCount} href={href} />
    </div>
  );
}
