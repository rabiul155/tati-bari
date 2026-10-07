"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, ShoppingCart, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cart, useCartItems } from "@/features/cart/cart-store";
import { MAX_CART_LINES, MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-schema";
import { QuantityStepper } from "@/features/cart/quantity-stepper";

type Message = { tone: "success" | "error"; text: string };

export function AddToCart({ productId, available }: { productId: string; available: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<Message>();
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();
  const items = useCartItems();
  const inCart = items?.find((item) => item.productId === productId)?.quantity ?? 0;
  const atLimit = inCart >= MAX_QUANTITY_PER_ITEM;

  if (!available) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 text-sm">
        এই শাড়িটি এখন স্টকে নেই। যোগাযোগ করুন, আবার পাওয়া গেলে আপনাকে জানিয়ে দেব।
      </p>
    );
  }

  function showCartFull() {
    setMessage({
      tone: "error",
      text: `আপনার কার্টে সর্বোচ্চ ${MAX_CART_LINES}টি ভিন্ন শাড়ি রাখা যাবে।`,
    });
  }

  // Buy now: put the chosen quantity in the cart and go straight to
  // checkout, which orders the whole cart as usual. At the per-item
  // limit the product is already in the cart, so just go.
  function orderNow() {
    if (!atLimit && !cart.add(productId, quantity).ok) {
      showCartFull();
      return;
    }
    setOrdering(true);
    router.push("/checkout");
  }

  function add() {
    const result = cart.add(productId, quantity);
    if (!result.ok) {
      showCartFull();
      return;
    }
    setQuantity(1);
    setMessage({
      tone: "success",
      text: result.limited
        ? `আপনার কার্টে এখন সর্বোচ্চ ${MAX_QUANTITY_PER_ITEM}টি রয়েছে।`
        : `কার্টে যোগ করা হয়েছে। আপনার কার্টে ${result.quantity}টি আছে।`,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm font-medium">পরিমাণ</span>
        <QuantityStepper
          value={quantity}
          onChange={(value) => {
            setQuantity(value);
            setMessage(undefined);
          }}
          disabled={atLimit}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 border-primary px-3 text-primary hover:bg-primary/5 hover:text-primary"
          disabled={items === null || atLimit || ordering}
          onClick={add}
        >
          <ShoppingCart aria-hidden />
          কার্টে যোগ করুন
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-10 px-3 shadow-sm hover:bg-primary/90"
          disabled={items === null || ordering}
          onClick={orderNow}
        >
          {ordering ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Zap className="fill-current" aria-hidden />
          )}
          এখনই অর্ডার করুন
        </Button>
      </div>
      <div role="status" aria-live="polite" className="min-h-5 text-sm">
        {message ? (
          <p
            className={
              message.tone === "success"
                ? "flex flex-wrap items-center gap-x-3 gap-y-1"
                : "text-destructive"
            }
          >
            {message.tone === "success" && <Check className="size-4 text-green-700" aria-hidden />}
            <span>{message.text}</span>
            {message.tone === "success" && (
              <Link href="/cart" className={buttonVariants({ variant: "link", className: "h-auto px-0" })}>
                কার্ট দেখুন →
              </Link>
            )}
          </p>
        ) : atLimit ? (
          <p className="text-muted-foreground">
            আপনার{" "}
            <Link href="/cart" className="underline underline-offset-4">
              কার্টে
            </Link>{" "}
            সর্বোচ্চ {MAX_QUANTITY_PER_ITEM}টি রয়েছে।
          </p>
        ) : inCart > 0 ? (
          <p className="text-muted-foreground">
            আপনার{" "}
            <Link href="/cart" className="underline underline-offset-4">
              কার্টে
            </Link>{" "}
            ইতিমধ্যে {inCart}টি আছে।
          </p>
        ) : null}
      </div>
    </div>
  );
}
