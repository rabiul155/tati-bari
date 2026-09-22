import Image from "next/image";
import Link from "next/link";
import { Banknote, HandHeart, MessageCircle, Truck } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-card";
import { Section } from "@/components/shop/section";
import { YouTubeVideo } from "@/components/shop/youtube-video";
import { buttonVariants } from "@/components/ui/button";
import { getHomeProducts, getShopCategories } from "@/features/catalog/queries";
import { getHomeVideos } from "@/features/home-videos/queries";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Refresh at least every 5 minutes so sales start and end on time;
// admin edits refresh the page immediately.
export const revalidate = 300;

const TRUST_POINTS = [
  {
    icon: HandHeart,
    title: "টাঙ্গাইলে হাতে বোনা",
    text: "আমাদের পরিচিত তাঁতিদের কাছ থেকে সরাসরি সংগ্রহ করা।",
  },
  {
    icon: Banknote,
    title: "ক্যাশ অন ডেলিভারি",
    text: "শাড়ি হাতে পেয়ে দাম পরিশোধ করুন।",
  },
  {
    icon: Truck,
    title: "সারা বাংলাদেশে ডেলিভারি",
    text: "বিশ্বস্ত কুরিয়ারের মাধ্যমে আপনার দরজায় পৌঁছে যাবে।",
  },
  {
    icon: MessageCircle,
    title: "প্রতিটি অর্ডার নিশ্চিত করা হয়",
    text: "পাঠানোর আগে আপনার সাথে প্রতিটি অর্ডার যাচাই করে নিই।",
  },
];

export default async function HomePage() {
  const [{ featured, newArrivals, onSale }, categories, [topVideo, bottomVideo]] =
    await Promise.all([getHomeProducts(), getShopCategories(), getHomeVideos()]);
  const heroImage = (featured[0] ?? newArrivals[0])?.images[0];

  return (
    <>
      <section className="border-b bg-secondary/60">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="flex flex-col items-start gap-5">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">{site.tagline}</p>
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              হাতে বোনা শাড়ি, পৌঁছে যাবে আপনার দরজায়
            </h1>
            <p className="max-w-prose text-lg text-muted-foreground">{site.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "px-5")}>
                শাড়ি কিনুন
              </Link>
              <Link href="/about" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-5")}>
                আমাদের গল্প
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

      <YouTubeVideo {...topVideo} />

      {featured.length > 0 && (
        <Section title="বিশেষ শাড়ি" link={{ href: "/shop", label: "সব দেখুন" }}>
          <ProductGrid products={featured} priorityCount={heroImage ? 0 : 4} />
        </Section>
      )}

      {categories.length > 0 && (
        <Section title="ক্যাটাগরি অনুযায়ী কিনুন">
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
                    <span className="text-sm opacity-90">{category.productCount}টি শাড়ি</span>
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
        <Section title="বিশেষ ছাড়ে" description="সীমিত সময়ের জন্য বিশেষ দাম।">
          <ProductGrid products={onSale} />
        </Section>
      )}

      {newArrivals.length > 0 && (
        <Section title="নতুন সংগ্রহ" link={{ href: "/shop", label: "সব দেখুন" }}>
          <ProductGrid products={newArrivals} />
        </Section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="sr-only">কেন আমাদের কাছ থেকে কিনবেন</h2>
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

      <YouTubeVideo {...bottomVideo} />
    </>
  );
}
