"use client";

import { useEffect } from "react";
import { saveOrder, type SavedOrder } from "@/features/orders/order-history";

// Adds the viewed order to this browser's order list, e.g. after a lookup
// or when the link is opened on another device.
export function RememberOrder({ order }: { order: SavedOrder }) {
  useEffect(() => {
    saveOrder(order);
  }, [order]);
  return null;
}
