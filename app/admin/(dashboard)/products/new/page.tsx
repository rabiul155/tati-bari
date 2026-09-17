import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { emptyProductFormValues } from "@/features/admin/products/form-values";
import { ProductForm } from "@/features/admin/products/product-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New product"
        description="You can add photos after creating the product."
        back={{ href: "/admin/products", label: "Products" }}
      />
      {categories.length === 0 ? (
        <p>
          Create a{" "}
          <Link href="/admin/categories/new" className="underline underline-offset-4">
            category
          </Link>{" "}
          first.
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
