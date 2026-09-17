import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

// Placeholder; the real dashboard is built in Phase 8.
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome, {admin.name}</h1>
      <p className="text-muted-foreground">
        Products, orders and customers will appear here.
      </p>
    </div>
  );
}
