"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderStatus } from "@/features/admin/orders/actions";
import { ALL_STATUSES, NEXT_STATUSES, ORDER_STATUS } from "@/features/orders/status";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

const DANGEROUS: OrderStatus[] = ["CANCELLED", "RETURNED"];

function actionLabel(status: OrderStatus) {
  return status === "CANCELLED" ? "অর্ডার বাতিল করুন" : `${ORDER_STATUS[status].label} হিসেবে চিহ্নিত করুন`;
}

export function StatusPanel({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [note, setNote] = useState("");
  const [other, setOther] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const next = NEXT_STATUSES[status];

  function change(toStatus: OrderStatus) {
    const label = ORDER_STATUS[toStatus].label;
    const stockNote =
      toStatus === "CANCELLED"
        ? " স্টক ট্র্যাক করা পণ্যের স্টক ফিরিয়ে দেওয়া হবে।"
        : status === "CANCELLED"
          ? " স্টক ট্র্যাক করা পণ্যের স্টক আবার কেটে নেওয়া হবে।"
          : "";
    if (
      (DANGEROUS.includes(toStatus) || !next.includes(toStatus)) &&
      !window.confirm(`অবস্থা পরিবর্তন করে "${label}" করবেন?${stockNote}`)
    ) {
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, fromStatus: status, toStatus, note });
      if (result.ok) {
        setNote("");
        setOther("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="status-note">নোট (ঐচ্ছিক)</Label>
        <Textarea
          id="status-note"
          rows={2}
          maxLength={500}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="যেমন: ফোনে নিশ্চিত করা হয়েছে, বাতিলের কারণ, ফেরতের বিবরণ"
        />
        <p className="text-xs text-muted-foreground">ইতিহাসে সংরক্ষিত হবে। গ্রাহকরা নোট দেখতে পান না।</p>
      </div>

      {next.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {next.map((toStatus) => (
            <Button
              key={toStatus}
              type="button"
              variant={DANGEROUS.includes(toStatus) ? "destructive" : "default"}
              disabled={pending}
              onClick={() => change(toStatus)}
            >
              {actionLabel(toStatus)}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 border-t pt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="other-status" className="text-muted-foreground">
            অন্য অবস্থা নির্ধারণ করুন
          </Label>
          <NativeSelect id="other-status" value={other} onChange={(event) => setOther(event.target.value)}>
            <NativeSelectOption value="">নির্বাচন করুন…</NativeSelectOption>
            {ALL_STATUSES.filter((value) => value !== status).map((value) => (
              <NativeSelectOption key={value} value={value}>
                {ORDER_STATUS[value].label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending || !other}
          onClick={() => change(other as OrderStatus)}
        >
          আপডেট
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
