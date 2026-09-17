"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupOrder } from "@/features/checkout/actions";
import { useSavedOrders } from "@/features/orders/order-history";
import { formatDateTime, formatTaka } from "@/lib/format";

export function SavedOrderList() {
  const orders = useSavedOrders();

  if (orders === null) {
    return <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy="true" />;
  }
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-muted-foreground">
        No orders on this device yet. Orders you place here will show up in this list.
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
              <p className="font-medium">Order {order.number}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(new Date(order.placedAt))} · {order.itemCount} item
                {order.itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <span className="font-medium tabular-nums">{formatTaka(order.total)} →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OrderLookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, undefined);
  const phoneError = state?.fieldErrors?.phone?.[0];
  const numberError = state?.fieldErrors?.orderNumber?.[0];

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border bg-card p-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="lookup-phone" label="Mobile number" error={phoneError}>
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
          />
        </FormField>
        <FormField id="lookup-number" label="Order number" hint="e.g. TS-000123" error={numberError}>
          <Input
            id="lookup-number"
            name="orderNumber"
            autoComplete="off"
            defaultValue={state?.values?.orderNumber}
            aria-invalid={!!numberError}
            aria-describedby="lookup-number-message"
            required
          />
        </FormField>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? "Finding…" : "Find my order"}
      </Button>
    </form>
  );
}
