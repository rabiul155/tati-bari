// Display and input helpers shared by server and client code.

// The business runs on Bangladesh time (UTC+6, no daylight saving).
export const BUSINESS_TIME_ZONE = "Asia/Dhaka";
const DHAKA_OFFSET = "+06:00";

const takaFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

// 12500 -> "৳12,500"
export function formatTaka(amount: number): string {
  return `৳${takaFormatter.format(amount)}`;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BUSINESS_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

// Date -> "2026-09-17T15:30" in Dhaka time, for <input type="datetime-local">.
export function toDhakaDateTimeInput(date: Date | null | undefined): string {
  if (!date) return "";
  const shifted = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

// "2026-09-17T15:30" (Dhaka time) -> Date, or null if empty/invalid.
export function fromDhakaDateTimeInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${DHAKA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
