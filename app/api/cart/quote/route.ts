import { z } from "zod";
import { cartItemsSchema } from "@/features/cart/cart-schema";
import { quoteCart } from "@/features/cart/quote";

const bodySchema = z.object({ items: cartItemsSchema });

// POST { items: [{ productId, quantity }] } -> CartQuote with current prices.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid cart" }, { status: 400 });
  }

  const quote = await quoteCart(parsed.data.items);
  return Response.json(quote, { headers: { "Cache-Control": "no-store" } });
}
