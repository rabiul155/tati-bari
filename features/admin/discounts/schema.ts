import { z } from "zod";
import { fromDhakaDateTimeInput } from "@/lib/format";

const taka = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,7}$/, `Enter the ${label} in whole taka, without commas.`)
    .transform(Number);

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => value === "" || fromDhakaDateTimeInput(value) !== null, "Enter a valid date and time.")
  .transform((value) => fromDhakaDateTimeInput(value));

// Form values are strings (booleans for checkboxes); shared by the admin
// form and the server action.
export const discountSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name customers will see.").max(80),
    description: z
      .string()
      .trim()
      .max(300)
      .transform((value) => value || null),
    amount: taka("discount").refine((value) => value > 0, "The discount must be more than 0."),
    minOrderValue: taka("minimum order value"),
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
        message: "The minimum order value must be higher than the discount.",
      });
    }
    if (discount.startsAt && discount.endsAt && discount.startsAt >= discount.endsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "The end must be after the start." });
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
