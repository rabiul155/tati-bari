// Picks the order-level discount for a subtotal: the largest active
// discount whose minimum order value is met. Never more than the subtotal.
import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export type AppliedDiscount = { id: string; name: string; amount: number };

export async function findBestDiscount(
  subtotal: number,
  now: Date = new Date(),
  client: Prisma.TransactionClient = db,
): Promise<AppliedDiscount | null> {
  if (subtotal <= 0) return null;
  const discount = await client.discount.findFirst({
    where: {
      isActive: true,
      minOrderValue: { lte: subtotal },
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, amount: true },
  });
  return discount && { ...discount, amount: Math.min(discount.amount, subtotal) };
}

// The cheapest-to-reach active discount that is bigger than the current
// one but needs a larger subtotal, for "spend ৳X more" hints.
export async function findNextDiscount(
  subtotal: number,
  currentAmount: number,
  now: Date = new Date(),
): Promise<{ name: string; amount: number; remaining: number } | null> {
  if (subtotal <= 0) return null;
  const discount = await db.discount.findFirst({
    where: {
      isActive: true,
      minOrderValue: { gt: subtotal },
      amount: { gt: currentAmount },
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: [{ minOrderValue: "asc" }, { amount: "desc" }],
    select: { name: true, amount: true, minOrderValue: true },
  });
  return discount && { name: discount.name, amount: discount.amount, remaining: discount.minOrderValue - subtotal };
}
