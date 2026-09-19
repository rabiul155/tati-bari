import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteProduct,
  setProductArchived,
} from "@/features/admin/products/actions";
import { toProductFormValues } from "@/features/admin/products/form-values";
import { ImageManager } from "@/features/admin/products/image-manager";
import { ProductForm } from "@/features/admin/products/product-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "পণ্য সম্পাদনা" };

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        _count: { select: { orderItems: true } },
      },
    }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  const archived = product.archivedAt !== null;
  const inOrders = product._count.orderItems > 0;
  const images = product.images.map(({ id, url }) => ({ id, url }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.name}
        description={`কোড ${product.code}`}
      >
        {archived ? (
          <Badge variant="secondary">আর্কাইভ করা</Badge>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            শপে দেখুন
          </Link>
        )}
        <ConfirmActionButton
          variant="outline"
          confirmMessage={
            archived
              ? undefined
              : "এই পণ্যটি আর্কাইভ করবেন? এটি শপ থেকে লুকানো থাকবে, কিন্তু আগের অর্ডারের জন্য সংরক্ষিত থাকবে।"
          }
          action={setProductArchived.bind(null, product.id, !archived)}
        >
          {archived ? "শপে ফিরিয়ে আনুন" : "আর্কাইভ করুন"}
        </ConfirmActionButton>
        {!inOrders && (
          <ConfirmActionButton
            variant="destructive"
            confirmMessage={`"${product.name}" এবং এর ছবিগুলো স্থায়ীভাবে মুছে ফেলবেন?`}
            action={deleteProduct.bind(null, product.id)}
          >
            মুছুন
          </ConfirmActionButton>
        )}
      </PageHeader>

      {created && (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          পণ্য তৈরি হয়েছে। এখন কিছু ছবি যোগ করুন।
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ছবি</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            key={images.map((image) => image.id).join()}
            productId={product.id}
            productName={product.name}
            images={images}
          />
        </CardContent>
      </Card>

      <ProductForm
        productId={product.id}
        categories={categories}
        defaultValues={toProductFormValues(product)}
      />
    </div>
  );
}
