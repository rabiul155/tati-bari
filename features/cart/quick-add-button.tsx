"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { cart, useCartItems } from "@/features/cart/cart-store";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-schema";
import { cn } from "@/lib/utils";

type Status = "idle" | "added" | "error";

// One-tap "add 1 to cart" for product cards. The product page's
// AddToCart handles quantities and the longer messages.
export function QuickAddButton({
  productId,
  available,
}: {
  productId: string;
  available: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const items = useCartItems();
  const inCart =
    items?.find((item) => item.productId === productId)?.quantity ?? 0;
  const atLimit = inCart >= MAX_QUANTITY_PER_ITEM;

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const label = !available
    ? "স্টকে নেই"
    : status === "added"
      ? "যোগ হয়েছে"
      : status === "error"
        ? "কার্ট পূর্ণ"
        : atLimit
          ? "কার্টে সর্বোচ্চ"
          : "কার্টে যোগ করুন";

  return (
    <button
      type="button"
      disabled={!available || items === null || atLimit}
      onClick={() => setStatus(cart.add(productId, 1).ok ? "added" : "error")}
      className={cn(
        "inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors",
        "bg-primary hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        status === "error" && "bg-destructive hover:bg-destructive",
      )}
    >
      {status === "added" ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <ShoppingCart className="size-4" aria-hidden />
      )}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
