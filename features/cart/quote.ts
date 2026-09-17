// Prices a cart from the database. The browser only ever sends product ids
// and quantities; every price comes from here. Checkout uses the same
// function when it creates the order.
import "server-only";
import { db } from "@/lib/db";
import { getUnitPrice } from "@/features/catalog/pricing";
import {
  MAX_QUANTITY_PER_ITEM,
  type CartItem,
  type CartQuote,
  type QuotedLine,
} from "@/features/cart/cart-schema";

export async function quoteCart(items: CartItem[], now: Date = new Date()): Promise<CartQuote> {
  // Merge duplicate lines (e.g. from a hand-edited localStorage value).
  const quantities = new Map<string, number>();
  for (const { productId, quantity } of items) {
    quantities.set(
      productId,
      Math.min(MAX_QUANTITY_PER_ITEM, (quantities.get(productId) ?? 0) + quantity),
    );
  }

  const products = await db.product.findMany({
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
      available: product.availability === "AVAILABLE" && product.archivedAt === null,
    });
  }

  const counted = lines.filter((line) => line.available);
  return {
    lines,
    removedProductIds,
    itemCount: counted.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: counted.reduce((sum, line) => sum + line.lineTotal, 0),
    savings: counted.reduce((sum, line) => sum + line.unitDiscount * line.quantity, 0),
    hasUnavailable: lines.some((line) => !line.available),
  };
}
