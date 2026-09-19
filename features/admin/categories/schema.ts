import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";

// Form values are strings; the schema converts them to database values.
export const categorySchema = z.object({
  name: z.string().trim().min(1, "একটি নাম দিন।").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "একটি URL slug দিন।")
    .max(80)
    .regex(SLUG_PATTERN, "শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।"),
  description: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "একটি পূর্ণসংখ্যা দিন।")
    .transform((value) => Number(value || 0)),
});

export type CategoryFormValues = z.input<typeof categorySchema>;
