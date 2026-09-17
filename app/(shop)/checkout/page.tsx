import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
