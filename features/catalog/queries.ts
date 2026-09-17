// Storefront reads. Only active (non-archived) products are ever returned,
// and only the fields the storefront shows.
import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getUnitPrice } from "@/features/catalog/pricing";

const primaryImage = {
  orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  take: 1,
  select: { url: true, width: true, height: true },
} satisfies Prisma.Product$imagesArgs;

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  code: true,
  regularPrice: true,
  salePrice: true,
  saleStartsAt: true,
  saleEndsAt: true,
  availability: true,
  createdAt: true,
  images: primaryImage,
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

const active = { archivedAt: null } satisfies Prisma.ProductWhereInput;

function saleActiveWhere(now: Date): Prisma.ProductWhereInput {
  return {
    salePrice: { not: null },
    AND: [
      { OR: [{ saleStartsAt: null }, { saleStartsAt: { lte: now } }] },
      { OR: [{ saleEndsAt: null }, { saleEndsAt: { gt: now } }] },
    ],
  };
}

export async function getHomeProducts(limit = 8) {
  const now = new Date();
  const [featured, newArrivals, onSale] = await Promise.all([
    db.product.findMany({
      where: { ...active, isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: cardSelect,
    }),
    db.product.findMany({
      where: active,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: cardSelect,
    }),
    db.product.findMany({
      where: { ...active, ...saleActiveWhere(now) },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: cardSelect,
    }),
  ]);
  return { featured, newArrivals, onSale };
}

// Categories that have at least one active product.
export async function getShopCategories() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      _count: { select: { products: { where: active } } },
      products: {
        where: active,
        orderBy: { isFeatured: "desc" },
        take: 1,
        select: { images: primaryImage },
      },
    },
  });
  return categories
    .filter((category) => category._count.products > 0)
    .map(({ products, _count, ...category }) => ({
      ...category,
      productCount: _count.products,
      image: products[0]?.images[0] ?? null,
    }));
}

export const SHOP_SORTS = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
export type ShopSort = keyof typeof SHOP_SORTS;

export type ShopFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort: ShopSort;
  page: number;
  perPage: number;
};

// The current price depends on the sale window, so price filtering and
// sorting happen in code. That is fine for a catalog of a few hundred
// products; move it into SQL if the catalog grows much larger.
export async function searchProducts(filters: ShopFilters) {
  const now = new Date();
  const products = await db.product.findMany({
    where: {
      ...active,
      ...(filters.categorySlug && { category: { slug: filters.categorySlug } }),
      ...(filters.inStockOnly && { availability: "AVAILABLE" }),
    },
    orderBy: { createdAt: "desc" },
    select: cardSelect,
  });

  const priced = products
    .map((product) => ({ product, price: getUnitPrice(product, now).finalUnitPrice }))
    .filter(
      ({ price }) =>
        (filters.minPrice === undefined || price >= filters.minPrice) &&
        (filters.maxPrice === undefined || price <= filters.maxPrice),
    );
  if (filters.sort === "price-asc") priced.sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc") priced.sort((a, b) => b.price - a.price);

  const total = priced.length;
  const start = (filters.page - 1) * filters.perPage;
  return {
    total,
    pageCount: Math.max(1, Math.ceil(total / filters.perPage)),
    products: priced.slice(start, start + filters.perPage).map(({ product }) => product),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { ...active, slug },
    select: {
      id: true,
      slug: true,
      name: true,
      code: true,
      description: true,
      fabric: true,
      color: true,
      length: true,
      hasBlousePiece: true,
      careInstructions: true,
      regularPrice: true,
      salePrice: true,
      saleStartsAt: true,
      saleEndsAt: true,
      availability: true,
      updatedAt: true,
      category: { select: { slug: true, name: true } },
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, url: true, width: true, height: true },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4) {
  return db.product.findMany({
    where: { ...active, id: { not: productId }, category: { slug: categorySlug } },
    orderBy: [{ availability: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
}

export async function getSitemapEntries() {
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: active, select: { slug: true, updatedAt: true } }),
    getShopCategories(),
  ]);
  return { products, categories };
}
