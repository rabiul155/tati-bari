"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "@/features/admin/products/actions";
import { productSchema, type ProductFormValues } from "@/features/admin/products/schema";
import { useServerFieldErrors } from "@/features/admin/use-server-field-errors";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };

export function ProductForm({
  productId,
  categories,
  defaultValues,
}: {
  productId: string | null;
  categories: Category[];
  defaultValues: ProductFormValues;
}) {
  const form = useForm<ProductFormValues, unknown, unknown>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });
  const { register, formState, setValue, getFieldState, reset } = form;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const [savedAt, setSavedAt] = useState<string>();
  const applyServerErrors = useServerFieldErrors(form);

  const error = (name: keyof ProductFormValues) => formState.errors[name]?.message;
  const field = (name: keyof ProductFormValues) => ({
    id: name,
    "aria-invalid": !!error(name),
    "aria-describedby": `${name}-message`,
  });

  const onSubmit = form.handleSubmit(() => {
    setFormError(undefined);
    setSavedAt(undefined);
    const values = form.getValues();
    startTransition(async () => {
      const result = await saveProduct(productId, values);
      if (result.ok) {
        reset(values);
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setFormError(result.error ?? "অনুগ্রহ করে চিহ্নিত ঘরগুলো ঠিক করুন।");
        applyServerErrors(result.fieldErrors);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <FormError message={formError} />

      <Section title="প্রাথমিক তথ্য">
        <FormField id="name" label="নাম" error={error("name")} className="sm:col-span-2">
          <Input
            {...field("name")}
            {...register("name", {
              onChange: (event) => {
                // Keep the slug in sync until it is edited by hand.
                if (!productId && !getFieldState("slug").isDirty) {
                  setValue("slug", slugify(event.target.value));
                }
              },
            })}
          />
        </FormField>
        <FormField
          id="code"
          label="পণ্য কোড"
          hint="গ্রাহকদের দেখানো হয়, যেমন: HS-003।"
          error={error("code")}
        >
          <Input {...field("code")} className="uppercase" {...register("code")} />
        </FormField>
        <FormField id="categoryId" label="ক্যাটাগরি" error={error("categoryId")}>
          <NativeSelect {...field("categoryId")} className="w-full" {...register("categoryId")}>
            <NativeSelectOption value="">নির্বাচন করুন…</NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField
          id="slug"
          label="URL slug"
          hint="পণ্যের লিংকে ব্যবহার হয়। এটি পরিবর্তন করলে Facebook-এ আগে শেয়ার করা লিংক কাজ করবে না।"
          error={error("slug")}
          className="sm:col-span-2"
        >
          <Input {...field("slug")} {...register("slug")} />
        </FormField>
        <FormField
          id="description"
          label="বিবরণ"
          error={error("description")}
          className="sm:col-span-2"
        >
          <Textarea {...field("description")} rows={5} {...register("description")} />
        </FormField>
      </Section>

      <Section title="শাড়ির বিবরণ">
        <FormField id="fabric" label="ফেব্রিক" hint="যেমন: সুতি, হাফ সিল্ক" error={error("fabric")}>
          <Input {...field("fabric")} {...register("fabric")} />
        </FormField>
        <FormField id="color" label="রঙ" hint="যেমন: লাল, অফ-হোয়াইট" error={error("color")}>
          <Input {...field("color")} {...register("color")} />
        </FormField>
        <FormField id="length" label="দৈর্ঘ্য" hint="যেমন: ১২ হাত (৫.৫ মিটার)" error={error("length")}>
          <Input {...field("length")} {...register("length")} />
        </FormField>
        <CheckboxField id="hasBlousePiece" label="ব্লাউজ পিস আছে">
          <input type="checkbox" id="hasBlousePiece" className="size-4 accent-primary" {...register("hasBlousePiece")} />
        </CheckboxField>
        <FormField
          id="careInstructions"
          label="যত্নের নির্দেশনা"
          error={error("careInstructions")}
          className="sm:col-span-2"
        >
          <Textarea {...field("careInstructions")} rows={2} {...register("careInstructions")} />
        </FormField>
      </Section>

      <Section
        title="দাম"
        description="কমা ছাড়া পূর্ণ টাকায় দিন। ছাড়ের তারিখ বাংলাদেশ সময়ে এবং ঐচ্ছিক: খালি রাখলে বিশেষ দাম মুছে না ফেলা পর্যন্ত ছাড় চলবে।"
      >
        <FormField id="regularPrice" label="নিয়মিত দাম (৳)" error={error("regularPrice")}>
          <Input {...field("regularPrice")} type="number" min={1} inputMode="numeric" {...register("regularPrice")} />
        </FormField>
        <FormField id="salePrice" label="বিশেষ দাম (৳, ঐচ্ছিক)" error={error("salePrice")}>
          <Input {...field("salePrice")} type="number" min={1} inputMode="numeric" {...register("salePrice")} />
        </FormField>
        <FormField id="saleStartsAt" label="ছাড় শুরু" error={error("saleStartsAt")}>
          <Input {...field("saleStartsAt")} type="datetime-local" {...register("saleStartsAt")} />
        </FormField>
        <FormField id="saleEndsAt" label="ছাড় শেষ" error={error("saleEndsAt")}>
          <Input {...field("saleEndsAt")} type="datetime-local" {...register("saleEndsAt")} />
        </FormField>
      </Section>

      <Section title="প্রাপ্যতা">
        <FormField id="availability" label="প্রাপ্যতা" error={error("availability")}>
          <NativeSelect {...field("availability")} className="w-full" {...register("availability")}>
            <NativeSelectOption value="AVAILABLE">পাওয়া যাচ্ছে</NativeSelectOption>
            <NativeSelectOption value="UNAVAILABLE">পাওয়া যাচ্ছে না (স্টকে নেই)</NativeSelectOption>
          </NativeSelect>
        </FormField>
        <FormField
          id="stockQuantity"
          label="স্টকের পরিমাণ (ঐচ্ছিক)"
          hint="চাহিদা অনুযায়ী শাড়ি সংগ্রহ করলে খালি রাখুন।"
          error={error("stockQuantity")}
        >
          <Input {...field("stockQuantity")} type="number" min={0} inputMode="numeric" {...register("stockQuantity")} />
        </FormField>
        <CheckboxField id="isFeatured" label="হোম পেজে বিশেষভাবে দেখান">
          <input type="checkbox" id="isFeatured" className="size-4 accent-primary" {...register("isFeatured")} />
        </CheckboxField>
      </Section>

      <div className="sticky bottom-(--bottom-nav-h) -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : productId ? "পরিবর্তন সংরক্ষণ করুন" : "পণ্য তৈরি করুন"}
        </Button>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          {productId ? "পণ্যের তালিকায় ফিরুন" : "বাতিল"}
        </Link>
        <span role="status" className="text-sm text-muted-foreground">
          {savedAt && !formState.isDirty
            ? `${savedAt}-এ সংরক্ষিত হয়েছে।`
            : formState.isDirty && productId
              ? "আপনার অসংরক্ষিত পরিবর্তন আছে।"
              : ""}
        </span>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function CheckboxField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 self-end py-2 text-sm font-medium">
      {children}
      {label}
    </label>
  );
}
