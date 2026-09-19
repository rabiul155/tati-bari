"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Shown from md up; on mobile the bottom navigation is used instead.
const LINKS = [
  { href: "/shop", label: "শপ" },
  { href: "/orders", label: "আমার অর্ডার" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
];

export function ShopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="প্রধান মেনু" className="flex items-center gap-5 text-sm">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-foreground",
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
