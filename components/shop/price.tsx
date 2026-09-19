import { getPercentOff, getUnitPrice, type PricedProduct } from "@/features/catalog/pricing";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

// Current price, with the regular price struck through during a sale.
export function Price({
  product,
  size = "default",
  className,
}: {
  product: PricedProduct;
  size?: "default" | "lg";
  className?: string;
}) {
  const price = getUnitPrice(product);
  const { unitPrice, unitDiscount, finalUnitPrice } = price;
  const percentOff = getPercentOff(price);

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-semibold",
          size === "lg" ? "text-2xl" : "text-base",
          unitDiscount > 0 && "text-primary",
        )}
      >
        <span className="sr-only">{unitDiscount > 0 ? "বিশেষ দাম " : "দাম "}</span>
        {formatTaka(finalUnitPrice)}
      </span>
      {unitDiscount > 0 && (
        <>
          <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-base" : "text-sm")}>
            <span className="sr-only">নিয়মিত দাম </span>
            {formatTaka(unitPrice)}
          </span>
          {percentOff > 0 && (
            <span className="text-xs font-medium text-primary">{percentOff}% ছাড়</span>
          )}
        </>
      )}
    </p>
  );
}
