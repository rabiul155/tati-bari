// Orders are stored with a sequential integer (`Order.number`) and shown to
// people as a prefixed, zero-padded code, e.g. 123 -> "TS-000123".
import { site } from "@/lib/site";

const PAD_LENGTH = 6;

export function formatOrderNumber(number: number): string {
  return `${site.orderPrefix}-${String(number).padStart(PAD_LENGTH, "0")}`;
}

const ORDER_NUMBER_PATTERN = new RegExp(`^(?:${site.orderPrefix}-?)?(\\d{1,10})$`, "i");

// Accepts "TS-000123", "ts-123", "000123" or "123" (e.g. from an admin
// search box). Returns null if the input is not an order number.
export function parseOrderNumber(input: string): number | null {
  const match = ORDER_NUMBER_PATTERN.exec(input.trim());
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}
