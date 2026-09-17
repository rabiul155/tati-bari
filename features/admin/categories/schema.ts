import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";

// Form values are strings; the schema converts them to database values.
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter a URL slug.")
    .max(80)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens."),
  description: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Enter a whole number.")
    .transform((value) => Number(value || 0)),
});

export type CategoryFormValues = z.input<typeof categorySchema>;
