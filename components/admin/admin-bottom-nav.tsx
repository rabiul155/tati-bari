"use client";

import { usePathname } from "next/navigation";
import { ADMIN_LINKS, isAdminLinkActive } from "@/components/admin/admin-links";
import { BottomNav, BottomNavLink } from "@/components/bottom-nav";

// Mobile tab bar with every admin page. The drawer (admin-drawer.tsx) has
// the same links plus "শপ দেখুন" and sign out.
export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <BottomNav label="অ্যাডমিন নিচের মেনু">
      {ADMIN_LINKS.map((link) => (
        <BottomNavLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          active={isAdminLinkActive(pathname, link)}
        />
      ))}
    </BottomNav>
  );
}
