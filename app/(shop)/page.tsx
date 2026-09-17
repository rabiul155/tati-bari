import Image from "next/image";
import Link from "next/link";
import { Banknote, HandHeart, MessageCircle, Truck } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-card";
import { Section } from "@/components/shop/section";
import { buttonVariants } from "@/components/ui/button";
import { getHomeProducts, getShopCategories } from "@/features/catalog/queries";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Refresh at least every 5 minutes so sales start and end on time;
// admin edits refresh the page immediately.
export const revalidate = 300;

const TRUST_POINTS = [
  {
    icon: HandHeart,
    title: "Handwoven in Tangail",
    text: "Sourced directly from weavers we know.",
  },
  {
    icon: Banknote,
    title: "Cash on delivery",
    text: "Pay when your saree arrives.",
  },
  {
    icon: Truck,
    title: "Delivery across Bangladesh",
    text: "Sent by trusted courier to your door.",
  },
  {
    icon: MessageCircle,
    title: "We confirm every order",
    text: "We check every order with you before it ships.",
  },
];

export default async function HomePage() {
  const [{ featured, newArrivals, onSale }, categories] = await Promise.all([
    getHomeProducts(),
    getShopCategories(),
  ]);
  const heroImage = (featured[0] ?? newArrivals[0])?.images[0];

  return (
    <>
      <section className="border-b bg-secondary/60">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="flex flex-col items-start gap-5">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">{site.tagline}</p>
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Sarees woven by hand, delivered to your door
            </h1>
            <p className="max-w-prose text-lg text-muted-foreground">{site.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "px-5")}>
                Shop sarees
              </Link>
              <Link href="/about" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-5")}>
                Our story
              </Link>
            </div>
          </div>
          {heroImage && (
            <div className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl bg-muted shadow-sm">
              <Image
                src={heroImage.url}
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 768px) 384px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <Section title="Featured sarees" link={{ href: "/shop", label: "Shop all" }}>
          <ProductGrid products={featured} priorityCount={heroImage ? 0 : 4} />
        </Section>
      )}

      {categories.length > 0 && (
        <Section title="Shop by category">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-lg bg-muted p-4"
                >
                  {category.image && (
                    <Image
                      src={category.image.url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div
                    className={cn(
                      "relative flex flex-col",
                      category.image && "text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]",
                    )}
                  >
                    <span className="font-heading text-lg font-semibold">{category.name}</span>
                    <span className="text-sm opacity-90">
                      {category.productCount} saree{category.productCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  {category.image && (
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/60 to-transparent" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {onSale.length > 0 && (
        <Section title="On sale" description="Limited-time prices.">
          <ProductGrid products={onSale} />
        </Section>
      )}

      {newArrivals.length > 0 && (
        <Section title="New arrivals" link={{ href: "/shop", label: "See all" }}>
          <ProductGrid products={newArrivals} />
        </Section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="sr-only">Why shop with us</h2>
        <ul className="grid gap-6 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
