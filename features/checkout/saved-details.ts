"use client";

// The customer's last delivery details, remembered in this browser so
// repeat orders are quicker. Never sent anywhere except with an order.
import type { CheckoutFormValues } from "@/features/checkout/schema";

const STORAGE_KEY = "checkout-details:v1";
const FIELDS = ["name", "phone", "district", "area", "address", "postalCode"] as const;

type SavedDetails = Partial<Pick<CheckoutFormValues, (typeof FIELDS)[number]>>;

export function loadSavedDetails(): SavedDetails | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return null;
    const details: Record<string, string> = {};
    for (const field of FIELDS) {
      if (typeof raw[field] === "string") details[field] = raw[field].slice(0, 300);
    }
    return details as SavedDetails;
  } catch {
    return null;
  }
}

export function saveDetails(values: CheckoutFormValues) {
  try {
    const details = Object.fromEntries(FIELDS.map((field) => [field, values[field] ?? ""]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Storage unavailable; nothing to remember.
  }
}
