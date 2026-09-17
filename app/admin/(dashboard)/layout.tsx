import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/admin/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

// Shell for signed-in admin pages. Layouts don't re-run on client
// navigation, so each page and action must still call requireAdmin().
export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-semibold">
            Admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{admin.name}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
