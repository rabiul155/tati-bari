"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateCatalog } from "@/features/catalog/revalidate";
import { validationFailed, type ActionResult } from "@/features/admin/action-result";
import { categorySchema, type CategoryFormValues } from "@/features/admin/categories/schema";

// Creates a category when `id` is null, otherwise updates it.
export async function saveCategory(
  id: string | null,
  values: CategoryFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error);
  const data = parsed.data;

  const slugTaken = await db.category.findFirst({
    where: { slug: data.slug, ...(id && { id: { not: id } }) },
    select: { id: true },
  });
  if (slugTaken) {
    return { ok: false, fieldErrors: { slug: ["অন্য একটি ক্যাটাগরি ইতিমধ্যে এই slug ব্যবহার করছে।"] } };
  }

  if (id) {
    const { count } = await db.category.updateMany({ where: { id }, data });
    if (count === 0) return { ok: false, error: "এই ক্যাটাগরিটি আর নেই।" };
  } else {
    await db.category.create({ data });
  }

  revalidateCatalog();
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      ok: false,
      error: `আগে এর ${productCount}টি পণ্য (আর্কাইভ করা পণ্যসহ) সরান অথবা মুছে ফেলুন।`,
    };
  }
  await db.category.deleteMany({ where: { id } });
  revalidateCatalog();
  return { ok: true };
}
