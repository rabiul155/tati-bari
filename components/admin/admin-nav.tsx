"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ADMIN_LINKS, isAdminLinkActive } from "@/components/admin/admin-links";
import { cn } from "@/lib/utils";

// Desktop only; on mobile the bottom navigation and the drawer are used.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="অ্যাডমিন মেনু" className="hidden flex-wrap gap-x-4 gap-y-1 text-sm md:flex">
      {ADMIN_LINKS.map((link) => {
        const { href, label } = link;
        const active = isAdminLinkActive(pathname, link);
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
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ExternalLink className="size-4" aria-hidden />
        শপ দেখুন
      </Link>
    </nav>
  );
}
