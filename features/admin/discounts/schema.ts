import { z } from "zod";
import { fromDhakaDateTimeInput } from "@/lib/format";

const taka = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,7}$/, `${label} কমা ছাড়া পূর্ণ টাকায় দিন।`)
    .transform(Number);

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => value === "" || fromDhakaDateTimeInput(value) !== null, "সঠিক তারিখ ও সময় দিন।")
  .transform((value) => fromDhakaDateTimeInput(value));

// Form values are strings (booleans for checkboxes); shared by the admin
// form and the server action.
export const discountSchema = z
  .object({
    name: z.string().trim().min(1, "গ্রাহকরা দেখতে পাবেন এমন একটি নাম দিন।").max(80),
    description: z
      .string()
      .trim()
      .max(300)
      .transform((value) => value || null),
    amount: taka("ছাড়ের পরিমাণ").refine((value) => value > 0, "ছাড় ০-এর বেশি হতে হবে।"),
    minOrderValue: taka("সর্বনিম্ন অর্ডার মূল্য"),
    startsAt: optionalDateTime,
    endsAt: optionalDateTime,
    isActive: z.boolean(),
  })
  .superRefine((discount, ctx) => {
    // Keeps the order total above the discount, so no order becomes free.
    // (Skipped when either amount already failed validation.)
    if (
      typeof discount.amount === "number" &&
      typeof discount.minOrderValue === "number" &&
      discount.minOrderValue <= discount.amount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minOrderValue"],
        message: "সর্বনিম্ন অর্ডার মূল্য ছাড়ের চেয়ে বেশি হতে হবে।",
      });
    }
    if (discount.startsAt && discount.endsAt && discount.startsAt >= discount.endsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "শেষের সময় শুরুর সময়ের পরে হতে হবে।" });
    }
  });

export type DiscountFormValues = z.input<typeof discountSchema>;

export type DiscountState = "active" | "scheduled" | "expired" | "off";

export function getDiscountState(
  discount: { isActive: boolean; startsAt: Date | null; endsAt: Date | null },
  now: Date = new Date(),
): DiscountState {
  if (!discount.isActive) return "off";
  if (discount.endsAt && discount.endsAt <= now) return "expired";
  if (discount.startsAt && discount.startsAt > now) return "scheduled";
  return "active";
}
