import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/admin/copy-button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrder } from "@/features/admin/orders/queries";
import { ShippingForm } from "@/features/admin/orders/shipping-form";
import { StatusPanel } from "@/features/admin/orders/status-panel";
import { orderUrl } from "@/features/orders/order-access";
import { formatOrderNumber, parseOrderNumber } from "@/features/orders/order-number";
import { ORDER_STATUS } from "@/features/orders/status";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatTaka } from "@/lib/format";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[number]">): Promise<Metadata> {
  return { title: `Order ${decodeURIComponent((await params).number)}` };
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[number]">) {
  await requireAdmin();
  const number = parseOrderNumber(decodeURIComponent((await params).number));
  const order = number === null ? null : await getAdminOrder(number);
  if (!order) notFound();

  const displayNumber = formatOrderNumber(order.number);
  const customerLink = `${siteUrl()}${orderUrl(order)}`;
  const whatsappNumber = `88${order.customerPhone}`;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Order ${displayNumber}`}
        description={`Placed ${formatDateTime(order.createdAt)} · Cash on delivery`}
        back={{ href: "/admin/orders", label: "Orders" }}
      >
        <OrderStatusBadge status={order.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Items ({itemCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-3 first:pt-0">
                    <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden rounded bg-muted">
                      {item.productImageUrl && (
                        <Image src={item.productImageUrl} alt="" fill unoptimized className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <Link
                        href={`/admin/products/${item.product.id}/edit`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-muted-foreground">
                        Code {item.productCode}
                        {item.product.archivedAt && " · archived"}
                        {item.product.stockQuantity !== null && ` · ${item.product.stockQuantity} in stock now`}
                      </p>
                      <p>
                        {item.quantity} × {formatTaka(item.finalUnitPrice)}
                        {item.unitDiscount > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            (regular {formatTaka(item.unitPrice)}, −{formatTaka(item.unitDiscount)} each)
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">{formatTaka(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <dl className="ml-auto flex w-full max-w-xs flex-col gap-1.5 border-t pt-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt>Discount{order.discountName && ` (${order.discountName})`}</dt>
                    <dd className="tabular-nums">−{formatTaka(order.discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt>Delivery ({order.deliveryDistrict})</dt>
                  <dd className="tabular-nums">{formatTaka(order.deliveryCharge)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
                  <dt>Collect on delivery</dt>
                  <dd className="tabular-nums">{formatTaka(order.total)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping &amp; notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingForm
                orderId={order.id}
                initial={{
                  courierName: order.courierName ?? "",
                  trackingNumber: order.trackingNumber ?? "",
                  adminNote: order.adminNote ?? "",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-4">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-1 border-l-2 pl-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.fromStatus && (
                        <>
                          <span className="text-muted-foreground">{ORDER_STATUS[entry.fromStatus].label}</span>
                          <span aria-hidden>→</span>
                        </>
                      )}
                      <OrderStatusBadge status={entry.toStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(entry.createdAt)} · {entry.changedBy?.name ?? "System"}
                    </p>
                    {entry.note && <p className="whitespace-pre-line">{entry.note}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPanel orderId={order.id} status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <Link
                  href={`/admin/customers/${order.customer.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {order.customerName}
                </Link>
                {order.customer._count.orders > 1 ? (
                  <Badge variant="secondary" className="ml-2">
                    {order.customer._count.orders} orders
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">
                    First order
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${order.customerPhone}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {order.customerPhone}
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground underline-offset-4 hover:underline"
                >
                  WhatsApp
                </a>
              </div>
              <div>
                <p className="font-medium">Delivery address</p>
                <p className="whitespace-pre-line">{order.deliveryAddress}</p>
                <p>
                  {order.deliveryArea}, {order.deliveryDistrict}
                  {order.deliveryPostalCode && ` ${order.deliveryPostalCode}`}
                </p>
              </div>
              {order.customerNote && (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="font-medium">Customer note</p>
                  <p className="whitespace-pre-line">{order.customerNote}</p>
                </div>
              )}
              <div className="flex flex-col gap-1 border-t pt-3">
                <p className="text-muted-foreground">Customer&apos;s order page (private link)</p>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={customerLink} label="Copy link" />
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Your order ${displayNumber}: ${customerLink}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                  >
                    Send on WhatsApp
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
