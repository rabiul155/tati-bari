"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormField } from "@/components/admin/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCategory } from "@/features/admin/categories/actions";
import { categorySchema, type CategoryFormValues } from "@/features/admin/categories/schema";
import { useServerFieldErrors } from "@/features/admin/use-server-field-errors";
import { slugify } from "@/lib/slug";

export function CategoryForm({
  categoryId,
  defaultValues,
}: {
  categoryId: string | null;
  defaultValues: CategoryFormValues;
}) {
  const form = useForm<CategoryFormValues, unknown, unknown>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });
  const { register, formState, setValue, getFieldState } = form;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const applyServerErrors = useServerFieldErrors(form);
  const error = (name: keyof CategoryFormValues) => formState.errors[name]?.message;

  const onSubmit = form.handleSubmit(() => {
    setFormError(undefined);
    startTransition(async () => {
      const result = await saveCategory(categoryId, form.getValues());
      if (!result.ok) {
        setFormError(result.error);
        applyServerErrors(result.fieldErrors);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5" noValidate>
      <FormError message={formError} />
      <FormField id="name" label="Name" error={error("name")}>
        <Input
          id="name"
          aria-invalid={!!error("name")}
          {...register("name", {
            onChange: (event) => {
              // Keep the slug in sync until it is edited by hand.
              if (!categoryId && !getFieldState("slug").isDirty) {
                setValue("slug", slugify(event.target.value));
              }
            },
          })}
        />
      </FormField>
      <FormField
        id="slug"
        label="URL slug"
        hint="Used in the shop URL. Changing it breaks old links."
        error={error("slug")}
      >
        <Input id="slug" aria-invalid={!!error("slug")} {...register("slug")} />
      </FormField>
      <FormField id="description" label="Description (optional)" error={error("description")}>
        <Textarea id="description" rows={3} {...register("description")} />
      </FormField>
      <FormField
        id="sortOrder"
        label="Sort order"
        hint="Lower numbers are shown first."
        error={error("sortOrder")}
      >
        <Input
          id="sortOrder"
          type="number"
          min={0}
          inputMode="numeric"
          className="w-32"
          aria-invalid={!!error("sortOrder")}
          {...register("sortOrder")}
        />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save category"}
        </Button>
        <Link href="/admin/categories" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
