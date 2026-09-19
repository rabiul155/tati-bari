"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { ADMIN_LINKS, isAdminLinkActive } from "@/components/admin/admin-links";
import { cn } from "@/lib/utils";

const rowClass =
  "flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

// Left-hand navigation drawer with every admin page. Mobile only: from md
// up the header already lists all links.
export function AdminDrawer({
  adminName,
  logoutAction,
}: {
  adminName: string;
  logoutAction: () => void | Promise<void>;
}) {
  const pathname = usePathname();
  // Open only for the page it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpenOn(next ? pathname : null)}>
      <Dialog.Trigger
        aria-label="নেভিগেশন মেনু খুলুন"
        className="inline-flex size-10 items-center justify-center rounded-lg transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/30 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 md:hidden" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-xl outline-none transition-transform duration-200 ease-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full md:hidden">
          <div className="flex h-14 items-center justify-between gap-2 border-b px-4">
            <div className="min-w-0">
              <Dialog.Title className="font-semibold">অ্যাডমিন</Dialog.Title>
              <p className="truncate text-xs text-muted-foreground">{adminName}</p>
            </div>
            <Dialog.Close
              aria-label="মেনু বন্ধ করুন"
              className="inline-flex size-10 items-center justify-center rounded-lg transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <nav aria-label="অ্যাডমিন মেনু" className="flex-1 overflow-y-auto p-2">
            <ul className="flex flex-col gap-1">
              {ADMIN_LINKS.map((link) => {
                const active = isAdminLinkActive(pathname, link);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(rowClass, active && "bg-primary/10 font-medium text-primary")}
                    >
                      <Icon className="size-5" aria-hidden />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-1 border-t p-2">
            <Link href="/" target="_blank" className={rowClass}>
              <ExternalLink className="size-5" aria-hidden />
              শপ দেখুন
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={cn(rowClass, "text-destructive hover:bg-destructive/10")}>
                <LogOut className="size-5" aria-hidden />
                সাইন আউট
              </button>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
