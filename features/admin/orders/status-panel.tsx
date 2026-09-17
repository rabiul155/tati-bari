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
  return status === "CANCELLED" ? "Cancel order" : `Mark as ${ORDER_STATUS[status].label.toLowerCase()}`;
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
        ? " Stock for tracked products will be given back."
        : status === "CANCELLED"
          ? " Stock for tracked products will be taken again."
          : "";
    if (
      (DANGEROUS.includes(toStatus) || !next.includes(toStatus)) &&
      !window.confirm(`Change the status to ${label}?${stockNote}`)
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
        <Label htmlFor="status-note">Note (optional)</Label>
        <Textarea
          id="status-note"
          rows={2}
          maxLength={500}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Confirmed by phone, cancellation reason, return details"
        />
        <p className="text-xs text-muted-foreground">Saved in the history. Customers don&apos;t see notes.</p>
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
            Set another status
          </Label>
          <NativeSelect id="other-status" value={other} onChange={(event) => setOther(event.target.value)}>
            <NativeSelectOption value="">Choose…</NativeSelectOption>
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
          Update
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
