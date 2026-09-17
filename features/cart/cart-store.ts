"use client";

// The cart lives in localStorage and holds only product ids and
// quantities. Prices always come from the server (/api/cart/quote).
// Changes are shared with other open tabs through the "storage" event.
import { useSyncExternalStore } from "react";
import {
  cartItemsSchema,
  MAX_CART_LINES,
  MAX_QUANTITY_PER_ITEM,
  type CartItem,
} from "@/features/cart/cart-schema";

const STORAGE_KEY = "cart:v1";
const EMPTY: CartItem[] = [];

let snapshot: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = cartItemsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartItem[] {
  snapshot ??= readStorage();
  return snapshot;
}

function write(items: CartItem[]) {
  snapshot = items.length === 0 ? EMPTY : items;
  try {
    if (items.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked (e.g. private mode): the cart still works
    // for this page view.
  }
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  snapshot = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

// The cart items, or null while rendering on the server and during
// hydration (the server cannot see localStorage).
export function useCartItems(): CartItem[] | null {
  return useSyncExternalStore<CartItem[] | null>(subscribe, getSnapshot, () => null);
}

export function useCartCount(): number | null {
  const items = useCartItems();
  return items && items.reduce((sum, item) => sum + item.quantity, 0);
}

const clampQuantity = (quantity: number) =>
  Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(quantity)));

export type AddResult =
  | { ok: true; quantity: number; limited: boolean }
  | { ok: false; reason: "cart-full" };

export const cart = {
  // Adds to the existing quantity, capped at MAX_QUANTITY_PER_ITEM.
  add(productId: string, quantity: number): AddResult {
    const items = getSnapshot();
    const existing = items.find((item) => item.productId === productId);
    if (!existing && items.length >= MAX_CART_LINES) return { ok: false, reason: "cart-full" };

    const wanted = (existing?.quantity ?? 0) + quantity;
    const next = clampQuantity(wanted);
    write(
      existing
        ? items.map((item) => (item.productId === productId ? { ...item, quantity: next } : item))
        : [...items, { productId, quantity: next }],
    );
    return { ok: true, quantity: next, limited: next < wanted };
  },

  setQuantity(productId: string, quantity: number) {
    write(
      getSnapshot().map((item) =>
        item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
      ),
    );
  },

  remove(productId: string) {
    write(getSnapshot().filter((item) => item.productId !== productId));
  },

  removeMany(productIds: string[]) {
    const ids = new Set(productIds);
    const items = getSnapshot();
    const next = items.filter((item) => !ids.has(item.productId));
    if (next.length !== items.length) write(next);
  },

  clear() {
    write(EMPTY);
  },
};
