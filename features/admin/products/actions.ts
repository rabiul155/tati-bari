"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { InvalidImageError, processProductImage } from "@/lib/images/process";
import { getImageStorage } from "@/lib/storage";
import { revalidateCatalog } from "@/features/catalog/revalidate";
import { validationFailed, type ActionResult } from "@/features/admin/action-result";
import { MAX_IMAGES_PER_PRODUCT, MAX_UPLOAD_BYTES } from "@/features/admin/products/constants";
import { productSchema, type ProductFormValues } from "@/features/admin/products/schema";


// ─── Product details ────────────────────────────────────────────────────────

// Creates a product when `id` is null (then opens its edit page so photos
// can be added), otherwise updates it.
export async function saveProduct(
  id: string | null,
  values: ProductFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error);
  const data = parsed.data;

  const notSelf = id ? { id: { not: id } } : {};
  const [slugTaken, codeTaken, category] = await Promise.all([
    db.product.findFirst({ where: { slug: data.slug, ...notSelf }, select: { id: true } }),
    db.product.findFirst({ where: { code: data.code, ...notSelf }, select: { id: true } }),
    db.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
  ]);
  const fieldErrors: Record<string, string[]> = {};
  if (slugTaken) fieldErrors.slug = ["Another product already uses this slug."];
  if (codeTaken) fieldErrors.code = ["Another product already uses this code."];
  if (!category) fieldErrors.categoryId = ["Choose a category."];
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  if (id) {
    const { count } = await db.product.updateMany({ where: { id }, data });
    if (count === 0) return { ok: false, error: "This product no longer exists." };
    revalidateCatalog();
    return { ok: true };
  }

  const product = await db.product.create({ data, select: { id: true } });
  revalidateCatalog();
  redirect(`/admin/products/${product.id}/edit?created=1`);
}

export async function setProductArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.product.updateMany({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });
  revalidateCatalog();
  return { ok: true };
}

// Products that appear in orders can only be archived, so order history
// stays intact.
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const orderCount = await db.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return { ok: false, error: "This product is in past orders. Archive it instead." };
  }

  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.deleteMany({ where: { id } });
  await Promise.all(images.map(deleteStoredImage));

  revalidateCatalog();
  redirect("/admin/products");
}

// ─── Images ─────────────────────────────────────────────────────────────────

// Uploads one image (form field "file"); the browser sends them one by one.
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "This image is too large (maximum 4 MB)." };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true, _count: { select: { images: true } } },
  });
  if (!product) return { ok: false, error: "This product no longer exists." };
  if (product._count.images >= MAX_IMAGES_PER_PRODUCT) {
    return { ok: false, error: `A product can have at most ${MAX_IMAGES_PER_PRODUCT} photos.` };
  }

  let processed;
  try {
    processed = await processProductImage(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof InvalidImageError) return { ok: false, error: error.message };
    throw error;
  }

  const name = `${product.slug.slice(0, 50)}-${randomBytes(6).toString("hex")}`;
  const stored = await getImageStorage().upload(processed.data, name, processed.format);

  // New photos go last. Concurrent uploads may share a sortOrder; the next
  // reorder renumbers them.
  const last = await db.productImage.findFirst({
    where: { productId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await db.productImage.create({
    data: {
      productId,
      url: stored.url,
      storageKey: stored.key,
      width: processed.width,
      height: processed.height,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidateCatalog();
  return { ok: true };
}

// Saves a new photo order. The first photo is the main one.
export async function reorderProductImages(
  productId: string,
  imageIds: string[],
): Promise<ActionResult> {
  await requireAdmin();
  const current = await db.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const currentIds = new Set(current.map((image) => image.id));
  if (
    !Array.isArray(imageIds) ||
    imageIds.length !== currentIds.size ||
    new Set(imageIds).size !== imageIds.length ||
    !imageIds.every((id) => currentIds.has(id))
  ) {
    return { ok: false, error: "The photos changed in the meantime. Reload the page." };
  }

  await db.$transaction(
    imageIds.map((id, sortOrder) =>
      db.productImage.update({ where: { id }, data: { sortOrder } }),
    ),
  );
  revalidateCatalog();
  return { ok: true };
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  await requireAdmin();
  const image = await db.productImage.findUnique({ where: { id: imageId } });
  if (!image) return { ok: true };

  await db.productImage.delete({ where: { id: imageId } });
  await deleteStoredImage(image);
  revalidateCatalog();
  return { ok: true };
}

// Removes the file from storage unless an order still shows it. Failures
// are logged, not thrown: the database row is already gone and a leftover
// file is harmless.
async function deleteStoredImage(image: { url: string; storageKey: string | null }) {
  if (!image.storageKey) return;
  const usedByOrders = await db.orderItem.count({ where: { productImageUrl: image.url } });
  if (usedByOrders > 0) return;
  try {
    await getImageStorage().delete(image.storageKey);
  } catch (error) {
    console.error("Failed to delete stored image", image.storageKey, error);
  }
}
