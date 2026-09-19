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

export const metadata: Metadata = { title: "গ্রাহক" };

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
      <PageHeader title="গ্রাহক" description={`${total} জন গ্রাহক`} />

      <form method="get" role="search" className="flex flex-wrap gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="নাম বা ফোন নম্বর"
          aria-label="গ্রাহক খুঁজুন"
          className="w-full sm:w-72"
        />
        <Button type="submit" variant="secondary">
          খুঁজুন
        </Button>
        {query && (
          <Link href="/admin/customers" className={buttonVariants({ variant: "ghost" })}>
            মুছুন
          </Link>
        )}
      </form>

      {customers.length === 0 ? (
        <p className="text-muted-foreground">{query ? "কোনো গ্রাহক মেলেনি।" : "এখনও কোনো গ্রাহক নেই।"}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>গ্রাহক</TableHead>
              <TableHead className="hidden md:table-cell">এলাকা</TableHead>
              <TableHead className="text-right">অর্ডার</TableHead>
              <TableHead className="text-right">মোট ব্যয়</TableHead>
              <TableHead className="hidden md:table-cell">সর্বশেষ অর্ডার</TableHead>
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
                    <div className="mt-1 text-xs whitespace-normal text-muted-foreground md:hidden">
                      {address ? `${address.area}, ${address.district}` : "—"}
                      {customer.lastOrderAt && <> · {formatDateTime(customer.lastOrderAt)}</>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{address ? `${address.area}, ${address.district}` : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{customer._count.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatTaka(customer.totalSpent)}</TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
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
