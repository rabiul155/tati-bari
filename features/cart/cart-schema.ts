import { z } from "zod";

export const MAX_QUANTITY_PER_ITEM = 10;
export const MAX_CART_LINES = 30;

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
});

export const cartItemsSchema = z.array(cartItemSchema).max(MAX_CART_LINES);

export type CartItem = z.infer<typeof cartItemSchema>;

// A cart line priced by the server. Amounts are whole taka.
export type QuotedLine = {
  productId: string;
  slug: string;
  name: string;
  code: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  unitDiscount: number;
  finalUnitPrice: number;
  lineTotal: number;
  // False when the product is out of stock or archived; such lines are
  // not counted in the subtotal and block checkout.
  available: boolean;
};

export type CartQuote = {
  lines: QuotedLine[];
  // Product ids that no longer exist; the client drops them from the cart.
  removedProductIds: string[];
  itemCount: number;
  subtotal: number;
  savings: number;
  hasUnavailable: boolean;
};
