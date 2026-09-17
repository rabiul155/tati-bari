"use client";

import { useCallback, useEffect, useState } from "react";
import { cart } from "@/features/cart/cart-store";
import type { CartItem, CartQuote } from "@/features/cart/cart-schema";

type State = { key: string; quote?: CartQuote; failed?: boolean };

// Fetches current server prices for the cart. While a new quote loads, the
// previous one stays available so the page doesn't flicker.
export function useCartQuote(items: CartItem[] | null) {
  const key = items && items.length > 0 ? JSON.stringify(items) : null;
  const [state, setState] = useState<State | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: JSON.parse(key) }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? (response.json() as Promise<CartQuote>) : Promise.reject()))
      .then((quote) => {
        setState({ key, quote });
        // Products deleted since they were added.
        if (quote.removedProductIds.length > 0) cart.removeMany(quote.removedProductIds);
      })
      .catch(() => {
        if (!controller.signal.aborted) setState((previous) => ({ ...previous, key, failed: true }));
      });
    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => {
    setState((previous) => previous && { ...previous, key: "", failed: false });
    setAttempt((n) => n + 1);
  }, []);

  const current = key !== null && state?.key === key;
  return {
    quote: key === null ? null : (state?.quote ?? null),
    loading: key !== null && !current,
    failed: current && Boolean(state?.failed),
    retry,
  };
}
