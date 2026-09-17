import Link from "next/link";
import { ShopNav } from "@/components/shop/shop-nav";
import { CartLink } from "@/features/cart/cart-link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl">
          {site.name}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <ShopNav />
          <CartLink />
        </div>
      </div>
    </header>
  );
}
