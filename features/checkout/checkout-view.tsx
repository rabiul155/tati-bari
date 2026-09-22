"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyButton } from "@/components/admin/copy-button";
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
import { loadSavedDetails, saveDetails } from "@/features/checkout/saved-details";
import { checkoutDetailsSchema, type CheckoutFormValues } from "@/features/checkout/schema";
import { saveOrder } from "@/features/orders/order-history";
import { formatTaka } from "@/lib/format";
import { site } from "@/lib/site";

const EMPTY_VALUES: CheckoutFormValues = {
  name: "",
  phone: "",
  district: "" as CheckoutFormValues["district"],
  area: "",
  address: "",
  postalCode: "",
  note: "",
  trxId: "",
  website: "",
};

export function CheckoutView() {
  const router = useRouter();
  const items = useCartItems();
  const { quote, loading, failed, retry } = useCartQuote(items);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const [redirecting, setRedirecting] = useState(false);

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
    return <p role="status" className="py-16 text-center text-lg">অর্ডার সম্পন্ন হয়েছে! আপনার অর্ডার খোলা হচ্ছে…</p>;
  }
  if (items === null || (items.length > 0 && !quote && !failed)) {
    return <p role="status" className="py-16 text-center text-muted-foreground">আপনার কার্ট লোড হচ্ছে…</p>;
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-4 py-16 text-center">
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
        <p>আপনার কার্ট লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
        <Button type="button" variant="outline" onClick={retry}>
          আবার চেষ্টা করুন
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
        saveDetails(details);
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
          <legend className="px-1 font-heading text-xl font-semibold">আপনার তথ্য</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="name" label="পুরো নাম" error={error("name")}>
              <Input {...field("name")} autoComplete="name" {...register("name")} />
            </FormField>
            <FormField id="phone" label="মোবাইল নম্বর" hint="অর্ডার নিশ্চিত করতে আমরা এই নম্বরে কল করব।" error={error("phone")}>
              <Input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...register("phone")} />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-5 rounded-2xl border bg-card p-5">
          <legend className="px-1 font-heading text-xl font-semibold">ডেলিভারির ঠিকানা</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="district" label="জেলা" error={error("district")}>
              <NativeSelect {...field("district")} className="w-full" autoComplete="address-level1" {...register("district")}>
                <NativeSelectOption value="">আপনার জেলা নির্বাচন করুন…</NativeSelectOption>
                {DISTRICTS.map((name) => (
                  <NativeSelectOption key={name} value={name}>
                    {name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="area" label="এলাকা / থানা" error={error("area")}>
              <Input {...field("area")} autoComplete="address-level2" placeholder="যেমন: মিরপুর" {...register("area")} />
            </FormField>
            <FormField id="address" label="পূর্ণ ঠিকানা" hint="বাড়ি, রোড, গ্রাম বা কুরিয়ার খুঁজে পাবে এমন কোনো ল্যান্ডমার্ক।" error={error("address")} className="sm:col-span-2">
              <Textarea {...field("address")} rows={3} autoComplete="street-address" {...register("address")} />
            </FormField>
            <FormField id="postalCode" label="পোস্টাল কোড (ঐচ্ছিক)" error={error("postalCode")}>
              <Input {...field("postalCode")} inputMode="numeric" autoComplete="postal-code" maxLength={4} {...register("postalCode")} />
            </FormField>
            <FormField id="note" label="আমাদের জন্য নোট (ঐচ্ছিক)" hint="যেমন: কল করার সবচেয়ে ভালো সময়" error={error("note")} className="sm:col-span-2">
              <Textarea {...field("note")} rows={2} {...register("note")} />
            </FormField>
          </div>
          {/* Honeypot: hidden from people and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
          <legend className="px-1 font-heading text-xl font-semibold">পেমেন্ট</legend>
          <div className="flex flex-col gap-3 rounded-lg bg-secondary p-4 text-sm">
            <p>
              অর্ডার করার আগে ডেলিভারি চার্জ{" "}
              <strong>{deliveryCharge === null ? "(জেলা নির্বাচন করুন)" : formatTaka(deliveryCharge)}</strong>{" "}
              অগ্রিম পাঠান। {site.deliveryPayment.wallets} থেকে নিচের নম্বরে <strong>সেন্ড মানি</strong> করুন:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-heading text-2xl font-semibold tracking-wide tabular-nums">
                {site.deliveryPayment.number}
              </span>
              <CopyButton value={site.deliveryPayment.number} label="নম্বর কপি করুন" />
            </div>
            <p className="text-muted-foreground">
              শাড়ির বাকি দাম{total !== null && deliveryCharge !== null && ` (${formatTaka(total - deliveryCharge)})`} অর্ডার
              হাতে পেয়ে কুরিয়ারকে ক্যাশে দেবেন।
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="trxId"
              label="ট্রানজেকশন আইডি"
              hint="টাকা পাঠানোর পর SMS বা অ্যাপে পাওয়া TrxID লিখুন।"
              error={error("trxId")}
            >
              <Input
                {...field("trxId")}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="যেমন: 9ABC1DEF2G"
                {...register("trxId")}
              />
            </FormField>
            {/* Screenshot upload: the transaction ID will be read from the image. Not built yet. */}
            <FormField id="trxScreenshot" label="অথবা স্ক্রিনশট আপলোড করুন" hint="শীঘ্রই আসছে। আপাতত ট্রানজেকশন আইডি লিখুন।">
              <Input id="trxScreenshot" type="file" accept="image/*" disabled aria-describedby="trxScreenshot-message" />
            </FormField>
          </div>
          <p className="text-xs text-muted-foreground">
            আমরা পেমেন্ট মিলিয়ে দেখে ও আপনাকে কল করে অর্ডার নিশ্চিত করব।
          </p>
        </fieldset>
      </div>

      <aside aria-label="অর্ডার সারাংশ" className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">আপনার অর্ডার</h2>
          <Link href="/cart" className="text-sm text-primary underline-offset-4 hover:underline">
            কার্ট পরিবর্তন করুন
          </Link>
        </div>

        {quote.hasUnavailable && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            কিছু শাড়ি আর পাওয়া যাচ্ছে না।{" "}
            <Link href="/cart" className="font-medium underline">
              কার্ট আপডেট করুন
            </Link>{" "}
            চালিয়ে যেতে।
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
                {!line.available && <p className="text-destructive">পাওয়া যাচ্ছে না</p>}
              </div>
              <p className="text-sm font-medium tabular-nums">{formatTaka(line.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt>সাবটোটাল</dt>
            <dd className="tabular-nums">{formatTaka(quote.subtotal)}</dd>
          </div>
          {quote.discount && (
            <div className="flex justify-between gap-4 text-primary">
              <dt>{quote.discount.name}</dt>
              <dd className="tabular-nums">−{formatTaka(quote.discount.amount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt>ডেলিভারি{district ? ` (${district})` : ""}</dt>
            <dd className="tabular-nums">
              {deliveryCharge === null ? <span className="text-muted-foreground">জেলা নির্বাচন করুন</span> : formatTaka(deliveryCharge)}
            </dd>
          </div>
          <div className="mt-1 flex justify-between gap-4 border-t pt-3 text-base font-semibold">
            <dt>সর্বমোট</dt>
            <dd className="tabular-nums">{total === null ? "—" : formatTaka(total)}</dd>
          </div>
          {total !== null && deliveryCharge !== null && (
            <>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <dt>এখন অগ্রিম (ডেলিভারি চার্জ)</dt>
                <dd className="tabular-nums">{formatTaka(deliveryCharge)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <dt>ডেলিভারিতে ক্যাশে</dt>
                <dd className="tabular-nums">{formatTaka(total - deliveryCharge)}</dd>
              </div>
            </>
          )}
        </dl>

        {quoteIsCurrent && quote.nextDiscount && (
          <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
            আপনার{" "}
            <Link href="/cart" className="underline underline-offset-4">
              কার্টে
            </Link>{" "}
            আরও {formatTaka(quote.nextDiscount.remaining)} যোগ করে পান{" "}
            <strong>{formatTaka(quote.nextDiscount.amount)} ছাড়</strong>।
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || !canOrder}>
          {pending ? "অর্ডার করা হচ্ছে…" : total === null ? "অর্ডার করুন" : `অর্ডার করুন · ${formatTaka(total)}`}
        </Button>
        <p className="text-xs text-muted-foreground">
          অর্ডার করার মাধ্যমে আপনি আপনার মোবাইল নম্বরে একটি নিশ্চিতকরণ কল পেতে সম্মত হচ্ছেন।
        </p>
      </aside>
    </form>
  );
}
