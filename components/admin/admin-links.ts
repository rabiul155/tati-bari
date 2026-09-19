import {
  LayoutDashboard,
  Package,
  PackageCheck,
  Percent,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminLink = { href: string; label: string; icon: LucideIcon; exact?: boolean };

// Every admin page. The desktop header and the mobile drawer list all of
// them; the mobile bottom bar shows only the first four (see BOTTOM_LINKS).
export const ADMIN_LINKS: AdminLink[] = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "অর্ডার", icon: PackageCheck },
  { href: "/admin/customers", label: "গ্রাহক", icon: Users },
  { href: "/admin/products", label: "পণ্য", icon: Package },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: Tags },
  { href: "/admin/discounts", label: "ছাড়", icon: Percent },
];

export const isAdminLinkActive = (pathname: string, { href, exact }: AdminLink) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
