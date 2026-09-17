// Seeds baseline data. Safe to run repeatedly (upserts by unique key).
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";

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

type SampleProduct = Omit<
  Prisma.ProductUncheckedCreateInput,
  "categoryId"
> & { categorySlug: string };

// Sample catalog for local development. Images are added once image
// storage is set up (Phase 4).
const products: SampleProduct[] = [
  {
    code: "CT-001",
    slug: "red-white-cotton-tant",
    name: "Red & White Cotton Tant",
    categorySlug: "cotton-tant",
    description: "Classic white body with a bold red border, woven on a handloom.",
    fabric: "Cotton",
    color: "White, Red",
    length: "12 haat (5.5 m)",
    regularPrice: 1450,
    isFeatured: true,
  },
  {
    code: "CT-002",
    slug: "indigo-checked-cotton-tant",
    name: "Indigo Checked Cotton Tant",
    categorySlug: "cotton-tant",
    description: "Soft, breathable cotton with small indigo checks for daily wear.",
    fabric: "Cotton",
    color: "Indigo",
    length: "12 haat (5.5 m)",
    regularPrice: 1350,
    salePrice: 1200,
  },
  {
    code: "HS-001",
    slug: "mustard-half-silk",
    name: "Mustard Half Silk",
    categorySlug: "half-silk",
    description: "Mustard half silk with a zari border and a light sheen.",
    fabric: "Cotton-silk blend",
    color: "Mustard, Gold",
    length: "12.5 haat (5.7 m)",
    hasBlousePiece: true,
    regularPrice: 2500,
    isFeatured: true,
  },
  {
    code: "HS-002",
    slug: "teal-half-silk",
    name: "Teal Half Silk",
    categorySlug: "half-silk",
    description: "Deep teal body with a contrasting magenta border.",
    fabric: "Cotton-silk blend",
    color: "Teal, Magenta",
    length: "12.5 haat (5.7 m)",
    hasBlousePiece: true,
    regularPrice: 2700,
    salePrice: 2400,
  },
  {
    code: "SS-001",
    slug: "maroon-soft-silk",
    name: "Maroon Soft Silk",
    categorySlug: "soft-silk",
    description: "Lightweight maroon soft silk for weddings and festivals.",
    fabric: "Soft silk",
    color: "Maroon",
    length: "12.5 haat (5.7 m)",
    hasBlousePiece: true,
    careInstructions: "Dry clean only.",
    regularPrice: 3000,
  },
  {
    code: "JD-001",
    slug: "off-white-tangail-jamdani",
    name: "Off-White Tangail Jamdani",
    categorySlug: "jamdani",
    description: "Off-white jamdani with hand-woven floral motifs across the body.",
    fabric: "Cotton",
    color: "Off-white, Green",
    length: "12.5 haat (5.7 m)",
    hasBlousePiece: true,
    careInstructions: "Hand wash in cold water or dry clean.",
    regularPrice: 4200,
    availability: "UNAVAILABLE",
  },
];

// Order-level discount, matched by name so re-seeding does not duplicate it.
const sampleDiscount = {
  name: "৳200 off orders over ৳5,000",
  amount: 200,
  minOrderValue: 5000,
};

async function main() {
  for (const [sortOrder, category] of categories.entries()) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder },
      create: { ...category, sortOrder },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const categoryIds = new Map(
    (await db.category.findMany({ select: { id: true, slug: true } })).map(
      (category) => [category.slug, category.id],
    ),
  );
  for (const { categorySlug, ...product } of products) {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${categorySlug}`);
    await db.product.upsert({
      where: { code: product.code },
      update: { ...product, categoryId },
      create: { ...product, categoryId },
    });
  }
  console.log(`Seeded ${products.length} products.`);

  const existingDiscount = await db.discount.findFirst({
    where: { name: sampleDiscount.name },
  });
  if (!existingDiscount) await db.discount.create({ data: sampleDiscount });
  console.log("Seeded 1 discount.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
