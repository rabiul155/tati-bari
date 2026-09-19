"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", exact: true },
  { href: "/admin/orders", label: "অর্ডার" },
  { href: "/admin/customers", label: "গ্রাহক" },
  { href: "/admin/products", label: "পণ্য" },
  { href: "/admin/categories", label: "ক্যাটাগরি" },
  { href: "/admin/discounts", label: "ছাড়" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="অ্যাডমিন মেনু" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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
