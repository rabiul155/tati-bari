import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/features/admin/categories/category-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "ক্যাটাগরি সম্পাদনা" };

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${category.name} সম্পাদনা`}
        back={{ href: "/admin/categories", label: "ক্যাটাগরি" }}
      />
      <CategoryForm
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          sortOrder: String(category.sortOrder),
        }}
      />
    </div>
  );
}
