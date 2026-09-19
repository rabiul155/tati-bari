import { z } from "zod";
import { fromDhakaDateTimeInput } from "@/lib/format";
import { SLUG_PATTERN } from "@/lib/slug";

const MAX_PRICE = 10_000_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `সর্বোচ্চ ${max} অক্ষর ব্যবহার করুন।`)
    .transform((value) => value || null);

const wholeNumber = z.string().trim().regex(/^\d*$/, "কমা ছাড়া একটি পূর্ণসংখ্যা দিন।");

const optionalTaka = wholeNumber
  .transform((value) => (value === "" ? null : Number(value)))
  .refine((value) => value === null || value <= MAX_PRICE, "এই দামটি অনেক বেশি।");

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => value === "" || fromDhakaDateTimeInput(value) !== null, "সঠিক তারিখ ও সময় দিন।")
  .transform((value) => fromDhakaDateTimeInput(value));

// Form values are strings (and booleans for checkboxes); the schema
// converts them to database values. Used on the client and the server.
export const productSchema = z
  .object({
    name: z.string().trim().min(1, "একটি নাম দিন।").max(150),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "একটি URL slug দিন।")
      .max(80)
      .regex(SLUG_PATTERN, "শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "একটি পণ্য কোড দিন।")
      .max(30)
      .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "ইংরেজি অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন, যেমন: HS-003।"),
    categoryId: z.string().min(1, "একটি ক্যাটাগরি নির্বাচন করুন।"),
    description: optionalText(5000),

    fabric: optionalText(100),
    color: optionalText(100),
    length: optionalText(100),
    hasBlousePiece: z.boolean(),
    careInstructions: optionalText(500),

    regularPrice: wholeNumber
      .min(1, "নিয়মিত দাম দিন।")
      .transform(Number)
      .refine((value) => value > 0, "দাম ০-এর বেশি হতে হবে।")
      .refine((value) => value <= MAX_PRICE, "এই দামটি অনেক বেশি।"),
    salePrice: optionalTaka,
    saleStartsAt: optionalDateTime,
    saleEndsAt: optionalDateTime,

    availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    stockQuantity: wholeNumber
      .transform((value) => (value === "" ? null : Number(value)))
      .refine((value) => value === null || value <= 100_000, "এই সংখ্যাটি অনেক বেশি।"),
    isFeatured: z.boolean(),
  })
  .superRefine((product, ctx) => {
    if (product.salePrice !== null && product.salePrice >= product.regularPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "বিশেষ দাম নিয়মিত দামের চেয়ে কম হতে হবে।",
      });
    }
    if (product.salePrice === null && (product.saleStartsAt || product.saleEndsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "একটি বিশেষ দাম দিন, অথবা ছাড়ের তারিখ মুছে দিন।",
      });
    }
    if (
      product.saleStartsAt &&
      product.saleEndsAt &&
      product.saleStartsAt >= product.saleEndsAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["saleEndsAt"],
        message: "ছাড় শুরুর পরে শেষ হতে হবে।",
      });
    }
  });

export type ProductFormValues = z.input<typeof productSchema>;
