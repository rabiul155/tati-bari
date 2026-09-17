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
        setFormError(result.error ?? "Please fix the highlighted fields.");
        applyServerErrors(result.fieldErrors);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <FormError message={formError} />

      <Section title="Basic information">
        <FormField id="name" label="Name" error={error("name")} className="sm:col-span-2">
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
          label="Product code"
          hint="Shown to customers, e.g. HS-003."
          error={error("code")}
        >
          <Input {...field("code")} className="uppercase" {...register("code")} />
        </FormField>
        <FormField id="categoryId" label="Category" error={error("categoryId")}>
          <NativeSelect {...field("categoryId")} className="w-full" {...register("categoryId")}>
            <NativeSelectOption value="">Choose…</NativeSelectOption>
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
          hint="Used in the product link. Changing it breaks links already shared on Facebook."
          error={error("slug")}
          className="sm:col-span-2"
        >
          <Input {...field("slug")} {...register("slug")} />
        </FormField>
        <FormField
          id="description"
          label="Description"
          error={error("description")}
          className="sm:col-span-2"
        >
          <Textarea {...field("description")} rows={5} {...register("description")} />
        </FormField>
      </Section>

      <Section title="Saree details">
        <FormField id="fabric" label="Fabric" hint="e.g. Cotton, Half silk" error={error("fabric")}>
          <Input {...field("fabric")} {...register("fabric")} />
        </FormField>
        <FormField id="color" label="Colour" hint="e.g. Red, Off-white" error={error("color")}>
          <Input {...field("color")} {...register("color")} />
        </FormField>
        <FormField id="length" label="Length" hint="e.g. 12 haat (5.5 m)" error={error("length")}>
          <Input {...field("length")} {...register("length")} />
        </FormField>
        <CheckboxField id="hasBlousePiece" label="Includes a blouse piece">
          <input type="checkbox" id="hasBlousePiece" className="size-4 accent-primary" {...register("hasBlousePiece")} />
        </CheckboxField>
        <FormField
          id="careInstructions"
          label="Care instructions"
          error={error("careInstructions")}
          className="sm:col-span-2"
        >
          <Textarea {...field("careInstructions")} rows={2} {...register("careInstructions")} />
        </FormField>
      </Section>

      <Section
        title="Price"
        description="Whole taka, without commas. Sale dates are Bangladesh time and optional: leave them empty to run the sale until you remove the sale price."
      >
        <FormField id="regularPrice" label="Regular price (৳)" error={error("regularPrice")}>
          <Input {...field("regularPrice")} type="number" min={1} inputMode="numeric" {...register("regularPrice")} />
        </FormField>
        <FormField id="salePrice" label="Sale price (৳, optional)" error={error("salePrice")}>
          <Input {...field("salePrice")} type="number" min={1} inputMode="numeric" {...register("salePrice")} />
        </FormField>
        <FormField id="saleStartsAt" label="Sale starts" error={error("saleStartsAt")}>
          <Input {...field("saleStartsAt")} type="datetime-local" {...register("saleStartsAt")} />
        </FormField>
        <FormField id="saleEndsAt" label="Sale ends" error={error("saleEndsAt")}>
          <Input {...field("saleEndsAt")} type="datetime-local" {...register("saleEndsAt")} />
        </FormField>
      </Section>

      <Section title="Availability">
        <FormField id="availability" label="Availability" error={error("availability")}>
          <NativeSelect {...field("availability")} className="w-full" {...register("availability")}>
            <NativeSelectOption value="AVAILABLE">Available</NativeSelectOption>
            <NativeSelectOption value="UNAVAILABLE">Unavailable (out of stock)</NativeSelectOption>
          </NativeSelect>
        </FormField>
        <FormField
          id="stockQuantity"
          label="Stock quantity (optional)"
          hint="Leave empty if you source sarees on demand."
          error={error("stockQuantity")}
        >
          <Input {...field("stockQuantity")} type="number" min={0} inputMode="numeric" {...register("stockQuantity")} />
        </FormField>
        <CheckboxField id="isFeatured" label="Feature on the home page">
          <input type="checkbox" id="isFeatured" className="size-4 accent-primary" {...register("isFeatured")} />
        </CheckboxField>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </Button>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          {productId ? "Back to products" : "Cancel"}
        </Link>
        <span role="status" className="text-sm text-muted-foreground">
          {savedAt && !formState.isDirty
            ? `Saved at ${savedAt}.`
            : formState.isDirty && productId
              ? "You have unsaved changes."
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
