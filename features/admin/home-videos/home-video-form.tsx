"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveHomeVideo } from "@/features/admin/home-videos/actions";
import { homeVideoSchema, type HomeVideoFormValues } from "@/features/admin/home-videos/schema";
import { useServerFieldErrors } from "@/features/admin/use-server-field-errors";
import { youTubeVideoId } from "@/features/home-videos/slots";
import type { HomeVideoSlot } from "@/lib/generated/prisma/enums";

export function HomeVideoForm({
  slot,
  defaultValues,
}: {
  slot: HomeVideoSlot;
  defaultValues: HomeVideoFormValues;
}) {
  const form = useForm<HomeVideoFormValues, unknown, unknown>({
    resolver: zodResolver(homeVideoSchema),
    defaultValues,
  });
  const { register, formState, control } = form;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const applyServerErrors = useServerFieldErrors(form);
  const error = (name: keyof HomeVideoFormValues) => formState.errors[name]?.message;
  const id = (name: string) => `${slot}-${name}`;
  const previewId = youTubeVideoId(useWatch({ control, name: "url" }) ?? "");

  const onSubmit = form.handleSubmit(() => {
    setFormError(undefined);
    setSaved(false);
    startTransition(async () => {
      const values = form.getValues();
      const result = await saveHomeVideo(slot, values);
      if (result.ok) {
        form.reset(values);
        setSaved(true);
      } else {
        setFormError(result.error);
        applyServerErrors(result.fieldErrors);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormError message={formError} />
      <FormField
        id={id("url")}
        label="ইউটিউব লিংক"
        hint="ইউটিউবের শেয়ার বাটন থেকে কপি করা লিংক দিন।"
        error={error("url")}
      >
        <Input
          id={id("url")}
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=…"
          aria-invalid={!!error("url")}
          aria-describedby={`${id("url")}-message`}
          {...register("url")}
        />
      </FormField>
      <FormField id={id("title")} label="শিরোনাম (ঐচ্ছিক)" hint="ভিডিওর উপরে দেখানো হবে।" error={error("title")}>
        <Input
          id={id("title")}
          aria-invalid={!!error("title")}
          aria-describedby={`${id("title")}-message`}
          {...register("title")}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-primary" {...register("isVisible")} />
        হোম পেজে দেখান
      </label>
      {previewId && (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg bg-muted">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${previewId}?rel=0`}
            title="ভিডিও প্রিভিউ"
            loading="lazy"
            allow="encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
        </Button>
        {saved && !formState.isDirty && (
          <span role="status" className="text-sm text-muted-foreground">
            সংরক্ষিত হয়েছে।
          </span>
        )}
      </div>
    </form>
  );
}
