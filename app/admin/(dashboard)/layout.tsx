import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "@/features/admin/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

// Shell for signed-in admin pages. Layouts don't re-run on client
// navigation, so each page and action must still call requireAdmin().
export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
          <div className="flex items-center gap-x-6">
            <Link href="/admin" className="font-semibold">
              অ্যাডমিন
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" aria-hidden />
              </span>
              <span className="max-md:sr-only">{admin.name}</span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="xs">
                সাইন আউট
              </Button>
            </form>
            <AdminDrawer adminName={admin.name} logoutAction={logout} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:py-8">
        <AdminBreadcrumb />
        {children}
      </main>
      <AdminBottomNav />
    </div>
  );
}
