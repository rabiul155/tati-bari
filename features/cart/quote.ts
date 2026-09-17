// Prices a cart from the database. The browser only ever sends product ids
// and quantities; every price comes from here. Checkout uses the same
// function when it creates the order.
import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getUnitPrice } from "@/features/catalog/pricing";
import { findBestDiscount, type AppliedDiscount } from "@/features/discounts/best-discount";
import {
  MAX_QUANTITY_PER_ITEM,
  type CartItem,
  type CartQuote,
  type QuotedLine,
} from "@/features/cart/cart-schema";

export type ServerCartQuote = Omit<CartQuote, "nextDiscount"> & { discount: AppliedDiscount | null };

// Pass a transaction client to read prices inside a transaction.
export async function quoteCart(
  items: CartItem[],
  now: Date = new Date(),
  client: Prisma.TransactionClient = db,
): Promise<ServerCartQuote> {
  // Merge duplicate lines (e.g. from a hand-edited localStorage value).
  const quantities = new Map<string, number>();
  for (const { productId, quantity } of items) {
    quantities.set(
      productId,
      Math.min(MAX_QUANTITY_PER_ITEM, (quantities.get(productId) ?? 0) + quantity),
    );
  }

  const products = await client.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
    select: {
      id: true,
      slug: true,
      name: true,
      code: true,
      regularPrice: true,
      salePrice: true,
      saleStartsAt: true,
      saleEndsAt: true,
      availability: true,
      archivedAt: true,
      stockQuantity: true,
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: QuotedLine[] = [];
  const removedProductIds: string[] = [];
  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId);
    if (!product) {
      removedProductIds.push(productId);
      continue;
    }
    const price = getUnitPrice(product, now);
    lines.push({
      productId,
      slug: product.slug,
      name: product.name,
      code: product.code,
      imageUrl: product.images[0]?.url ?? null,
      quantity,
      ...price,
      lineTotal: price.finalUnitPrice * quantity,
      available:
        product.availability === "AVAILABLE" &&
        product.archivedAt === null &&
        (product.stockQuantity === null || product.stockQuantity >= quantity),
      stockLeft: product.stockQuantity,
    });
  }

  const counted = lines.filter((line) => line.available);
  const subtotal = counted.reduce((sum, line) => sum + line.lineTotal, 0);
  const discount = await findBestDiscount(subtotal, now, client);
  return {
    lines,
    removedProductIds,
    itemCount: counted.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    savings: counted.reduce((sum, line) => sum + line.unitDiscount * line.quantity, 0),
    hasUnavailable: lines.some((line) => !line.available),
    discount,
  };
}
