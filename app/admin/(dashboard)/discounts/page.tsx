import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteDiscount, setDiscountActive } from "@/features/admin/discounts/actions";
import { getDiscountState, type DiscountState } from "@/features/admin/discounts/schema";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDateTime, formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "Discounts" };

const STATE_LABEL: Record<DiscountState, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  scheduled: { label: "Scheduled", variant: "outline" },
  expired: { label: "Ended", variant: "secondary" },
  off: { label: "Off", variant: "secondary" },
};

export default async function DiscountsPage() {
  await requireAdmin();
  const [discounts, usage] = await Promise.all([
    db.discount.findMany({ orderBy: [{ isActive: "desc" }, { minOrderValue: "asc" }] }),
    db.order.groupBy({
      by: ["discountId"],
      where: { discountId: { not: null }, status: { notIn: ["CANCELLED", "RETURNED"] } },
      _count: { _all: true },
      _sum: { discountAmount: true },
    }),
  ]);
  const usageById = new Map(usage.map((row) => [row.discountId, row]));
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discounts"
        description="A fixed amount off when the order subtotal reaches a minimum. If several apply, the customer gets the largest one."
      >
        <Link href="/admin/discounts/new" className={buttonVariants()}>
          New discount
        </Link>
      </PageHeader>

      {discounts.length === 0 ? (
        <p className="text-muted-foreground">No discounts yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Discount</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Minimum order</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => {
              const state = STATE_LABEL[getDiscountState(discount, now)];
              const used = usageById.get(discount.id);
              return (
                <TableRow key={discount.id}>
                  <TableCell>
                    <Link
                      href={`/admin/discounts/${discount.id}/edit`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {discount.name}
                    </Link>
                    {discount.description && (
                      <div className="max-w-xs truncate text-xs text-muted-foreground">{discount.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatTaka(discount.amount)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatTaka(discount.minOrderValue)}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {discount.startsAt || discount.endsAt ? (
                      <>
                        <div>From {discount.startsAt ? formatDateTime(discount.startsAt) : "now"}</div>
                        <div>Until {discount.endsAt ? formatDateTime(discount.endsAt) : "turned off"}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No end date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={state.variant}>{state.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs whitespace-nowrap">
                    {used ? (
                      <>
                        <div>
                          {used._count._all} order{used._count._all === 1 ? "" : "s"}
                        </div>
                        <div className="text-muted-foreground">{formatTaka(used._sum.discountAmount ?? 0)} given</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not yet</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start justify-end gap-2">
                      <ConfirmActionButton
                        variant="outline"
                        size="sm"
                        action={setDiscountActive.bind(null, discount.id, !discount.isActive)}
                      >
                        {discount.isActive ? "Turn off" : "Turn on"}
                      </ConfirmActionButton>
                      <ConfirmActionButton
                        variant="destructive"
                        size="sm"
                        confirmMessage={`Delete "${discount.name}"? Past orders keep their discount.`}
                        action={deleteDiscount.bind(null, discount.id)}
                      >
                        Delete
                      </ConfirmActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
