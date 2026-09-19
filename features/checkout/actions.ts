"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { cartItemsSchema, type CartItem } from "@/features/cart/cart-schema";
import { quoteCart } from "@/features/cart/quote";
import { revalidateCatalog } from "@/features/catalog/revalidate";
import { getDeliveryCharge } from "@/features/checkout/delivery";
import {
  checkoutDetailsSchema,
  orderLookupSchema,
  type CheckoutFormValues,
  type OrderLookupValues,
} from "@/features/checkout/schema";
import { createAccessKey, orderUrl } from "@/features/orders/order-access";
import { formatOrderNumber, parseOrderNumber } from "@/features/orders/order-number";

export type PlaceOrderResult =
  | {
      ok: true;
      order: { number: string; url: string; total: number; placedAt: string; itemCount: number };
    }
  | {
      ok: false;
      // "cart": items changed (unavailable, removed, or prices changed) —
      // the client should refresh the cart and show the new totals.
      reason: "invalid" | "cart" | "rate-limited" | "error";
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

class CartChangedError extends Error {}

export async function placeOrder(input: {
  details: CheckoutFormValues;
  items: CartItem[];
  // The total the customer saw. If the server total differs, the order is
  // not placed and the customer is shown the new total first.
  expectedTotal: number;
}): Promise<PlaceOrderResult> {
  const parsed = z
    .object({
      details: checkoutDetailsSchema,
      items: cartItemsSchema.min(1),
      expectedTotal: z.number().int().nonnegative(),
    })
    .safeParse(input);
  if (!parsed.success) {
    const detailErrors = parsed.error.issues.filter((issue) => issue.path[0] === "details");
    if (detailErrors.length === 0) {
      return { ok: false, reason: "cart", message: "আপনার কার্ট পড়া যায়নি। অনুগ্রহ করে দেখে আবার চেষ্টা করুন।" };
    }
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of detailErrors) {
      const field = String(issue.path[1]);
      (fieldErrors[field] ??= []).push(issue.message);
    }
    return { ok: false, reason: "invalid", message: "অনুগ্রহ করে চিহ্নিত ঘরগুলো পরীক্ষা করুন।", fieldErrors };
  }
  const { details, items, expectedTotal } = parsed.data;

  // Only bots fill in the hidden honeypot field.
  if (details.website) {
    return { ok: false, reason: "error", message: "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" };
  }

  const ip = await getClientIp();
  const allowed =
    (await rateLimit(`checkout:ip:${ip}`, 10, 10 * 60)) &&
    (await rateLimit(`checkout:phone:${details.phone}`, 5, 60 * 60));
  if (!allowed) {
    return {
      ok: false,
      reason: "rate-limited",
      message: "অল্প সময়ে অনেক বেশি অর্ডার হয়েছে। কিছুক্ষণ অপেক্ষা করুন, অথবা অর্ডার করতে আমাদের সাথে যোগাযোগ করুন।",
    };
  }

  try {
    const order = await db.$transaction(async (tx) => {
      const now = new Date();
      const quote = await quoteCart(items, now, tx);
      if (quote.removedProductIds.length > 0 || quote.hasUnavailable || quote.lines.length === 0) {
        const short = quote.lines.find(
          (line) => !line.available && line.stockLeft !== null && line.stockLeft > 0 && line.stockLeft < line.quantity,
        );
        throw new CartChangedError(
          short
            ? `${short.name}-এর মাত্র ${short.stockLeft}টি বাকি আছে। অনুগ্রহ করে আপনার কার্ট আপডেট করুন।`
            : "আপনার কার্টের কিছু শাড়ি আর পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার কার্ট আপডেট করুন।",
        );
      }

      const discountAmount = quote.discount?.amount ?? 0;
      const deliveryCharge = getDeliveryCharge(details.district);
      const total = quote.subtotal - discountAmount + deliveryCharge;
      if (total !== expectedTotal) {
        throw new CartChangedError("এই পেজ খোলার পর দাম পরিবর্তন হয়েছে। অনুগ্রহ করে নতুন সর্বমোট দেখুন।");
      }

      // Reserve stock for products that track it.
      for (const line of quote.lines) {
        const { count } = await tx.product.updateMany({
          where: { id: line.productId, stockQuantity: { gte: line.quantity } },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (count === 0) {
          const product = await tx.product.findUnique({
            where: { id: line.productId },
            select: { stockQuantity: true },
          });
          if (product?.stockQuantity !== null) {
            throw new CartChangedError(`${line.name}-এর মাত্র ${product?.stockQuantity ?? 0}টি বাকি আছে।`);
          }
        }
      }
      await tx.product.updateMany({
        where: { id: { in: quote.lines.map((line) => line.productId) }, stockQuantity: 0 },
        data: { availability: "UNAVAILABLE" },
      });

      const customer = await tx.customer.upsert({
        where: { phone: details.phone },
        create: { phone: details.phone, name: details.name },
        update: { name: details.name },
      });
      const address = {
        address: details.address,
        district: details.district,
        area: details.area,
        postalCode: details.postalCode,
      };
      const existingAddress = await tx.customerAddress.findFirst({
        where: { customerId: customer.id, ...address },
        select: { id: true },
      });
      await tx.customerAddress.updateMany({
        where: { customerId: customer.id, isDefault: true },
        data: { isDefault: false },
      });
      if (existingAddress) {
        await tx.customerAddress.update({ where: { id: existingAddress.id }, data: { isDefault: true } });
      } else {
        await tx.customerAddress.create({ data: { customerId: customer.id, ...address, isDefault: true } });
      }

      return tx.order.create({
        data: {
          accessKey: createAccessKey(),
          customerId: customer.id,
          customerName: details.name,
          customerPhone: details.phone,
          deliveryAddress: details.address,
          deliveryDistrict: details.district,
          deliveryArea: details.area,
          deliveryPostalCode: details.postalCode,
          customerNote: details.note,
          subtotal: quote.subtotal,
          discountId: quote.discount?.id,
          discountName: quote.discount?.name,
          discountAmount,
          deliveryCharge,
          total,
          items: {
            create: quote.lines.map((line) => ({
              productId: line.productId,
              productName: line.name,
              productCode: line.code,
              productImageUrl: line.imageUrl,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              unitDiscount: line.unitDiscount,
              finalUnitPrice: line.finalUnitPrice,
              lineTotal: line.lineTotal,
            })),
          },
          statusHistory: { create: { toStatus: "PENDING", note: "ওয়েবসাইটে অর্ডার করা হয়েছে" } },
        },
        select: { number: true, accessKey: true, total: true, createdAt: true },
      });
    });

    // Stock changes can make products unavailable in the shop.
    revalidateCatalog();
    return {
      ok: true,
      order: {
        number: formatOrderNumber(order.number),
        url: orderUrl(order),
        total: order.total,
        placedAt: order.createdAt.toISOString(),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    };
  } catch (error) {
    if (error instanceof CartChangedError) {
      return { ok: false, reason: "cart", message: error.message };
    }
    console.error("placeOrder failed", error);
    return {
      ok: false,
      reason: "error",
      message: "আপনার অর্ডার করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন, অথবা অর্ডার করতে আমাদের সাথে যোগাযোগ করুন।",
    };
  }
}

export type LookupState =
  | { error?: string; fieldErrors?: Record<string, string[] | undefined>; values?: OrderLookupValues }
  | undefined;

// "Find my order": phone number + order number -> the order page.
export async function lookupOrder(_state: LookupState, formData: FormData): Promise<LookupState> {
  const values = {
    phone: String(formData.get("phone") ?? ""),
    orderNumber: String(formData.get("orderNumber") ?? ""),
  };
  const parsed = orderLookupSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  // Order numbers are sequential, so guessing is throttled per IP and per
  // phone number.
  const ip = await getClientIp();
  const allowed =
    (await rateLimit(`lookup:ip:${ip}`, 10, 15 * 60)) &&
    (await rateLimit(`lookup:phone:${parsed.data.phone}`, 10, 60 * 60));
  if (!allowed) {
    return { error: "অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে ১৫ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।", values };
  }

  const number = parseOrderNumber(parsed.data.orderNumber);
  const order =
    number === null
      ? null
      : await db.order.findFirst({
          where: { number, customerPhone: parsed.data.phone },
          select: { number: true, accessKey: true },
        });
  if (!order) {
    return {
      error: "এই ফোন নম্বর ও অর্ডার নম্বর দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি।",
      values,
    };
  }
  redirect(orderUrl(order));
}
