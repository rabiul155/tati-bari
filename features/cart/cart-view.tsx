"use client";

import Image from "next/image";
import Link from "next/link";
import { RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cart, useCartItems } from "@/features/cart/cart-store";
import type { QuotedLine } from "@/features/cart/cart-schema";
import { QuantityStepper } from "@/features/cart/quantity-stepper";
import { useCartQuote } from "@/features/cart/use-cart-quote";
import { DELIVERY_CHARGES } from "@/features/checkout/delivery";
import { formatTaka } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CartView() {
  const items = useCartItems();
  const { quote, loading, failed, retry } = useCartQuote(items);

  if (items === null || (items.length > 0 && !quote && !failed)) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-4 py-16 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-lg font-medium">আপনার কার্ট খালি</p>
        <Link href="/shop" className={buttonVariants({ size: "lg", className: "px-5" })}>
          শাড়ি দেখুন
        </Link>
      </div>
    );
  }

  if (!quote) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <p>সর্বশেষ দাম লোড করা যায়নি। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
        <Button type="button" variant="outline" onClick={retry}>
          <RefreshCw /> আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  // Server prices with the quantities currently in the cart. These totals
  // are for display only; checkout recalculates everything on the server.
  const linesById = new Map(quote.lines.map((line) => [line.productId, line]));
  const rows = items.flatMap((item) => {
    const line = linesById.get(item.productId);
    return line ? [{ ...line, quantity: item.quantity, lineTotal: line.finalUnitPrice * item.quantity }] : [];
  });
  const counted = rows.filter((row) => row.available);
  const subtotal = counted.reduce((sum, row) => sum + row.lineTotal, 0);
  const savings = counted.reduce((sum, row) => sum + row.unitDiscount * row.quantity, 0);
  const itemCount = counted.reduce((sum, row) => sum + row.quantity, 0);
  const unavailable = rows.filter((row) => !row.available);
  // The discount is only shown once the server quote matches the cart.
  const discount = loading ? 0 : (quote.discount?.amount ?? 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-label="কার্টের পণ্য" className={cn("flex flex-col gap-4", loading && "opacity-70")}>
        {unavailable.length > 0 && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>
              {unavailable.length === 1 ? "একটি শাড়ি" : `${unavailable.length}টি শাড়ি`} আপনার
              নির্বাচিত পরিমাণে পাওয়া যাচ্ছে না। চালিয়ে যেতে পরিমাণ পরিবর্তন করুন বা সরিয়ে দিন।
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cart.removeMany(unavailable.map((row) => row.productId))}
            >
              অনুপলব্ধ পণ্য সরান
            </Button>
          </div>
        )}
        <ul className="divide-y rounded-2xl border bg-card">
          {rows.map((row) => (
            <CartRow key={row.productId} line={row} />
          ))}
        </ul>
        {failed && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            দাম পুরনো হতে পারে।
            <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={retry}>
              রিফ্রেশ করুন
            </Button>
          </p>
        )}
        <Link href="/shop" className="w-fit text-sm text-primary underline-offset-4 hover:underline">
          ← কেনাকাটা চালিয়ে যান
        </Link>
      </section>

      <aside aria-label="অর্ডার সারাংশ" className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-heading text-xl font-semibold">অর্ডার সারাংশ</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>সাবটোটাল ({itemCount}টি পণ্য)</dt>
            <dd className="font-medium tabular-nums">{formatTaka(subtotal)}</dd>
          </div>
          {savings > 0 && (
            <div className="flex justify-between gap-4 text-primary">
              <dt>ছাড়ে সাশ্রয়</dt>
              <dd className="tabular-nums">−{formatTaka(savings)}</dd>
            </div>
          )}
          {discount > 0 && quote.discount && (
            <div className="flex justify-between gap-4 text-primary">
              <dt>{quote.discount.name}</dt>
              <dd className="tabular-nums">−{formatTaka(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt>ডেলিভারি</dt>
            <dd className="text-right tabular-nums">
              {formatTaka(DELIVERY_CHARGES.insideDhaka)} ঢাকার ভিতরে
              <br />
              {formatTaka(DELIVERY_CHARGES.outsideDhaka)} ঢাকার বাইরে
            </dd>
          </div>
          <div className="mt-2 flex justify-between gap-4 border-t pt-3 text-base">
            <dt className="font-semibold">সর্বমোট</dt>
            <dd className="text-right font-semibold tabular-nums">
              {formatTaka(subtotal - discount + DELIVERY_CHARGES.insideDhaka)}
              <span className="block text-xs font-normal text-muted-foreground">
                {formatTaka(subtotal - discount + DELIVERY_CHARGES.outsideDhaka)} ঢাকার বাইরে
              </span>
            </dd>
          </div>
        </dl>
        {!loading && quote.nextDiscount && (
          <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
            আরও {formatTaka(quote.nextDiscount.remaining)} যোগ করে পান{" "}
            <strong>{formatTaka(quote.nextDiscount.amount)} ছাড়</strong>।
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          ডেলিভারি চার্জ অর্ডারের সময় {site.deliveryPayment.wallets}-এ অগ্রিম দিতে হবে (জেলা অনুযায়ী)। শাড়ির দাম অর্ডার হাতে পেয়ে
          ক্যাশে পরিশোধ করুন।
        </p>
        {unavailable.length > 0 || loading ? (
          <Button type="button" size="lg" disabled>
            চেকআউট
          </Button>
        ) : (
          <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
            চেকআউট
          </Link>
        )}
      </aside>
    </div>
  );
}

function CartRow({ line }: { line: QuotedLine }) {
  return (
    <li className={cn("flex gap-4 p-4", !line.available && "bg-muted/50")}>
      <Link
        href={`/products/${line.slug}`}
        className="relative aspect-3/4 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:w-24"
      >
        {line.imageUrl && (
          <Image src={line.imageUrl} alt="" fill sizes="96px" className={cn("object-cover", !line.available && "opacity-50")} />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.slug}`} className="font-medium underline-offset-4 hover:underline">
              {line.name}
            </Link>
            <p className="text-xs text-muted-foreground">কোড: {line.code}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`${line.name} সরান`}
            onClick={() => cart.remove(line.productId)}
          >
            <Trash2 />
          </Button>
        </div>

        {line.available ? (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm">
                {formatTaka(line.finalUnitPrice)}
                {line.unitDiscount > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    {formatTaka(line.unitPrice)}
                  </span>
                )}
                <span className="text-muted-foreground"> প্রতি পিস</span>
              </p>
              <QuantityStepper
                size="sm"
                label={`${line.name}-এর পরিমাণ`}
                value={line.quantity}
                onChange={(value) => cart.setQuantity(line.productId, value)}
              />
            </div>
            <p className="font-semibold tabular-nums">{formatTaka(line.lineTotal)}</p>
          </div>
        ) : line.stockLeft !== null && line.stockLeft > 0 && line.stockLeft < line.quantity ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="font-medium text-destructive">
              মাত্র {line.stockLeft}টি বাকি আছে (আপনার কাছে {line.quantity}টি আছে)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cart.setQuantity(line.productId, line.stockLeft!)}
            >
              {line.stockLeft}-এ পরিবর্তন করুন
            </Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-destructive">আর পাওয়া যাচ্ছে না</p>
        )}
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="কার্ট লোড হচ্ছে">
      <div className="flex flex-col gap-4 rounded-2xl border p-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="aspect-3/4 w-20 animate-pulse rounded-md bg-muted sm:w-24" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
