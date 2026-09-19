import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckoutView } from "@/features/checkout/checkout-view";

export const metadata: Metadata = {
  title: "চেকআউট",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <Breadcrumb
        items={[{ label: "হোম", href: "/" }, { label: "কার্ট", href: "/cart" }, { label: "চেকআউট" }]}
      />
      <h1 className="font-heading text-3xl font-semibold tracking-tight">চেকআউট</h1>
      <CheckoutView />
    </div>
  );
}
