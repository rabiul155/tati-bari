"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// "About" is hidden on small screens to keep the header on one line; it is
// also in the footer.
const LINKS = [
  { href: "/shop", label: "শপ" },
  { href: "/orders", label: "আমার অর্ডার" },
  { href: "/about", label: "আমাদের সম্পর্কে", className: "hidden sm:inline" },
];

export function ShopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="প্রধান মেনু" className="flex items-center gap-3 text-sm sm:gap-5">
      {LINKS.map(({ href, label, className }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-foreground",
              className,
              active ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
