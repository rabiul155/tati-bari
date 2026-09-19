"use client";

import { useState, useTransition } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderShipping, type ShippingValues } from "@/features/admin/orders/actions";

export function ShippingForm({ orderId, initial }: { orderId: string; initial: ShippingValues }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const set = (key: keyof ShippingValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setMessage(undefined);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await updateOrderShipping(orderId, values);
          if (result.ok) {
            setSaved(values);
            setMessage({ ok: true, text: "সংরক্ষিত হয়েছে।" });
          } else {
            setMessage({ ok: false, text: result.error ?? "সংরক্ষণ করা যায়নি।" });
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="courierName" label="কুরিয়ার" hint="যেমন: Pathao, Steadfast, RedX">
          <Input id="courierName" maxLength={80} value={values.courierName} onChange={set("courierName")} />
        </FormField>
        <FormField id="trackingNumber" label="ট্র্যাকিং / কনসাইনমেন্ট নম্বর" hint="গ্রাহককে দেখানো হবে।">
          <Input id="trackingNumber" maxLength={80} value={values.trackingNumber} onChange={set("trackingNumber")} />
        </FormField>
      </div>
      <FormField id="adminNote" label="অভ্যন্তরীণ নোট" hint="শুধু অ্যাডমিনে দেখা যাবে।">
        <Textarea id="adminNote" rows={3} maxLength={2000} value={values.adminNote} onChange={set("adminNote")} />
      </FormField>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" disabled={pending || !dirty}>
          {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
        </Button>
        {message && (
          <span role="status" className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
