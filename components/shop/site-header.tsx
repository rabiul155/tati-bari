import Link from "next/link";
import Image from "next/image";
import { ShopNav } from "@/components/shop/shop-nav";
import { CartLink } from "@/features/cart/cart-link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl md:h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/header-logo.png"
            alt={site.name}
            width={1774}
            height={887}
            preload
            className="h-10 w-auto md:h-16"
          />
        </Link>
        <div className="flex items-center gap-4">
          {/* Below md the bottom navigation replaces the text links. */}
          <div className="hidden md:block">
            <ShopNav />
          </div>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
