"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveDiscount } from "@/features/admin/discounts/actions";
import { discountSchema, type DiscountFormValues } from "@/features/admin/discounts/schema";
import { useServerFieldErrors } from "@/features/admin/use-server-field-errors";

export function DiscountForm({
  discountId,
  defaultValues,
}: {
  discountId: string | null;
  defaultValues: DiscountFormValues;
}) {
  const form = useForm<DiscountFormValues, unknown, unknown>({
    resolver: zodResolver(discountSchema),
    defaultValues,
  });
  const { register, formState } = form;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const applyServerErrors = useServerFieldErrors(form);
  const error = (name: keyof DiscountFormValues) => formState.errors[name]?.message;
  const field = (name: keyof DiscountFormValues) => ({
    id: name,
    "aria-invalid": !!error(name),
    "aria-describedby": `${name}-message`,
  });

  const onSubmit = form.handleSubmit(() => {
    setFormError(undefined);
    startTransition(async () => {
      const result = await saveDiscount(discountId, form.getValues());
      if (!result.ok) {
        setFormError(result.error);
        applyServerErrors(result.fieldErrors);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-5">
      <FormError message={formError} />
      <FormField
        id="name"
        label="নাম"
        hint="কার্টে ও গ্রাহকের অর্ডারে দেখানো হবে, যেমন: “৳৫,০০০-এর বেশি অর্ডারে ৳২০০ ছাড়”।"
        error={error("name")}
      >
        <Input {...field("name")} {...register("name")} />
      </FormField>
      <FormField id="description" label="অভ্যন্তরীণ বিবরণ (ঐচ্ছিক)" error={error("description")}>
        <Textarea {...field("description")} rows={2} {...register("description")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="amount" label="ছাড় (৳)" error={error("amount")}>
          <Input {...field("amount")} type="number" min={1} inputMode="numeric" {...register("amount")} />
        </FormField>
        <FormField
          id="minOrderValue"
          label="সর্বনিম্ন অর্ডার মূল্য (৳)"
          hint="বিশেষ দাম প্রয়োগের পর, ডেলিভারি চার্জের আগের সাবটোটাল।"
          error={error("minOrderValue")}
        >
          <Input {...field("minOrderValue")} type="number" min={1} inputMode="numeric" {...register("minOrderValue")} />
        </FormField>
        <FormField id="startsAt" label="শুরু (ঐচ্ছিক)" hint="বাংলাদেশ সময়। খালি রাখলে এখনই শুরু।" error={error("startsAt")}>
          <Input {...field("startsAt")} type="datetime-local" {...register("startsAt")} />
        </FormField>
        <FormField id="endsAt" label="শেষ (ঐচ্ছিক)" hint="খালি রাখলে আপনি বন্ধ না করা পর্যন্ত চলবে।" error={error("endsAt")}>
          <Input {...field("endsAt")} type="datetime-local" {...register("endsAt")} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-primary" {...register("isActive")} />
        চালু আছে
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : "ছাড় সংরক্ষণ করুন"}
        </Button>
        <Link href="/admin/discounts" className={buttonVariants({ variant: "outline" })}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
