import Link from "next/link";
import { ShopNav } from "@/components/shop/shop-nav";
import { CartLink } from "@/features/cart/cart-link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl md:h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl">
          {site.name}
        </Link>
        {/* Below md the bottom navigation replaces these. */}
        <div className="hidden items-center gap-4 md:flex">
          <ShopNav />
          <CartLink />
        </div>
      </div>
    </header>
  );
}
