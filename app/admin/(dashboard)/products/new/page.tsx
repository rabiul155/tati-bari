import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { emptyProductFormValues } from "@/features/admin/products/form-values";
import { ProductForm } from "@/features/admin/products/product-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "নতুন পণ্য" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="নতুন পণ্য"
        description="পণ্য তৈরির পরে ছবি যোগ করতে পারবেন।"
      />
      {categories.length === 0 ? (
        <p>
          আগে একটি{" "}
          <Link href="/admin/categories/new" className="underline underline-offset-4">
            ক্যাটাগরি
          </Link>{" "}
          তৈরি করুন।
        </p>
      ) : (
        <ProductForm
          productId={null}
          categories={categories}
          defaultValues={emptyProductFormValues}
        />
      )}
    </div>
  );
}
