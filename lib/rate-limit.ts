// Fixed-window rate limiting stored in Postgres, so it works across
// serverless instances. Concurrent requests may slip a few over the limit,
// which is fine for abuse protection.
import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  const row = await db.rateLimit.upsert({
    where: { key },
    create: { key, count: 1, resetAt },
    update: { count: { increment: 1 } },
  });
  if (row.resetAt <= now) {
    await db.rateLimit.update({ where: { key }, data: { count: 1, resetAt } });
    return true;
  }

  // Occasionally clear out expired counters.
  if (Math.random() < 0.01) {
    await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });
  }
  return row.count <= limit;
}

// Best-effort client IP (Vercel and most proxies set x-forwarded-for).
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}
