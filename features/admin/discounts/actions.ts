"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { validationFailed, type ActionResult } from "@/features/admin/action-result";
import { discountSchema, type DiscountFormValues } from "@/features/admin/discounts/schema";

// Creates a discount when `id` is null, otherwise updates it. Past orders
// keep their own copy of the discount name and amount.
export async function saveDiscount(id: string | null, values: DiscountFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = discountSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error);

  if (id) {
    const { count } = await db.discount.updateMany({ where: { id }, data: parsed.data });
    if (count === 0) return { ok: false, error: "এই ছাড়টি আর নেই।" };
  } else {
    await db.discount.create({ data: parsed.data });
  }
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function setDiscountActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.discount.updateMany({ where: { id }, data: { isActive } });
  revalidatePath("/admin/discounts");
  return { ok: true };
}

// Orders that used the discount keep its name and amount (Order.discountId
// is set to null).
export async function deleteDiscount(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.discount.deleteMany({ where: { id } });
  revalidatePath("/admin/discounts");
  return { ok: true };
}
