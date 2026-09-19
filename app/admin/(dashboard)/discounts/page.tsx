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

export const metadata: Metadata = { title: "ছাড়" };

const STATE_LABEL: Record<DiscountState, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "চালু", variant: "default" },
  scheduled: { label: "নির্ধারিত", variant: "outline" },
  expired: { label: "শেষ হয়েছে", variant: "secondary" },
  off: { label: "বন্ধ", variant: "secondary" },
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
        title="ছাড়"
        description="অর্ডারের সাবটোটাল নির্দিষ্ট সর্বনিম্ন পরিমাণে পৌঁছালে নির্দিষ্ট টাকা ছাড়। একাধিক প্রযোজ্য হলে গ্রাহক সবচেয়ে বড় ছাড়টি পাবেন।"
      >
        <Link href="/admin/discounts/new" className={buttonVariants()}>
          নতুন ছাড়
        </Link>
      </PageHeader>

      {discounts.length === 0 ? (
        <p className="text-muted-foreground">এখনও কোনো ছাড় নেই।</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ছাড়</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead className="text-right">সর্বনিম্ন অর্ডার</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead>অবস্থা</TableHead>
              <TableHead className="text-right">ব্যবহৃত</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
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
                        <div>শুরু: {discount.startsAt ? formatDateTime(discount.startsAt) : "এখনই"}</div>
                        <div>শেষ: {discount.endsAt ? formatDateTime(discount.endsAt) : "বন্ধ না করা পর্যন্ত"}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">শেষের তারিখ নেই</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={state.variant}>{state.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs whitespace-nowrap">
                    {used ? (
                      <>
                        <div>{used._count._all}টি অর্ডার</div>
                        <div className="text-muted-foreground">{formatTaka(used._sum.discountAmount ?? 0)} ছাড় দেওয়া হয়েছে</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">এখনও নয়</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start justify-end gap-2">
                      <ConfirmActionButton
                        variant="outline"
                        size="sm"
                        action={setDiscountActive.bind(null, discount.id, !discount.isActive)}
                      >
                        {discount.isActive ? "বন্ধ করুন" : "চালু করুন"}
                      </ConfirmActionButton>
                      <ConfirmActionButton
                        variant="destructive"
                        size="sm"
                        confirmMessage={`"${discount.name}" মুছে ফেলবেন? আগের অর্ডারগুলোতে ছাড় অপরিবর্তিত থাকবে।`}
                        action={deleteDiscount.bind(null, discount.id)}
                      >
                        মুছুন
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
