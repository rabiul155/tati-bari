import Link from "next/link";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";
import { buttonVariants } from "@/components/ui/button";

// Rendered outside the shop layout, so it adds the header and footer
// itself: visitors from old shared links should still find their way.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">পেজটি পাওয়া যায়নি</h1>
        <p className="max-w-md text-muted-foreground">
          এই পেজটি নেই, অথবা শাড়িটি আর পাওয়া যাচ্ছে না।
        </p>
        <Link href="/shop" className={buttonVariants({ size: "lg", className: "px-5" })}>
          শাড়ি দেখুন
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
