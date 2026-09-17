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
        label="Name"
        hint="Shown to customers in the cart and on their order, e.g. “৳200 off orders over ৳5,000”."
        error={error("name")}
      >
        <Input {...field("name")} {...register("name")} />
      </FormField>
      <FormField id="description" label="Internal description (optional)" error={error("description")}>
        <Textarea {...field("description")} rows={2} {...register("description")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="amount" label="Discount (৳)" error={error("amount")}>
          <Input {...field("amount")} type="number" min={1} inputMode="numeric" {...register("amount")} />
        </FormField>
        <FormField
          id="minOrderValue"
          label="Minimum order value (৳)"
          hint="Subtotal after sale prices, before delivery."
          error={error("minOrderValue")}
        >
          <Input {...field("minOrderValue")} type="number" min={1} inputMode="numeric" {...register("minOrderValue")} />
        </FormField>
        <FormField id="startsAt" label="Starts (optional)" hint="Bangladesh time. Empty = now." error={error("startsAt")}>
          <Input {...field("startsAt")} type="datetime-local" {...register("startsAt")} />
        </FormField>
        <FormField id="endsAt" label="Ends (optional)" hint="Empty = until you turn it off." error={error("endsAt")}>
          <Input {...field("endsAt")} type="datetime-local" {...register("endsAt")} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-primary" {...register("isActive")} />
        Turned on
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save discount"}
        </Button>
        <Link href="/admin/discounts" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
