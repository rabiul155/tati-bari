"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupOrders, type LookupState } from "@/features/checkout/actions";
import { saveOrders, useSavedOrders } from "@/features/orders/order-history";
import { formatDateTime, formatTaka } from "@/lib/format";

export function SavedOrderList() {
  const orders = useSavedOrders();

  if (orders === null) {
    return (
      <div
        className="h-24 animate-pulse rounded-2xl bg-muted"
        aria-busy="true"
      />
    );
  }
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-muted-foreground">
        এই ডিভাইসে এখনও কোনো অর্ডার নেই। আপনি এখানে যে অর্ডার করবেন তা এই
        তালিকায় দেখাবে।
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {orders.map((order) => (
        <li key={order.number}>
          <Link
            href={order.url}
            className="flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">অর্ডার {order.number}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(new Date(order.placedAt))} · {order.itemCount}টি
                পণ্য
              </p>
            </div>
            <span className="font-medium tabular-nums">
              {formatTaka(order.total)} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OrderLookupForm() {
  // Found orders join this browser's list under "আমার অর্ডার".
  const [state, action, pending] = useActionState(
    async (previous: LookupState, formData: FormData) => {
      const result = await lookupOrders(previous, formData);
      if (result?.orders) saveOrders(result.orders);
      return result;
    },
    undefined,
  );
  const phoneError = state?.fieldErrors?.phone?.[0];

  return (
    <div className="flex flex-col gap-6">
      <form
        action={action}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
        noValidate
      >
        <FormField id="lookup-phone" label="মোবাইল নম্বর" error={phoneError}>
          <div className="flex gap-3">
            <Input
              id="lookup-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              defaultValue={state?.values?.phone}
              aria-invalid={!!phoneError}
              aria-describedby="lookup-phone-message"
              required
              className="h-8 flex-1"
            />
            <Button type="submit" className="h-8 px-4" disabled={pending}>
              {pending ? "খোঁজা হচ্ছে…" : "অর্ডার খুঁজুন"}
            </Button>
          </div>
        </FormField>
        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state?.orders && (
          <p role="status" className="text-sm text-primary">
            {state.orders.length}টি অর্ডার পাওয়া গেছে, উপরে &ldquo;আমার অর্ডার&rdquo; তালিকায় যোগ করা হয়েছে।
          </p>
        )}
      </form>
    </div>
  );
}
