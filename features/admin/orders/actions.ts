"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import type { ActionResult } from "@/features/admin/action-result";
import { revalidateCatalog } from "@/features/catalog/revalidate";
import { ALL_STATUSES } from "@/features/orders/status";

const statusSchema = z.enum(ALL_STATUSES as [OrderStatus, ...OrderStatus[]]);

// Errors shown to the admin as-is.
class OrderUpdateError extends Error {}

// Gives stock back (cancelling) or takes it again (reopening a cancelled
// order), for products that track a stock count.
async function adjustStock(tx: Prisma.TransactionClient, orderId: string, direction: "restore" | "reserve") {
  const items = await tx.orderItem.findMany({
    where: { orderId, product: { stockQuantity: { not: null } } },
    select: { productId: true, productName: true, quantity: true },
  });
  for (const item of items) {
    if (direction === "restore") {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
      await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: { gt: 0 }, availability: "UNAVAILABLE" },
        data: { availability: "AVAILABLE" },
      });
    } else {
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (count === 0) throw new OrderUpdateError(`এই অর্ডারটি আবার চালু করতে ${item.productName}-এর যথেষ্ট স্টক নেই।`);
      await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: 0 },
        data: { availability: "UNAVAILABLE" },
      });
    }
  }
  return items.length > 0;
}

// Changes the status only if it is still `fromStatus`, so a double click or
// two open tabs can't record the same change twice.
export async function updateOrderStatus(input: {
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  note: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      orderId: z.string().min(1),
      fromStatus: statusSchema,
      toStatus: statusSchema,
      note: z.string().trim().max(500),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "অবস্থা পরিবর্তন সঠিক নয়।" };
  const { orderId, fromStatus, toStatus, note } = parsed.data;
  if (fromStatus === toStatus) return { ok: false, error: "অর্ডারটি ইতিমধ্যে এই অবস্থায় আছে।" };

  try {
    const stockChanged = await db.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: fromStatus },
        data: { status: toStatus },
      });
      if (count === 0) throw new OrderUpdateError("ইতিমধ্যে এই অর্ডারটি পরিবর্তন হয়েছে। পেজটি রিলোড করুন।");

      let changed = false;
      if (toStatus === "CANCELLED") changed = await adjustStock(tx, orderId, "restore");
      if (fromStatus === "CANCELLED") changed = await adjustStock(tx, orderId, "reserve");

      await tx.orderStatusHistory.create({
        data: { orderId, fromStatus, toStatus, note: note || null, changedById: admin.id },
      });
      return changed;
    });
    if (stockChanged) revalidateCatalog();
  } catch (error) {
    if (error instanceof OrderUpdateError) return { ok: false, error: error.message };
    throw error;
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

const shippingSchema = z.object({
  courierName: z.string().trim().max(80).transform((value) => value || null),
  trackingNumber: z.string().trim().max(80).transform((value) => value || null),
  adminNote: z.string().trim().max(2000).transform((value) => value || null),
});

export type ShippingValues = z.input<typeof shippingSchema>;

export async function updateOrderShipping(orderId: string, values: ShippingValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = shippingSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "অনুগ্রহ করে চিহ্নিত ঘরগুলো ছোট করুন।", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { count } = await db.order.updateMany({ where: { id: orderId }, data: parsed.data });
  if (count === 0) return { ok: false, error: "এই অর্ডারটি আর নেই।" };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
