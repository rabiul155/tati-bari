import type { OrderStatus } from "@/lib/generated/prisma/enums";

export const ORDER_STATUS: Record<OrderStatus, { label: string; customerText: string }> = {
  PENDING: {
    label: "Pending",
    customerText: "We have received your order and will contact you to confirm it.",
  },
  CONFIRMED: {
    label: "Confirmed",
    customerText: "Your order is confirmed and we are getting your saree ready.",
  },
  PREPARING: {
    label: "Preparing",
    customerText: "Your saree is being checked and packed.",
  },
  SHIPPED: {
    label: "Shipped",
    customerText: "Your order is on its way. Keep the cash ready for the courier.",
  },
  DELIVERED: {
    label: "Delivered",
    customerText: "Your order has been delivered. Thank you for shopping with us!",
  },
  CANCELLED: {
    label: "Cancelled",
    customerText: "This order was cancelled. Contact us if you have any questions.",
  },
  RETURNED: {
    label: "Returned",
    customerText: "This order was returned. Contact us if you have any questions.",
  },
};

// The normal path of an order, used to draw progress for customers.
export const ORDER_PROGRESS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];
