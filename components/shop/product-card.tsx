import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/shop/price";
import { QuickAddButton } from "@/features/cart/quick-add-button";
import {
  getPercentOff,
  getUnitPrice,
  isSaleActive,
} from "@/features/catalog/pricing";
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

  const href = `/products/${product.slug}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition-shadow hover:shadow-md">
      <Link
        href={href}
        className="relative block aspect-4/5 overflow-hidden bg-muted"
      >
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
        {unavailable ? (
          <span className="absolute top-2 right-0 rounded-l-md bg-foreground/80 px-2 py-1 text-xs font-medium text-background">
            স্টকে নেই
          </span>
        ) : (
          isSaleActive(product) && (
            <span className="absolute top-2 right-0 rounded-l-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              {percentOff > 0 ? `${percentOff}% ছাড়` : "ছাড়"}
            </span>
          )
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2 sm:p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium sm:text-base">
          <Link href={href} className="underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        <Price product={product} />
        <div className="mt-auto pt-1.5">
          <QuickAddButton productId={product.id} available={!unavailable} />
        </div>
      </div>
    </div>
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
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
