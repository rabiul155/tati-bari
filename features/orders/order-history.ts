"use client";

// Orders placed from this browser, kept in localStorage so customers can
// return to them without an account. Each entry holds the private order
// link. If this is lost, customers can look their orders up by phone number.
import { useSyncExternalStore } from "react";
import { z } from "zod";

const STORAGE_KEY = "orders:v1";
const MAX_ENTRIES = 30;

const entrySchema = z.object({
  number: z.string().max(20),
  url: z.string().startsWith("/orders/").max(200),
  total: z.number().int(),
  itemCount: z.number().int(),
  placedAt: z.string().max(40),
});
export type SavedOrder = z.infer<typeof entrySchema>;

const EMPTY: SavedOrder[] = [];
let snapshot: SavedOrder[] | null = null;
const listeners = new Set<() => void>();

function read(): SavedOrder[] {
  try {
    const parsed = z.array(entrySchema).safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    return parsed.success && parsed.data.length > 0 ? parsed.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      snapshot = null;
      listener();
    }
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedOrders(): SavedOrder[] | null {
  return useSyncExternalStore<SavedOrder[] | null>(
    subscribe,
    () => (snapshot ??= read()),
    () => null,
  );
}

export function saveOrder(order: SavedOrder) {
  saveOrders([order]);
}

// Adds or refreshes orders (e.g. from a phone number lookup), newest first.
export function saveOrders(orders: SavedOrder[]) {
  const incoming = orders.map(({ number, url, total, itemCount, placedAt }) => ({
    number,
    url,
    total,
    itemCount,
    placedAt,
  }));
  const numbers = new Set(incoming.map((order) => order.number));
  const next = [...incoming, ...read().filter((entry) => !numbers.has(entry.number))]
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
    .slice(0, MAX_ENTRIES);
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable; the confirmation page still shows the order.
  }
  for (const listener of listeners) listener();
}
