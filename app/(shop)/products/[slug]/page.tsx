import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Price } from "@/components/shop/price";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-card";
import { Section } from "@/components/shop/section";
import { AddToCart } from "@/features/cart/add-to-cart";
import { getUnitPrice } from "@/features/catalog/pricing";
import { getProductBySlug, getRelatedProducts } from "@/features/catalog/queries";
import { formatTaka } from "@/lib/format";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, toOgImageUrl } from "@/lib/og-image";
import { site, siteUrl } from "@/lib/site";

// Pages are rendered on first visit, then cached. They refresh at least
// every 5 minutes (sale windows) and immediately after admin edits.
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

const getProduct = cache(getProductBySlug);

function summary(product: NonNullable<Awaited<ReturnType<typeof getProduct>>>) {
  const { finalUnitPrice } = getUnitPrice(product);
  const firstLine = product.description?.split("\n")[0]?.trim();
  return (
    firstLine ||
    [product.fabric, product.color, "টাঙ্গাইলের হ্যান্ডলুম শাড়ি"].filter(Boolean).join(" · ")
  ).slice(0, 150) + ` দাম ${formatTaka(finalUnitPrice)}। ক্যাশ অন ডেলিভারি।`;
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "শাড়ি পাওয়া যায়নি" };

  const description = summary(product);
  const image = product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${product.slug}`,
      title: product.name,
      description,
      images: image
        ? [{ url: toOgImageUrl(image.url), width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.slug);
  const available = product.availability === "AVAILABLE";
  const { finalUnitPrice } = getUnitPrice(product);

  const details = [
    ["পণ্য কোড", product.code],
    ["ফেব্রিক", product.fabric],
    ["রঙ", product.color],
    ["দৈর্ঘ্য", product.length],
    ["ব্লাউজ পিস", product.hasBlousePiece ? "আছে" : "নেই"],
    ["যত্ন", product.careInstructions],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.code,
    description: summary(product),
    image: product.images.map((image) => new URL(image.url, siteUrl()).toString()),
    category: product.category.name,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/products/${product.slug}`,
      priceCurrency: "BDT",
      price: finalUnitPrice,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <Breadcrumb
          items={[
            { label: "হোম", href: "/" },
            { label: "শপ", href: "/shop" },
            { label: product.category.name, href: `/shop?category=${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground">কোড: {product.code}</p>
            </div>

            <div className="flex flex-col gap-1">
              <Price product={product} size="lg" />
              <p className={available ? "text-sm text-green-700" : "text-sm text-destructive"}>
                {available ? "স্টকে আছে" : "স্টকে নেই"}
              </p>
            </div>

            <AddToCart productId={product.id} available={available} />

            <p className="text-sm text-muted-foreground">
              সারা বাংলাদেশে ক্যাশ অন ডেলিভারি। ডেলিভারি চার্জ চেকআউটে দেখানো হবে।
            </p>

            {product.description && (
              <section className="flex flex-col gap-2">
                <h2 className="font-medium">বিবরণ</h2>
                <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground">
                  {product.description
                    .split(/\n{2,}/)
                    .map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <h2 className="font-medium">শাড়ির বিবরণ</h2>
              <dl className="divide-y rounded-lg border text-sm">
                {details.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-3 gap-2 px-3 py-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section
          title="আপনার পছন্দ হতে পারে"
          link={{ href: `/shop?category=${product.category.slug}`, label: `আরও ${product.category.name}` }}
        >
          <ProductGrid products={related} />
        </Section>
      )}
    </>
  );
}
