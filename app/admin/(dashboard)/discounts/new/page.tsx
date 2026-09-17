import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { DiscountForm } from "@/features/admin/discounts/discount-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New discount" };

export default async function NewDiscountPage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New discount" back={{ href: "/admin/discounts", label: "Discounts" }} />
      <DiscountForm
        discountId={null}
        defaultValues={{
          name: "",
          description: "",
          amount: "",
          minOrderValue: "",
          startsAt: "",
          endsAt: "",
          isActive: true,
        }}
      />
    </div>
  );
}
