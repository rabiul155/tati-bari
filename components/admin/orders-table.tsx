import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderRow } from "@/features/admin/orders/queries";
import { formatOrderNumber } from "@/features/orders/order-number";
import { formatDateTime, formatTaka } from "@/lib/format";

export function OrdersTable({ orders, showCustomer = true }: { orders: OrderRow[]; showCustomer?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>অর্ডার</TableHead>
          <TableHead className="hidden md:table-cell">অর্ডার করা হয়েছে</TableHead>
          {showCustomer && <TableHead className="hidden md:table-cell">গ্রাহক</TableHead>}
          <TableHead className="hidden md:table-cell">জেলা</TableHead>
          <TableHead className="text-right">সর্বমোট</TableHead>
          <TableHead>অবস্থা</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const number = formatOrderNumber(order.number);
          return (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/orders/${number}`} className="font-medium underline-offset-4 hover:underline">
                  {number}
                </Link>
                <div className="text-xs text-muted-foreground">{order._count.items}টি পণ্য</div>
                <div className="mt-1 text-xs whitespace-normal text-muted-foreground md:hidden">
                  {showCustomer && (
                    <div className="text-sm text-foreground">
                      {order.customerName} · {order.customerPhone}
                    </div>
                  )}
                  <div>
                    {formatDateTime(order.createdAt)} · {order.deliveryDistrict}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden whitespace-nowrap md:table-cell">{formatDateTime(order.createdAt)}</TableCell>
              {showCustomer && (
                <TableCell className="hidden md:table-cell">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell">{order.deliveryDistrict}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{formatTaka(order.total)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
                {!order.deliveryPaymentVerifiedAt && (
                  <div className="mt-1 text-xs text-destructive">পেমেন্ট যাচাই বাকি</div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
