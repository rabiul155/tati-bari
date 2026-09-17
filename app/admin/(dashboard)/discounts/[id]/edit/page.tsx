import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DiscountForm } from "@/features/admin/discounts/discount-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toDhakaDateTimeInput } from "@/lib/format";

export const metadata: Metadata = { title: "Edit discount" };

export default async function EditDiscountPage({ params }: PageProps<"/admin/discounts/[id]/edit">) {
  await requireAdmin();
  const discount = await db.discount.findUnique({ where: { id: (await params).id } });
  if (!discount) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${discount.name}`}
        description="Changes apply to new orders only."
        back={{ href: "/admin/discounts", label: "Discounts" }}
      />
      <DiscountForm
        discountId={discount.id}
        defaultValues={{
          name: discount.name,
          description: discount.description ?? "",
          amount: String(discount.amount),
          minOrderValue: String(discount.minOrderValue),
          startsAt: toDhakaDateTimeInput(discount.startsAt),
          endsAt: toDhakaDateTimeInput(discount.endsAt),
          isActive: discount.isActive,
        }}
      />
    </div>
  );
}
