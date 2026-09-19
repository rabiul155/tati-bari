import type { Metadata } from "next";
import { OrderLookupForm, SavedOrderList } from "@/features/orders/my-orders";

export const metadata: Metadata = {
  title: "আমার অর্ডার",
  robots: { index: false },
};

export default function MyOrdersPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">আমার অর্ডার</h1>
        <SavedOrderList />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold">অর্ডার খুঁজুন</h2>
          <p className="text-muted-foreground">
            অন্য ডিভাইসে অর্ডার করেছেন, বা অর্ডারটি উপরে দেখাচ্ছে না? আপনি যে মোবাইল নম্বর দিয়ে অর্ডার
            করেছেন সেটি দিন।
          </p>
        </div>
        <OrderLookupForm />
      </section>
    </div>
  );
}
