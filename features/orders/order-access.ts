// Customer access to an order: the order page URL carries the order's
// random access key, so only people with the link (or with the phone
// number, see lookupOrders) can see it.
import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { formatOrderNumber, parseOrderNumber } from "@/features/orders/order-number";

export function createAccessKey(): string {
  return randomBytes(18).toString("base64url");
}

export function orderUrl(order: { number: number; accessKey: string }): string {
  return `/orders/${formatOrderNumber(order.number)}?key=${order.accessKey}`;
}

function sameKey(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// The order for a customer-facing URL, or null if the number or key is wrong.
export async function getOrderForCustomer(orderNumber: string, key: string | undefined) {
  const number = parseOrderNumber(orderNumber);
  if (number === null || !key) return null;

  const order = await db.order.findUnique({
    where: { number },
    select: {
      number: true,
      accessKey: true,
      status: true,
      createdAt: true,
      customerName: true,
      customerPhone: true,
      deliveryAddress: true,
      deliveryArea: true,
      deliveryDistrict: true,
      deliveryPostalCode: true,
      customerNote: true,
      subtotal: true,
      discountName: true,
      discountAmount: true,
      deliveryCharge: true,
      total: true,
      courierName: true,
      trackingNumber: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          productCode: true,
          productImageUrl: true,
          quantity: true,
          unitPrice: true,
          unitDiscount: true,
          finalUnitPrice: true,
          lineTotal: true,
          product: { select: { slug: true, archivedAt: true } },
        },
      },
      // Status changes only; internal notes are not shown to customers.
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: { toStatus: true, createdAt: true },
      },
    },
  });
  if (!order || !sameKey(order.accessKey, key)) return null;
  return order;
}
