import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/features/orders/status";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-sky-100 text-sky-900",
  PREPARING: "bg-indigo-100 text-indigo-900",
  SHIPPED: "bg-violet-100 text-violet-900",
  DELIVERED: "bg-green-100 text-green-900",
  CANCELLED: "bg-muted text-muted-foreground",
  RETURNED: "bg-red-100 text-red-900",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("border-transparent", TONE[status])}>{ORDER_STATUS[status].label}</Badge>;
}
