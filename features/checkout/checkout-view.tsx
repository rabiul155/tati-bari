"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cart, useCartItems } from "@/features/cart/cart-store";
import { useCartQuote } from "@/features/cart/use-cart-quote";
import { placeOrder } from "@/features/checkout/actions";
import { getDeliveryCharge } from "@/features/checkout/delivery";
import { DISTRICTS } from "@/features/checkout/districts";
import { forgetDetails, loadSavedDetails, saveDetails } from "@/features/checkout/saved-details";
import { checkoutDetailsSchema, type CheckoutFormValues } from "@/features/checkout/schema";
import { saveOrder } from "@/features/orders/order-history";
import { formatTaka } from "@/lib/format";

const EMPTY_VALUES: CheckoutFormValues = {
  name: "",
  phone: "",
  district: "" as CheckoutFormValues["district"],
  area: "",
  address: "",
  postalCode: "",
  note: "",
  website: "",
};

export function CheckoutView() {
  const router = useRouter();
  const items = useCartItems();
  const { quote, loading, failed, retry } = useCartQuote(items);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const [redirecting, setRedirecting] = useState(false);
  const [remember, setRemember] = useState(true);

  const form = useForm<CheckoutFormValues, unknown, unknown>({
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { register, formState, control, setError, reset } = form;
  const error = (name: keyof CheckoutFormValues) => formState.errors[name]?.message;
  const field = (name: keyof CheckoutFormValues) => ({
    id: name,
    "aria-invalid": !!error(name),
    "aria-describedby": `${name}-message`,
  });

  // Prefill details from the last order placed in this browser.
  useEffect(() => {
    const saved = loadSavedDetails();
    if (saved) reset({ ...EMPTY_VALUES, ...saved });
  }, [reset]);

  const district = useWatch({ control, name: "district" });

  if (redirecting) {
    return <p role="status" className="py-16 text-center text-lg">Order placed! Opening your order…</p>;
  }
  if (items === null || (items.length > 0 && !quote && !failed)) {
    return <p role="status" className="py-16 text-center text-muted-foreground">Loading your cart…</p>;
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-4 py-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/shop" className={buttonVariants({ size: "lg", className: "px-5" })}>
          Browse sarees
        </Link>
      </div>
    );
  }
  if (!quote) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <p>We couldn&apos;t load your cart. Check your connection and try again.</p>
        <Button type="button" variant="outline" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const quoteIsCurrent = !loading;
  const discount = quote.discount?.amount ?? 0;
  const deliveryCharge = district ? getDeliveryCharge(district) : null;
  const total = deliveryCharge === null ? null : quote.subtotal - discount + deliveryCharge;
  const canOrder = quoteIsCurrent && !failed && !quote.hasUnavailable && quote.lines.length > 0;

  const onSubmit = form.handleSubmit(() => {
    if (!canOrder || total === null) return;
    setFormError(undefined);
    const details = form.getValues();
    const orderItems = items;
    startTransition(async () => {
      const result = await placeOrder({ details, items: orderItems, expectedTotal: total });
      if (result.ok) {
        saveOrder(result.order);
        if (remember) saveDetails(details);
        else forgetDetails();
        setRedirecting(true);
        cart.clear();
        router.replace(`${result.order.url}&placed=1`);
        return;
      }
      setFormError(result.message);
      if (result.reason === "cart") retry();
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) setError(name as keyof CheckoutFormValues, { message: messages[0] });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="flex flex-col gap-6">
        <FormError message={formError} />

        <fieldset className="flex flex-col gap-5 rounded-2xl border bg-card p-5">
          <legend className="px-1 font-heading text-xl font-semibold">Your details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="name" label="Full name" error={error("name")}>
              <Input {...field("name")} autoComplete="name" {...register("name")} />
            </FormField>
            <FormField id="phone" label="Mobile number" hint="We will call this number to confirm your order." error={error("phone")}>
              <Input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...register("phone")} />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-5 rounded-2xl border bg-card p-5">
          <legend className="px-1 font-heading text-xl font-semibold">Delivery address</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="district" label="District" error={error("district")}>
              <NativeSelect {...field("district")} className="w-full" autoComplete="address-level1" {...register("district")}>
                <NativeSelectOption value="">Choose your district…</NativeSelectOption>
                {DISTRICTS.map((name) => (
                  <NativeSelectOption key={name} value={name}>
                    {name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="area" label="Area / thana" error={error("area")}>
              <Input {...field("area")} autoComplete="address-level2" placeholder="e.g. Mirpur" {...register("area")} />
            </FormField>
            <FormField id="address" label="Full address" hint="House, road, village or a landmark the courier can find." error={error("address")} className="sm:col-span-2">
              <Textarea {...field("address")} rows={3} autoComplete="street-address" {...register("address")} />
            </FormField>
            <FormField id="postalCode" label="Postal code (optional)" error={error("postalCode")}>
              <Input {...field("postalCode")} inputMode="numeric" autoComplete="postal-code" maxLength={4} {...register("postalCode")} />
            </FormField>
            <FormField id="note" label="Note for us (optional)" hint="e.g. best time to call" error={error("note")} className="sm:col-span-2">
              <Textarea {...field("note")} rows={2} {...register("note")} />
            </FormField>
          </div>
          {/* Honeypot: hidden from people and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 accent-primary"
            />
            Remember my details on this device for next time
          </label>
        </fieldset>

        <section className="flex flex-col gap-1 rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-xl font-semibold">Payment</h2>
          <p className="font-medium">Cash on delivery</p>
          <p className="text-sm text-muted-foreground">
            Pay the courier when your order arrives. We will call you to confirm the order before
            sending it.
          </p>
        </section>
      </div>

      <aside aria-label="Order summary" className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">Your order</h2>
          <Link href="/cart" className="text-sm text-primary underline-offset-4 hover:underline">
            Edit cart
          </Link>
        </div>

        {quote.hasUnavailable && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Some sarees are no longer available.{" "}
            <Link href="/cart" className="font-medium underline">
              Update your cart
            </Link>{" "}
            to continue.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {quote.lines.map((line) => (
            <li key={line.productId} className="flex gap-3">
              <div className="relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{line.name}</p>
                <p className="text-muted-foreground">
                  {line.quantity} × {formatTaka(line.finalUnitPrice)}
                </p>
                {!line.available && <p className="text-destructive">Not available</p>}
              </div>
              <p className="text-sm font-medium tabular-nums">{formatTaka(line.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatTaka(quote.subtotal)}</dd>
          </div>
          {quote.discount && (
            <div className="flex justify-between gap-4 text-primary">
              <dt>{quote.discount.name}</dt>
              <dd className="tabular-nums">−{formatTaka(quote.discount.amount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt>Delivery{district ? ` (${district})` : ""}</dt>
            <dd className="tabular-nums">
              {deliveryCharge === null ? <span className="text-muted-foreground">Choose district</span> : formatTaka(deliveryCharge)}
            </dd>
          </div>
          <div className="mt-1 flex justify-between gap-4 border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{total === null ? "—" : formatTaka(total)}</dd>
          </div>
        </dl>

        <Button type="submit" size="lg" disabled={pending || !canOrder}>
          {pending ? "Placing order…" : total === null ? "Place order" : `Place order · ${formatTaka(total)}`}
        </Button>
        <p className="text-xs text-muted-foreground">
          By placing the order you agree to receive a confirmation call on your mobile number.
        </p>
      </aside>
    </form>
  );
}
