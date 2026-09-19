import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/shop/price";
import { getPercentOff, getUnitPrice, isSaleActive } from "@/features/catalog/pricing";
import type { ProductCardData } from "@/features/catalog/queries";

export const PRODUCT_CARD_SIZES =
  "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

export function ProductCard({
  product,
  priority,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const image = product.images[0];
  const unavailable = product.availability === "UNAVAILABLE";
  const percentOff = getPercentOff(getUnitPrice(product));

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes={PRODUCT_CARD_SIZES}
            loading={priority ? "eager" : undefined}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            ছবি শীঘ্রই আসছে
          </div>
        )}
        <div className="absolute top-2 right-1 flex flex-col items-start gap-1">
          {unavailable ? (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
              স্টকে নেই
            </span>
          ) : (
            isSaleActive(product) && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {percentOff > 0 ? `${percentOff}% ছাড়` : "ছাড়"}
              </span>
            )
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="leading-snug font-medium underline-offset-4 group-hover:underline">
          {product.name}
        </h3>
        <Price product={product} />
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
