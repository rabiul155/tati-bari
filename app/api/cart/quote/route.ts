import { z } from "zod";
import { cartItemsSchema, type CartQuote } from "@/features/cart/cart-schema";
import { quoteCart } from "@/features/cart/quote";
import { findNextDiscount } from "@/features/discounts/best-discount";

const bodySchema = z.object({ items: cartItemsSchema });

// POST { items: [{ productId, quantity }] } -> CartQuote with current prices.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid cart" }, { status: 400 });
  }

  const now = new Date();
  const quote = await quoteCart(parsed.data.items, now);
  const result: CartQuote = {
    ...quote,
    nextDiscount: await findNextDiscount(quote.subtotal, quote.discount?.amount ?? 0, now),
    // Internal ids stay on the server.
    discount: quote.discount && { name: quote.discount.name, amount: quote.discount.amount },
  };
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
