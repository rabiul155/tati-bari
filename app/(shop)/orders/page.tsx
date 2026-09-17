import type { Metadata } from "next";
import { OrderLookupForm, SavedOrderList } from "@/features/orders/my-orders";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

export default function MyOrdersPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">My orders</h1>
        <SavedOrderList />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold">Find an order</h2>
          <p className="text-muted-foreground">
            Ordered on another device, or the order isn&apos;t listed above? Enter the mobile number
            you ordered with and your order number.
          </p>
        </div>
        <OrderLookupForm />
      </section>
    </div>
  );
}
