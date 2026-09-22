"use client";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { CopyButton } from "@/components/admin/copy-button";
import { Badge } from "@/components/ui/badge";
import { setDeliveryPaymentVerified } from "@/features/admin/orders/actions";
import { formatDateTime, formatTaka } from "@/lib/format";
import { site } from "@/lib/site";

export function DeliveryPaymentPanel({
  orderId,
  trxId,
  amount,
  verifiedAt,
}: {
  orderId: string;
  trxId: string;
  amount: number;
  verifiedAt: Date | null;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span>
          {formatTaka(amount)} → {site.deliveryPayment.number}
        </span>
        {verifiedAt ? <Badge>পাওয়া গেছে</Badge> : <Badge variant="destructive">যাচাই বাকি</Badge>}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground">ট্রানজেকশন আইডি</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-base font-semibold">{trxId}</span>
          <CopyButton value={trxId} label="কপি" />
        </div>
      </div>
      {verifiedAt ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-muted-foreground">যাচাই করা হয়েছে {formatDateTime(verifiedAt)}</p>
          <ConfirmActionButton
            variant="ghost"
            size="sm"
            confirmMessage="পেমেন্ট যাচাই বাতিল করবেন?"
            action={() => setDeliveryPaymentVerified(orderId, false)}
          >
            যাচাই বাতিল করুন
          </ConfirmActionButton>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-muted-foreground">
            {site.deliveryPayment.wallets} অ্যাপে এই আইডি ও {formatTaka(amount)} মিলেছে কিনা দেখুন।
          </p>
          <ConfirmActionButton
            confirmMessage={`${trxId} দিয়ে ${formatTaka(amount)} পেয়েছেন?`}
            action={() => setDeliveryPaymentVerified(orderId, true)}
          >
            পেমেন্ট পেয়েছি
          </ConfirmActionButton>
        </div>
      )}
    </div>
  );
}
