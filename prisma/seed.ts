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
    name: "কটন তাঁত",
    description: "প্রতিদিনের ব্যবহারের হস্তচালিত তাঁতের টাঙ্গাইল কটন শাড়ি।",
  },
  {
    slug: "half-silk",
    name: "হাফ সিল্ক",
    description: "নরম আভাযুক্ত সুতি-সিল্ক মিশ্রণের শাড়ি।",
  },
  {
    slug: "soft-silk",
    name: "সফট সিল্ক",
    description: "বিশেষ অনুষ্ঠানের জন্য হালকা সিল্কের শাড়ি।",
  },
  {
    slug: "jamdani",
    name: "জামদানি",
    description: "হাতে বোনা নকশাযুক্ত টাঙ্গাইল জামদানি।",
  },
];

type SampleProduct = Omit<
  Prisma.ProductUncheckedCreateInput,
  "categoryId"
> & { categorySlug: string; imageUrls: string[] };

// Photos are hotlinked from Wikimedia Commons (freely licensed) so the
// sample shop has pictures without any storage setup. Slugs and codes stay
// in English; everything shown in the UI is Bengali.
const commons = (path: string) => {
  const file = path.slice(path.lastIndexOf("/") + 1);
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/960px-${file}`;
};

const products: SampleProduct[] = [
  {
    code: "CT-001",
    slug: "red-white-cotton-tant",
    name: "লাল-সাদা কটন তাঁত",
    categorySlug: "cotton-tant",
    description: "সাদা জমিনের ওপর গাঢ় লাল পাড়, হস্তচালিত তাঁতে বোনা ক্লাসিক শাড়ি।",
    fabric: "সুতি",
    color: "সাদা, লাল",
    length: "১২ হাত (৫.৫ মি.)",
    regularPrice: 1450,
    isFeatured: true,
    imageUrls: [
      commons("b/b5/Border_of_Tangail_sari%2Cfrom_the_1970s.jpg"),
      commons("1/18/BD_Tangail_4.JPG"),
    ],
  },
  {
    code: "CT-002",
    slug: "indigo-checked-cotton-tant",
    name: "নীল চেক কটন তাঁত",
    categorySlug: "cotton-tant",
    description: "প্রতিদিনের জন্য নরম ও আরামদায়ক সুতি শাড়ি, গায়ে ছোট নীল চেক।",
    fabric: "সুতি",
    color: "নীল",
    length: "১২ হাত (৫.৫ মি.)",
    regularPrice: 1350,
    salePrice: 1200,
    imageUrls: [
      commons("1/18/Tant_Sarees_-_Phulia_2016-11-12_1871.JPG"),
      commons("0/07/Cotton-mulmul-saree-with-blouse-5-1.jpg"),
    ],
  },
  {
    code: "HS-001",
    slug: "mustard-half-silk",
    name: "সরষে রঙের হাফ সিল্ক",
    categorySlug: "half-silk",
    description: "জরির পাড় ও হালকা আভাযুক্ত সরষে রঙের হাফ সিল্ক শাড়ি।",
    fabric: "সুতি-সিল্ক মিশ্রণ",
    color: "সরষে, সোনালি",
    length: "১২.৫ হাত (৫.৭ মি.)",
    hasBlousePiece: true,
    regularPrice: 2500,
    isFeatured: true,
    imageUrls: [commons("1/1d/Mulmul_cotton_Saree.jpg")],
  },
  {
    code: "HS-002",
    slug: "teal-half-silk",
    name: "টিল রঙের হাফ সিল্ক",
    categorySlug: "half-silk",
    description: "গাঢ় টিল জমিনের সঙ্গে ম্যাজেন্টা রঙের বিপরীত পাড়।",
    fabric: "সুতি-সিল্ক মিশ্রণ",
    color: "টিল, ম্যাজেন্টা",
    length: "১২.৫ হাত (৫.৭ মি.)",
    hasBlousePiece: true,
    regularPrice: 2700,
    salePrice: 2400,
    imageUrls: [commons("6/63/BD_Tangail_3.JPG")],
  },
  {
    code: "SS-001",
    slug: "maroon-soft-silk",
    name: "মেরুন সফট সিল্ক",
    categorySlug: "soft-silk",
    description: "বিয়ে ও উৎসবের জন্য হালকা মেরুন সফট সিল্ক শাড়ি।",
    fabric: "সফট সিল্ক",
    color: "মেরুন",
    length: "১২.৫ হাত (৫.৭ মি.)",
    hasBlousePiece: true,
    careInstructions: "শুধুমাত্র ড্রাই ক্লিন করুন।",
    regularPrice: 3000,
    imageUrls: [commons("0/06/Traditional_Assam_silk_saree.jpg")],
  },
  {
    code: "JD-001",
    slug: "off-white-tangail-jamdani",
    name: "অফ-হোয়াইট টাঙ্গাইল জামদানি",
    categorySlug: "jamdani",
    description: "পুরো শাড়িতে হাতে বোনা ফুলের নকশাযুক্ত অফ-হোয়াইট জামদানি।",
    fabric: "সুতি",
    color: "অফ-হোয়াইট, সবুজ",
    length: "১২.৫ হাত (৫.৭ মি.)",
    hasBlousePiece: true,
    careInstructions: "ঠান্ডা পানিতে হাতে ধুয়ে নিন অথবা ড্রাই ক্লিন করুন।",
    regularPrice: 4200,
    availability: "UNAVAILABLE",
    imageUrls: [
      commons("a/ae/Jamdani_Saree_Sale_Sonargaon.jpg"),
      commons("b/b0/Jamdani_Saree_2014.jpg"),
    ],
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
  for (const { categorySlug, imageUrls, ...product } of products) {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${categorySlug}`);
    const { id: productId } = await db.product.upsert({
      where: { code: product.code },
      update: { ...product, categoryId },
      create: { ...product, categoryId },
      select: { id: true },
    });
    // Replace only the seeded photos; anything uploaded via admin is kept.
    await db.productImage.deleteMany({
      where: { productId, url: { startsWith: "https://upload.wikimedia.org/" } },
    });
    await db.productImage.createMany({
      data: imageUrls.map((url, sortOrder) => ({
        productId,
        url,
        alt: product.name,
        sortOrder,
      })),
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
