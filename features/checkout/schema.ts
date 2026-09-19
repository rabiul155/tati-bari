import { z } from "zod";
import { DISTRICTS } from "@/features/checkout/districts";
import { normalizeBdPhone } from "@/lib/phone";

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "আপনার মোবাইল নম্বর দিন।")
  .transform((value, ctx) => {
    const phone = normalizeBdPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন, যেমন 01712345678।" });
      return z.NEVER;
    }
    return phone;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `সর্বোচ্চ ${max} অক্ষর ব্যবহার করুন।`)
    .transform((value) => value || null);

// Customer details on the checkout form (shared by client and server).
export const checkoutDetailsSchema = z.object({
  name: z.string().trim().min(2, "আপনার পুরো নাম দিন।").max(80),
  phone: phoneSchema,
  district: z.enum(DISTRICTS, { error: "আপনার জেলা নির্বাচন করুন।" }),
  area: z.string().trim().min(2, "আপনার এলাকা বা থানার নাম দিন।").max(80),
  address: z
    .string()
    .trim()
    .min(8, "পূর্ণ ঠিকানা দিন: বাড়ি, রোড, গ্রাম বা ল্যান্ডমার্ক।")
    .max(300),
  postalCode: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, "পোস্টাল কোড ৪ সংখ্যার হয়।")
    .transform((value) => value || null),
  note: optionalText(500),
  // Honeypot: hidden from people, filled in by some bots.
  website: z.string().max(200).optional(),
});

export type CheckoutFormValues = z.input<typeof checkoutDetailsSchema>;

export const orderLookupSchema = z.object({
  phone: phoneSchema,
});

export type OrderLookupValues = z.input<typeof orderLookupSchema>;
