import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCTS_PER_PAGE } from "@/features/admin/products/constants";
import { isSaleActive } from "@/features/catalog/pricing";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import type { Prisma } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Products" };

const STATUSES = { active: "Active", archived: "Archived", all: "All" } as const;
const AVAILABILITY = { AVAILABLE: "Available", UNAVAILABLE: "Unavailable" } as const;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function oneOf<T extends object>(options: T, value: string) {
  return Object.hasOwn(options, value) ? (value as keyof T & string) : undefined;
}

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const params = await searchParams;
  const q = first(params.q).slice(0, 100);
  const categoryId = first(params.category);
  const status = oneOf(STATUSES, first(params.status)) ?? "active";
  const availability = oneOf(AVAILABILITY, first(params.availability));
  const page = Math.max(1, Number.parseInt(first(params.page), 10) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(availability && { availability }),
    ...(status === "active" && { archivedAt: null }),
    ...(status === "archived" && { archivedAt: { not: null } }),
  };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      include: {
        category: { select: { name: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1 },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const now = new Date();

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (categoryId) search.set("category", categoryId);
    if (status !== "active") search.set("status", status);
    if (availability) search.set("availability", availability);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return `/admin/products${query ? `?${query}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Products" description={`${total} product${total === 1 ? "" : "s"}`}>
        <Link href="/admin/products/new" className={buttonVariants()}>
          New product
        </Link>
      </PageHeader>

      <form method="get" className="flex flex-wrap items-end gap-2" role="search">
        <Input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search name or code"
          aria-label="Search name or code"
          className="w-full sm:w-64"
        />
        <NativeSelect name="category" defaultValue={categoryId} aria-label="Category">
          <NativeSelectOption value="">All categories</NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category.id} value={category.id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect name="availability" defaultValue={availability ?? ""} aria-label="Availability">
          <NativeSelectOption value="">Any availability</NativeSelectOption>
          {Object.entries(AVAILABILITY).map(([value, label]) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect name="status" defaultValue={status} aria-label="Status">
          {Object.entries(STATUSES).map(([value, label]) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
        {(q || categoryId || availability || status !== "active") && (
          <Link href="/admin/products" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">
                <span className="sr-only">Photo</span>
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const image = product.images[0];
              const onSale = isSaleActive(product, now);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-14 w-10 overflow-hidden rounded bg-muted">
                      {image && (
                        <Image src={image.url} alt="" fill unoptimized sizes="40px" className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{product.code}</div>
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {onSale ? (
                      <>
                        <div className="font-medium">{formatTaka(product.salePrice!)}</div>
                        <div className="text-xs text-muted-foreground line-through">
                          {formatTaka(product.regularPrice)}
                        </div>
                      </>
                    ) : (
                      formatTaka(product.regularPrice)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.archivedAt && <Badge variant="secondary">Archived</Badge>}
                      {product.availability === "UNAVAILABLE" && (
                        <Badge variant="destructive">Unavailable</Badge>
                      )}
                      {onSale && <Badge>On sale</Badge>}
                      {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                      {!image && <Badge variant="outline">No photo</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {pageCount > 1 && (
        <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline" })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline" })}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
