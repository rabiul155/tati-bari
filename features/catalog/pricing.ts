// Product price rules, shared by the admin, storefront and checkout.
// All amounts are whole taka.

export type PricedProduct = {
  regularPrice: number;
  salePrice: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
};

export type UnitPrice = {
  unitPrice: number;
  unitDiscount: number;
  finalUnitPrice: number;
};

// A sale applies when a sale price is set and `now` is inside the window
// [saleStartsAt, saleEndsAt). Missing bounds are open-ended.
export function isSaleActive(product: PricedProduct, now: Date = new Date()): boolean {
  if (product.salePrice === null || product.salePrice >= product.regularPrice) return false;
  if (product.saleStartsAt && now < product.saleStartsAt) return false;
  if (product.saleEndsAt && now >= product.saleEndsAt) return false;
  return true;
}

export function getUnitPrice(product: PricedProduct, now: Date = new Date()): UnitPrice {
  const finalUnitPrice = isSaleActive(product, now) ? product.salePrice! : product.regularPrice;
  return {
    unitPrice: product.regularPrice,
    unitDiscount: product.regularPrice - finalUnitPrice,
    finalUnitPrice,
  };
}
