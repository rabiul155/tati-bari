"use client";

import { usePathname } from "next/navigation";
import { House, Info, PackageCheck, ShoppingBag, Store } from "lucide-react";
import { BottomNav, BottomNavLink } from "@/components/bottom-nav";
import { useCartCount } from "@/features/cart/cart-store";

// Product pages count as part of the shop tab.
const isShopPath = (pathname: string) =>
  pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/products/");

export function ShopBottomNav() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const startsWith = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <BottomNav label="নিচের মেনু">
      <BottomNavLink href="/" icon={House} label="হোম" active={pathname === "/"} />
      <BottomNavLink href="/shop" icon={Store} label="শপ" active={isShopPath(pathname)} />
      <BottomNavLink
        href="/cart"
        icon={ShoppingBag}
        label="কার্ট"
        ariaLabel={cartCount ? `কার্ট, ${cartCount}টি পণ্য` : "কার্ট"}
        badge={cartCount || undefined}
        active={startsWith("/cart") || startsWith("/checkout")}
      />
      <BottomNavLink href="/orders" icon={PackageCheck} label="অর্ডার" active={startsWith("/orders")} />
      <BottomNavLink href="/about" icon={Info} label="পরিচিতি" active={startsWith("/about")} />
    </BottomNav>
  );
}
