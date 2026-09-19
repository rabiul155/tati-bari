import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CheckCircle2 } from "lucide-react";
import { ContactLinks } from "@/components/shop/contact-links";
import { buttonVariants } from "@/components/ui/button";
import { getOrderForCustomer, orderUrl } from "@/features/orders/order-access";
import { formatOrderNumber } from "@/features/orders/order-number";
import { ORDER_PROGRESS, ORDER_STATUS } from "@/features/orders/status";
import { RememberOrder } from "@/features/orders/remember-order";
import { formatDateTime, formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/orders/[number]">;

const getOrder = cache(getOrderForCustomer);

async function load({ params, searchParams }: Props) {
  const [{ number }, query] = await Promise.all([params, searchParams]);
  const key = typeof query.key === "string" ? query.key : undefined;
  return { order: await getOrder(number, key), placed: query.placed === "1" };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { order } = await load(props);
  return {
    title: order ? `অর্ডার ${formatOrderNumber(order.number)}` : "অর্ডার পাওয়া যায়নি",
    robots: { index: false, follow: false },
    // The URL contains the order's private key; don't pass it to other sites.
    referrer: "no-referrer",
  };
}

export default async function OrderPage(props: Props) {
  const { order, placed } = await load(props);
  if (!order) notFound();

  const number = formatOrderNumber(order.number);
  const status = ORDER_STATUS[order.status];
  const progressIndex = ORDER_PROGRESS.indexOf(order.status);
  const reachedAt = new Map(order.statusHistory.map((entry) => [entry.toStatus, entry.createdAt]));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <RememberOrder
        order={{
          number,
          url: orderUrl(order),
          total: order.total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          placedAt: order.createdAt.toISOString(),
        }}
      />

      {placed && (
        <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-secondary px-4 py-8 text-center">
          <CheckCircle2 className="size-12 text-green-700" aria-hidden />
          <h1 className="font-heading text-3xl font-semibold">ধন্যবাদ, {order.customerName.split(" ")[0]}!</h1>
          <p className="max-w-md text-muted-foreground">
            আপনার অর্ডার <strong className="text-foreground">{number}</strong> সম্পন্ন হয়েছে। শাড়ি
            পাঠানোর আগে নিশ্চিত করতে আমরা{" "}
            <strong className="text-foreground">{order.customerPhone}</strong> নম্বরে কল করব।
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            এই পেজটি এই ডিভাইসে{" "}
            <Link href="/orders" className="underline underline-offset-4">আমার অর্ডার</Link> এ সংরক্ষিত
            আছে। আপনার ফোন নম্বর ও অর্ডার নম্বর দিয়েও পরে এটি খুঁজে পেতে পারবেন।
          </p>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {placed ? (
            <h2 className="font-heading text-2xl font-semibold">অর্ডার {number}</h2>
          ) : (
            <h1 className="font-heading text-3xl font-semibold">অর্ডার {number}</h1>
          )}
          <p className="text-sm text-muted-foreground">অর্ডার করা হয়েছে {formatDateTime(order.createdAt)}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
          <p className="text-lg font-semibold">{status.label}</p>
          <p className="text-muted-foreground">{status.customerText}</p>
          {progressIndex >= 0 && (
            <ol className="mt-2 grid grid-cols-5 gap-1 text-center text-xs">
              {ORDER_PROGRESS.map((step, index) => (
                <li key={step} className="flex flex-col gap-1.5">
                  <span className={cn("h-1.5 rounded-full", index <= progressIndex ? "bg-primary" : "bg-muted")} />
                  <span className={index <= progressIndex ? "font-medium" : "text-muted-foreground"}>
                    {ORDER_STATUS[step].label}
                  </span>
                  {reachedAt.get(step) && index <= progressIndex && (
                    <span className="hidden text-muted-foreground sm:block">
                      {formatDateTime(reachedAt.get(step)!)}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {(order.courierName || order.trackingNumber) && (
            <p className="text-sm">
              কুরিয়ার: {order.courierName ?? "—"}
              {order.trackingNumber && <> · ট্র্যাকিং নম্বর: <strong>{order.trackingNumber}</strong></>}
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">পণ্যসমূহ</h2>
        <ul className="divide-y rounded-2xl border bg-card">
          {order.items.map((item) => {
            const linkable = item.product.archivedAt === null;
            return (
              <li key={item.id} className="flex gap-4 p-4">
                <div className="relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.productImageUrl && (
                    <Image src={item.productImageUrl} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  {linkable ? (
                    <Link href={`/products/${item.product.slug}`} className="font-medium underline-offset-4 hover:underline">
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-medium">{item.productName}</p>
                  )}
                  <p className="text-muted-foreground">কোড: {item.productCode}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} × {formatTaka(item.finalUnitPrice)}
                    {item.unitDiscount > 0 && (
                      <span className="ml-1 line-through">{formatTaka(item.unitPrice)}</span>
                    )}
                  </p>
                </div>
                <p className="font-medium tabular-nums">{formatTaka(item.lineTotal)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>সাবটোটাল</dt>
            <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between gap-4 text-primary">
              <dt>{order.discountName ?? "ছাড়"}</dt>
              <dd className="tabular-nums">−{formatTaka(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt>ডেলিভারি</dt>
            <dd className="tabular-nums">{formatTaka(order.deliveryCharge)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
            <dt>সর্বমোট (ক্যাশ অন ডেলিভারি)</dt>
            <dd className="tabular-nums">{formatTaka(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-2xl border bg-card p-5 text-sm">
          <h2 className="mb-1 font-heading text-lg font-semibold">ডেলিভারি ঠিকানা</h2>
          <p className="font-medium">{order.customerName}</p>
          <p>{order.customerPhone}</p>
          <p className="whitespace-pre-line">{order.deliveryAddress}</p>
          <p>
            {order.deliveryArea}, {order.deliveryDistrict}
            {order.deliveryPostalCode && ` ${order.deliveryPostalCode}`}
          </p>
          {order.customerNote && <p className="mt-2 text-muted-foreground">নোট: {order.customerNote}</p>}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-5 text-sm">
          <h2 className="mb-1 font-heading text-lg font-semibold">এরপর কী হবে</h2>
          <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
            <li>আমরা অর্ডার নিশ্চিত করতে আপনাকে কল করব।</li>
            <li>আপনার শাড়ি প্যাক করে কুরিয়ারে পাঠানো হবে।</li>
            <li>ডেলিভারিতে ক্যাশে {formatTaka(order.total)} পরিশোধ করবেন।</li>
          </ol>
          <p className="mt-2 font-medium">প্রশ্ন আছে? যোগাযোগ করুন:</p>
          <ContactLinks className="flex flex-col gap-1" />
        </div>
      </section>

      <Link href="/shop" className={buttonVariants({ variant: "outline", className: "w-fit" })}>
        কেনাকাটা চালিয়ে যান
      </Link>
    </div>
  );
}
