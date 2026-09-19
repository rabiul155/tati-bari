import Link from "next/link";
import Image from "next/image";
import { ContactLinks } from "@/components/shop/contact-links";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Image src="/logo.png" alt={site.name} width={960} height={698} className="h-auto w-44" />
          <p className="text-muted-foreground">{site.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium">শপ</p>
          <ul className="flex flex-col gap-1 text-muted-foreground">
            <li>
              <Link href="/shop" className="underline-offset-4 hover:underline">
                সব শাড়ি
              </Link>
            </li>
            <li>
              <Link href="/orders" className="underline-offset-4 hover:underline">
                আমার অর্ডার
              </Link>
            </li>
            <li>
              <Link href="/about" className="underline-offset-4 hover:underline">
                আমাদের সম্পর্কে
              </Link>
            </li>
            <li>
              <Link href="/about#contact" className="underline-offset-4 hover:underline">
                যোগাযোগ
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium">যোগাযোগ করুন</p>
          <ContactLinks className="flex flex-col gap-1 text-muted-foreground" />
          <p className="text-muted-foreground">{site.address}</p>
        </div>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {site.name}। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।
      </p>
    </footer>
  );
}
