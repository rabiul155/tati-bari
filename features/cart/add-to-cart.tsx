"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cart, useCartItems } from "@/features/cart/cart-store";
import { MAX_CART_LINES, MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-schema";
import { QuantityStepper } from "@/features/cart/quantity-stepper";

type Message = { tone: "success" | "error"; text: string };

export function AddToCart({ productId, available }: { productId: string; available: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<Message>();
  const items = useCartItems();
  const inCart = items?.find((item) => item.productId === productId)?.quantity ?? 0;
  const atLimit = inCart >= MAX_QUANTITY_PER_ITEM;

  if (!available) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 text-sm">
        This saree is out of stock right now. Contact us and we will let you know when it is back.
      </p>
    );
  }

  function add() {
    const result = cart.add(productId, quantity);
    if (!result.ok) {
      setMessage({
        tone: "error",
        text: `Your cart can hold up to ${MAX_CART_LINES} different sarees.`,
      });
      return;
    }
    setQuantity(1);
    setMessage({
      tone: "success",
      text: result.limited
        ? `You now have the maximum of ${MAX_QUANTITY_PER_ITEM} in your cart.`
        : `Added to cart. You have ${result.quantity} in your cart.`,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={(value) => {
            setQuantity(value);
            setMessage(undefined);
          }}
          disabled={atLimit}
        />
        <Button
          type="button"
          size="lg"
          className="min-w-40 px-5"
          disabled={items === null || atLimit}
          onClick={add}
        >
          Add to cart
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
                View cart →
              </Link>
            )}
          </p>
        ) : atLimit ? (
          <p className="text-muted-foreground">
            You have the maximum of {MAX_QUANTITY_PER_ITEM} in your{" "}
            <Link href="/cart" className="underline underline-offset-4">
              cart
            </Link>
            .
          </p>
        ) : inCart > 0 ? (
          <p className="text-muted-foreground">
            {inCart} already in your{" "}
            <Link href="/cart" className="underline underline-offset-4">
              cart
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
