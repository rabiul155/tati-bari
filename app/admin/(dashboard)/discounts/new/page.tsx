import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { DiscountForm } from "@/features/admin/discounts/discount-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "নতুন ছাড়" };

export default async function NewDiscountPage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="নতুন ছাড়" back={{ href: "/admin/discounts", label: "ছাড়" }} />
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
