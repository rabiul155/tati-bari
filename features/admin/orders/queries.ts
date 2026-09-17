// Admin reads for orders, customers and the dashboard. Callers must have
// checked requireAdmin() first.
import "server-only";
import { db } from "@/lib/db";
import { startOfDhakaDay, startOfDhakaMonth } from "@/lib/format";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { normalizeBdPhone } from "@/lib/phone";
import { parseOrderNumber } from "@/features/orders/order-number";
import { NON_SALE_STATUSES } from "@/features/orders/status";

export const ORDERS_PER_PAGE = 25;

const orderRowSelect = {
  id: true,
  number: true,
  status: true,
  createdAt: true,
  customerName: true,
  customerPhone: true,
  deliveryDistrict: true,
  total: true,
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

export type OrderRow = Prisma.OrderGetPayload<{ select: typeof orderRowSelect }>;

// Matches an order number ("TS-000012", "12"), a phone number (full or
// partial digits) or a customer name.
function orderSearchWhere(query: string): Prisma.OrderWhereInput {
  const or: Prisma.OrderWhereInput[] = [
    { customerName: { contains: query, mode: "insensitive" } },
  ];
  const number = parseOrderNumber(query);
  if (number !== null) or.push({ number });
  const phone = normalizeBdPhone(query);
  const digits = query.replace(/\D/g, "");
  if (phone) or.push({ customerPhone: phone });
  else if (digits.length >= 4) or.push({ customerPhone: { contains: digits } });
  return { OR: or };
}

export async function listOrders(filters: { query: string; status?: OrderStatus; page: number }) {
  const where: Prisma.OrderWhereInput = {
    ...(filters.query && orderSearchWhere(filters.query)),
    ...(filters.status && { status: filters.status }),
  };
  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * ORDERS_PER_PAGE,
      take: ORDERS_PER_PAGE,
      select: orderRowSelect,
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const statusCounts = Object.fromEntries(counts.map((row) => [row.status, row._count._all])) as Partial<
    Record<OrderStatus, number>
  >;
  return { orders, total, statusCounts, pageCount: Math.max(1, Math.ceil(total / ORDERS_PER_PAGE)) };
}

export async function getAdminOrder(number: number) {
  return db.order.findUnique({
    where: { number },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: { product: { select: { id: true, slug: true, archivedAt: true, stockQuantity: true } } },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
      customer: { select: { id: true, name: true, _count: { select: { orders: true } } } },
    },
  });
}

async function salesSince(from: Date) {
  const result = await db.order.aggregate({
    where: { createdAt: { gte: from }, status: { notIn: NON_SALE_STATUSES } },
    _sum: { total: true },
    _count: { _all: true },
  });
  return { total: result._sum.total ?? 0, orders: result._count._all };
}

export async function getDashboardStats(now: Date = new Date()) {
  const sevenDaysAgo = startOfDhakaDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  const [statusCounts, today, last7Days, thisMonth, recentOrders, productCounts] = await Promise.all([
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    salesSince(startOfDhakaDay(now)),
    salesSince(sevenDaysAgo),
    salesSince(startOfDhakaMonth(now)),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: orderRowSelect }),
    db.product.groupBy({
      by: ["availability"],
      where: { archivedAt: null },
      _count: { _all: true },
    }),
  ]);
  const byStatus = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all])) as Partial<
    Record<OrderStatus, number>
  >;
  const products = Object.fromEntries(productCounts.map((row) => [row.availability, row._count._all]));
  return {
    byStatus,
    sales: { today, last7Days, thisMonth },
    recentOrders,
    activeProducts: (products.AVAILABLE ?? 0) + (products.UNAVAILABLE ?? 0),
    unavailableProducts: products.UNAVAILABLE ?? 0,
  };
}

export const CUSTOMERS_PER_PAGE = 25;

export async function listCustomers(filters: { query: string; page: number }) {
  const q = filters.query;
  const phone = normalizeBdPhone(q);
  const digits = q.replace(/\D/g, "");
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          ...(phone ? [{ phone }] : digits.length >= 4 ? [{ phone: { contains: digits } }] : []),
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (filters.page - 1) * CUSTOMERS_PER_PAGE,
      take: CUSTOMERS_PER_PAGE,
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        addresses: { where: { isDefault: true }, take: 1, select: { district: true, area: true } },
        _count: { select: { orders: true } },
      },
    }),
    db.customer.count({ where }),
  ]);

  // Spending and last order per customer on this page.
  const stats = await db.order.groupBy({
    by: ["customerId"],
    where: { customerId: { in: customers.map((customer) => customer.id) } },
    _max: { createdAt: true },
  });
  const spent = await db.order.groupBy({
    by: ["customerId"],
    where: {
      customerId: { in: customers.map((customer) => customer.id) },
      status: { notIn: NON_SALE_STATUSES },
    },
    _sum: { total: true },
  });
  const lastOrderAt = new Map(stats.map((row) => [row.customerId, row._max.createdAt]));
  const totalSpent = new Map(spent.map((row) => [row.customerId, row._sum.total ?? 0]));

  return {
    customers: customers.map((customer) => ({
      ...customer,
      lastOrderAt: lastOrderAt.get(customer.id) ?? null,
      totalSpent: totalSpent.get(customer.id) ?? 0,
    })),
    total,
    pageCount: Math.max(1, Math.ceil(total / CUSTOMERS_PER_PAGE)),
  };
}

export async function getAdminCustomer(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
      orders: { orderBy: { createdAt: "desc" }, select: orderRowSelect },
    },
  });
  if (!customer) return null;
  const totalSpent = customer.orders
    .filter((order) => !NON_SALE_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);
  return { ...customer, totalSpent };
}
