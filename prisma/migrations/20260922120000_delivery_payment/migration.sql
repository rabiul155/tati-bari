-- Orders now require the delivery charge to be paid in advance, with a
-- transaction ID on every order. The orders placed so far were test orders
-- without one, so they are removed first.

-- Give back the stock the test orders reserved (as cancelling would).
UPDATE "Product" p
SET "stockQuantity" = p."stockQuantity" + reserved.quantity,
    "availability" = 'AVAILABLE'
FROM (
    SELECT i."productId", SUM(i."quantity") AS quantity
    FROM "OrderItem" i
    JOIN "Order" o ON o."id" = i."orderId"
    WHERE o."status" NOT IN ('CANCELLED', 'RETURNED')
    GROUP BY i."productId"
) reserved
WHERE p."id" = reserved."productId" AND p."stockQuantity" IS NOT NULL;

-- Items and status history are removed with their orders (ON DELETE CASCADE).
DELETE FROM "Order";

-- Customers exist only through orders; addresses cascade.
DELETE FROM "Customer";

-- Checkout rate-limit counters from the test orders.
DELETE FROM "RateLimit" WHERE "key" LIKE 'checkout:%';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryPaymentTrxId" TEXT NOT NULL,
ADD COLUMN     "deliveryPaymentVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_deliveryPaymentTrxId_key" ON "Order"("deliveryPaymentTrxId");
