// Seeds baseline data. Safe to run repeatedly (upserts by unique key).
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categories = [
  {
    slug: "cotton-tant",
    name: "Cotton Tant",
    description: "Everyday handloom cotton Tangail sarees.",
  },
  {
    slug: "half-silk",
    name: "Half Silk",
    description: "Cotton-silk blend with a soft sheen.",
  },
  {
    slug: "soft-silk",
    name: "Soft Silk",
    description: "Lightweight silk sarees for occasions.",
  },
  {
    slug: "jamdani",
    name: "Jamdani",
    description: "Tangail Jamdani with woven motifs.",
  },
];

async function main() {
  for (const [sortOrder, category] of categories.entries()) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder },
      create: { ...category, sortOrder },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
