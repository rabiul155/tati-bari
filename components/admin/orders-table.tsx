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
          <TableHead>Order</TableHead>
          <TableHead>Placed</TableHead>
          {showCustomer && <TableHead>Customer</TableHead>}
          <TableHead>District</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
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
                <div className="text-xs text-muted-foreground">
                  {order._count.items} item{order._count.items === 1 ? "" : "s"}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDateTime(order.createdAt)}</TableCell>
              {showCustomer && (
                <TableCell>
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
              )}
              <TableCell>{order.deliveryDistrict}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{formatTaka(order.total)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
