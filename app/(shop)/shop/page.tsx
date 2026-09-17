import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  getShopCategories,
  searchProducts,
  SHOP_SORTS,
  type ShopSort,
} from "@/features/catalog/queries";
import { cn } from "@/lib/utils";

const PER_PAGE = 24;

type SearchParams = Awaited<PageProps<"/shop">["searchParams"]>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function readPrice(value: string) {
  return /^\d{1,7}$/.test(value) ? Number(value) : undefined;
}

function parseFilters(params: SearchParams) {
  const sort = first(params.sort);
  return {
    categorySlug: first(params.category) || undefined,
    minPrice: readPrice(first(params.min)),
    maxPrice: readPrice(first(params.max)),
    inStockOnly: first(params.instock) === "1",
    sort: (Object.hasOwn(SHOP_SORTS, sort) ? sort : "newest") as ShopSort,
    page: Math.max(1, Number.parseInt(first(params.page), 10) || 1),
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { categorySlug } = parseFilters(await searchParams);
  const category = categorySlug
    ? (await getShopCategories()).find((c) => c.slug === categorySlug)
    : undefined;
  return {
    title: category ? `${category.name} sarees` : "Shop sarees",
    description: category?.description ?? "Browse handwoven Tangail sarees.",
    alternates: { canonical: category ? `/shop?category=${category.slug}` : "/shop" },
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const filters = parseFilters(await searchParams);
  const [categories, result] = await Promise.all([
    getShopCategories(),
    searchProducts({ ...filters, perPage: PER_PAGE }),
  ]);
  const category = categories.find((c) => c.slug === filters.categorySlug);

  const href = (changes: Partial<typeof filters>) => {
    const next = { ...filters, page: 1, ...changes };
    const search = new URLSearchParams();
    if (next.categorySlug) search.set("category", next.categorySlug);
    if (next.minPrice !== undefined) search.set("min", String(next.minPrice));
    if (next.maxPrice !== undefined) search.set("max", String(next.maxPrice));
    if (next.inStockOnly) search.set("instock", "1");
    if (next.sort !== "newest") search.set("sort", next.sort);
    if (next.page > 1) search.set("page", String(next.page));
    const query = search.toString();
    return `/shop${query ? `?${query}` : ""}`;
  };
  const hasFilters =
    filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.inStockOnly;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {category ? category.name : "All sarees"}
        </h1>
        {category?.description && <p className="text-muted-foreground">{category.description}</p>}
      </div>

      <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {[{ slug: undefined, name: "All" }, ...categories].map((c) => {
            const active = c.slug === filters.categorySlug;
            return (
              <li key={c.slug ?? "all"}>
                <Link
                  href={href({ categorySlug: c.slug })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
        {filters.categorySlug && <input type="hidden" name="category" value={filters.categorySlug} />}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min">Min price (৳)</Label>
          <Input id="min" name="min" type="number" min={0} inputMode="numeric" defaultValue={filters.minPrice} className="w-28" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="max">Max price (৳)</Label>
          <Input id="max" name="max" type="number" min={0} inputMode="numeric" defaultValue={filters.maxPrice} className="w-28" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sort">Sort by</Label>
          <NativeSelect id="sort" name="sort" defaultValue={filters.sort}>
            {Object.entries(SHOP_SORTS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <label className="flex h-8 items-center gap-2 text-sm">
          <input type="checkbox" name="instock" value="1" defaultChecked={filters.inStockOnly} className="size-4 accent-primary" />
          In stock only
        </label>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        {(hasFilters || filters.sort !== "newest") && (
          <Link
            href={href({ minPrice: undefined, maxPrice: undefined, inStockOnly: false, sort: "newest" })}
            className={buttonVariants({ variant: "ghost" })}
          >
            Clear filters
          </Link>
        )}
      </form>

      <p className="text-sm text-muted-foreground" role="status">
        {result.total} saree{result.total === 1 ? "" : "s"}
      </p>

      {result.products.length > 0 ? (
        <ProductGrid products={result.products} priorityCount={4} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
          <p>No sarees match these filters.</p>
          <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
            See all sarees
          </Link>
        </div>
      )}

      {result.pageCount > 1 && (
        <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
          {filters.page > 1 ? (
            <Link href={href({ page: filters.page - 1 })} className={buttonVariants({ variant: "outline" })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {Math.min(filters.page, result.pageCount)} of {result.pageCount}
          </span>
          {filters.page < result.pageCount ? (
            <Link href={href({ page: filters.page + 1 })} className={buttonVariants({ variant: "outline" })}>
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
