"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Ellipsis, ExternalLink, LayoutDashboard, Package, PackageCheck, Percent, Tags, Users } from "lucide-react";
import { BottomNav, BottomNavButton, BottomNavLink } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";

// The bottom bar holds at most 5 items. Everything else lives behind
// "আরও"; the desktop header (admin-nav.tsx) shows all links at once.
const MAIN_LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "অর্ডার", icon: PackageCheck },
  { href: "/admin/products", label: "পণ্য", icon: Package },
  { href: "/admin/customers", label: "গ্রাহক", icon: Users },
];

const MORE_LINKS = [
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: Tags },
  { href: "/admin/discounts", label: "ছাড়", icon: Percent },
];

const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function AdminBottomNav() {
  const pathname = usePathname();
  // The menu is open only for the page it was opened on, so navigating
  // anywhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const moreActive = MORE_LINKS.some(({ href }) => isActive(pathname, href));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="মেনু বন্ধ করুন"
            tabIndex={-1}
            className="fixed inset-0 z-40 bg-foreground/20"
            onClick={() => setOpenOn(null)}
          />
          <div
            className="fixed inset-x-3 bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-40 mx-auto max-w-md rounded-2xl border bg-background p-2 shadow-lg"
          >
            {[...MORE_LINKS, { href: "/", label: "শপ দেখুন", icon: ExternalLink }].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                target={href === "/" ? "_blank" : undefined}
                aria-current={isActive(pathname, href) && href !== "/" ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-muted",
                  isActive(pathname, href) && href !== "/" && "bg-primary/10 font-medium text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <BottomNav label="অ্যাডমিন নিচের মেনু">
        {MAIN_LINKS.map(({ href, label, icon, exact }) => (
          <BottomNavLink key={href} href={href} icon={icon} label={label} active={isActive(pathname, href, exact)} />
        ))}
        <BottomNavButton
          icon={Ellipsis}
          label="আরও"
          active={moreActive}
          expanded={open}
          onClick={() => setOpenOn(open ? null : pathname)}
        />
      </BottomNav>
    </>
  );
}
