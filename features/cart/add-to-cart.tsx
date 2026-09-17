"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MAX_QUANTITY_PER_ITEM = 10;

// Quantity selector and Add to cart button. The cart itself arrives in
// Phase 6; until then the button is disabled.
export function AddToCart({ available }: { productId: string; available: boolean }) {
  const [quantity, setQuantity] = useState(1);

  if (!available) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 text-sm">
        This saree is out of stock right now. Contact us and we will let you know when it is back.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border" role="group" aria-label="Quantity">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <output aria-live="polite" className="w-10 text-center font-medium tabular-nums">
            {quantity}
          </output>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_QUANTITY_PER_ITEM}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY_PER_ITEM, q + 1))}
          >
            <Plus />
          </Button>
        </div>
        <Button type="button" size="lg" className="min-w-40 px-5" disabled>
          Add to cart
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Online ordering opens soon.</p>
    </div>
  );
}
