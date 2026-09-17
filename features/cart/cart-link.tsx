"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/features/cart/cart-store";

export function CartLink() {
  const count = useCartCount();
  const label = count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart";

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[0.7rem] leading-none font-semibold text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
