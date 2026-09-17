import { z } from "zod";
import { fromDhakaDateTimeInput } from "@/lib/format";
import { SLUG_PATTERN } from "@/lib/slug";

const MAX_PRICE = 10_000_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use at most ${max} characters.`)
    .transform((value) => value || null);

const wholeNumber = z.string().trim().regex(/^\d*$/, "Enter a whole number, without commas.");

const optionalTaka = wholeNumber
  .transform((value) => (value === "" ? null : Number(value)))
  .refine((value) => value === null || value <= MAX_PRICE, "That price is too high.");

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => value === "" || fromDhakaDateTimeInput(value) !== null, "Enter a valid date and time.")
  .transform((value) => fromDhakaDateTimeInput(value));

// Form values are strings (and booleans for checkboxes); the schema
// converts them to database values. Used on the client and the server.
export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name.").max(150),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Enter a URL slug.")
      .max(80)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens."),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Enter a product code.")
      .max(30)
      .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "Use letters, numbers and hyphens, e.g. HS-003."),
    categoryId: z.string().min(1, "Choose a category."),
    description: optionalText(5000),

    fabric: optionalText(100),
    color: optionalText(100),
    length: optionalText(100),
    hasBlousePiece: z.boolean(),
    careInstructions: optionalText(500),

    regularPrice: wholeNumber
      .min(1, "Enter the regular price.")
      .transform(Number)
      .refine((value) => value > 0, "The price must be more than 0.")
      .refine((value) => value <= MAX_PRICE, "That price is too high."),
    salePrice: optionalTaka,
    saleStartsAt: optionalDateTime,
    saleEndsAt: optionalDateTime,

    availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    stockQuantity: wholeNumber
      .transform((value) => (value === "" ? null : Number(value)))
      .refine((value) => value === null || value <= 100_000, "That number is too high."),
    isFeatured: z.boolean(),
  })
  .superRefine((product, ctx) => {
    if (product.salePrice !== null && product.salePrice >= product.regularPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "The sale price must be lower than the regular price.",
      });
    }
    if (product.salePrice === null && (product.saleStartsAt || product.saleEndsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "Enter a sale price, or clear the sale dates.",
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
        message: "The sale must end after it starts.",
      });
    }
  });

export type ProductFormValues = z.input<typeof productSchema>;
