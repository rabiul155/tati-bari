"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb, type Crumb } from "@/components/breadcrumb";

const SECTIONS: Record<string, string> = {
  orders: "অর্ডার",
  customers: "গ্রাহক",
  products: "পণ্য",
  categories: "ক্যাটাগরি",
  discounts: "ছাড়",
  "home-videos": "হোম পেজ ভিডিও",
};

const ACTIONS: Record<string, string> = { new: "নতুন", edit: "সম্পাদনা" };

function readable(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Builds the trail from the URL. Records are addressed by id, so the id
// segment is skipped before "edit" (there is no page at /products/<id>);
// order numbers are readable and shown as-is.
function crumbsFor(pathname: string): Crumb[] {
  const [, , section, id, action] = pathname.split("/");
  const crumbs: Crumb[] = [{ label: "ড্যাশবোর্ড", href: "/admin" }];
  if (!section || !Object.hasOwn(SECTIONS, section)) return crumbs;

  crumbs.push({ label: SECTIONS[section], href: `/admin/${section}` });
  if (id && Object.hasOwn(ACTIONS, id)) {
    crumbs.push({ label: ACTIONS[id] });
  } else if (id && action) {
    crumbs.push({ label: ACTIONS[action] ?? "বিবরণ" });
  } else if (id) {
    crumbs.push({ label: section === "orders" ? readable(id) : "বিবরণ" });
  }
  return crumbs;
}

export function AdminBreadcrumb() {
  const crumbs = crumbsFor(usePathname());
  // Nothing to navigate back to on the dashboard itself.
  if (crumbs.length === 1) return null;
  return <Breadcrumb items={crumbs} className="mb-4" />;
}
