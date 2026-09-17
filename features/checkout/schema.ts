import { z } from "zod";
import { DISTRICTS } from "@/features/checkout/districts";
import { normalizeBdPhone } from "@/lib/phone";

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your mobile number.")
  .transform((value, ctx) => {
    const phone = normalizeBdPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Enter a valid Bangladesh mobile number, e.g. 01712345678." });
      return z.NEVER;
    }
    return phone;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use at most ${max} characters.`)
    .transform((value) => value || null);

// Customer details on the checkout form (shared by client and server).
export const checkoutDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  phone: phoneSchema,
  district: z.enum(DISTRICTS, { error: "Choose your district." }),
  area: z.string().trim().min(2, "Enter your area or thana.").max(80),
  address: z
    .string()
    .trim()
    .min(8, "Enter your full address: house, road, village or landmark.")
    .max(300),
  postalCode: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, "Postal codes have 4 digits.")
    .transform((value) => value || null),
  note: optionalText(500),
  // Honeypot: hidden from people, filled in by some bots.
  website: z.string().max(200).optional(),
});

export type CheckoutFormValues = z.input<typeof checkoutDetailsSchema>;

export const orderLookupSchema = z.object({
  phone: phoneSchema,
  orderNumber: z.string().trim().min(1, "Enter your order number.").max(20),
});

export type OrderLookupValues = z.input<typeof orderLookupSchema>;
