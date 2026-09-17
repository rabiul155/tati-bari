import type { Product } from "@/lib/generated/prisma/client";
import { toDhakaDateTimeInput } from "@/lib/format";
import type { ProductFormValues } from "@/features/admin/products/schema";

export const emptyProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  code: "",
  categoryId: "",
  description: "",
  fabric: "",
  color: "",
  length: "",
  hasBlousePiece: false,
  careInstructions: "",
  regularPrice: "",
  salePrice: "",
  saleStartsAt: "",
  saleEndsAt: "",
  availability: "AVAILABLE",
  stockQuantity: "",
  isFeatured: false,
};

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    code: product.code,
    categoryId: product.categoryId,
    description: product.description ?? "",
    fabric: product.fabric ?? "",
    color: product.color ?? "",
    length: product.length ?? "",
    hasBlousePiece: product.hasBlousePiece,
    careInstructions: product.careInstructions ?? "",
    regularPrice: String(product.regularPrice),
    salePrice: product.salePrice === null ? "" : String(product.salePrice),
    saleStartsAt: toDhakaDateTimeInput(product.saleStartsAt),
    saleEndsAt: toDhakaDateTimeInput(product.saleEndsAt),
    availability: product.availability,
    stockQuantity: product.stockQuantity === null ? "" : String(product.stockQuantity),
    isFeatured: product.isFeatured,
  };
}
