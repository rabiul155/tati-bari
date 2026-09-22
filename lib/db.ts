import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in development to avoid
// exhausting database connections. After `prisma generate` the client
// class is reloaded, so a client built from the old class (which lacks any
// new models) is replaced instead of reused.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
  prismaClass?: typeof PrismaClient;
};

const cached =
  globalForPrisma.prismaClass === PrismaClient ? globalForPrisma.prisma : undefined;
if (!cached) void globalForPrisma.prisma?.$disconnect();

export const db = cached ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaClass = PrismaClient;
}
