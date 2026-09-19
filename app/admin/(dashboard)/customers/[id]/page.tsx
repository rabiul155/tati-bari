import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCustomer } from "@/features/admin/orders/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "গ্রাহক" };

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  await requireAdmin();
  const customer = await getAdminCustomer((await params).id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description={`গ্রাহক হয়েছেন ${formatDateTime(customer.createdAt)}`}
        back={{ href: "/admin/customers", label: "গ্রাহক" }}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>যোগাযোগ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <a href={`tel:${customer.phone}`} className="font-medium text-primary underline-offset-4 hover:underline">
              {customer.phone}
            </a>
            <a
              href={`https://wa.me/88${customer.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              WhatsApp
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>অর্ডার</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="text-2xl font-semibold tabular-nums">{customer.orders.length}</p>
            <p className="text-muted-foreground">
              মোট ব্যয় {formatTaka(customer.totalSpent)} (বাতিল ও ফেরত দেওয়া অর্ডার বাদে)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ঠিকানা</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-sm">
              {customer.addresses.map((address) => (
                <li key={address.id}>
                  {address.isDefault && (
                    <Badge variant="secondary" className="mb-1">
                      সর্বশেষ
                    </Badge>
                  )}
                  <p className="whitespace-pre-line">{address.address}</p>
                  <p className="text-muted-foreground">
                    {address.area}, {address.district}
                    {address.postalCode && ` ${address.postalCode}`}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">অর্ডারের ইতিহাস</h2>
        {customer.orders.length === 0 ? (
          <p className="text-muted-foreground">কোনো অর্ডার নেই।</p>
        ) : (
          <OrdersTable orders={customer.orders} showCustomer={false} />
        )}
      </section>
    </div>
  );
}
