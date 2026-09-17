import type { Metadata } from "next";
import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Your cart</h1>
      <CartView />
    </div>
  );
}
