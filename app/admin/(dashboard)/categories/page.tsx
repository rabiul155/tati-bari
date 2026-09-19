import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/features/admin/categories/actions";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "ক্যাটাগরি" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="ক্যাটাগরি">
        <Link href="/admin/categories/new" className={buttonVariants()}>
          নতুন ক্যাটাগরি
        </Link>
      </PageHeader>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">এখনও কোনো ক্যাটাগরি নেই।</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">পণ্য</TableHead>
              <TableHead className="text-right">ক্রম</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/products?category=${category.id}&status=all`}
                    className="underline-offset-4 hover:underline"
                  >
                    {category._count.products}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{category.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-start justify-end gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      সম্পাদনা
                    </Link>
                    <ConfirmActionButton
                      variant="destructive"
                      size="sm"
                      disabled={category._count.products > 0}
                      title={
                        category._count.products > 0
                          ? "শুধু খালি ক্যাটাগরি মুছে ফেলা যায়"
                          : undefined
                      }
                      confirmMessage={`"${category.name}" ক্যাটাগরিটি মুছে ফেলবেন?`}
                      action={deleteCategory.bind(null, category.id)}
                    >
                      মুছুন
                    </ConfirmActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
