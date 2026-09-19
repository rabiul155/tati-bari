import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/features/admin/categories/category-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "নতুন ক্যাটাগরি" };

export default async function NewCategoryPage() {
  await requireAdmin();
  const last = await db.category.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="নতুন ক্যাটাগরি" back={{ href: "/admin/categories", label: "ক্যাটাগরি" }} />
      <CategoryForm
        categoryId={null}
        defaultValues={{
          name: "",
          slug: "",
          description: "",
          sortOrder: String((last?.sortOrder ?? -1) + 1),
        }}
      />
    </div>
  );
}
