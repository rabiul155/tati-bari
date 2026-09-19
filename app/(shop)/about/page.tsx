import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks, getContactLinks } from "@/components/shop/contact-links";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে ও যোগাযোগ",
  description: `${site.name}-এর পেছনের গল্প এবং আমাদের সাথে যোগাযোগের উপায়।`,
  alternates: { canonical: "/about" },
};

const STEPS = [
  "আপনার পছন্দের শাড়ি বেছে নিন এবং ফোন নম্বর ও ঠিকানা দিয়ে অর্ডার করুন।",
  "আমরা শাড়িটি যাচাই করে আপনার সাথে অর্ডার নিশ্চিত করি।",
  "আপনার শাড়ি প্যাক করে কুরিয়ারে দেওয়া হয়।",
  "শাড়ি হাতে পেয়ে ক্যাশে দাম পরিশোধ করুন।",
];

// Placeholder copy; replace with the real brand story.
export default function AboutPage() {
  const hasContact = getContactLinks().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">{site.name} সম্পর্কে</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          টাঙ্গাইল বহু প্রজন্ম ধরে হ্যান্ডলুম শাড়ির জন্য বিখ্যাত। প্রতিটি শাড়ি সুতা থেকে হাতে বোনা হয়,
          তাই কোনো দুটি শাড়ি হুবহু একরকম নয়।
        </p>
        <p className="leading-relaxed text-muted-foreground">
          আমরা টাঙ্গাইলের তাঁতিদের সাথে সরাসরি কাজ করি, তাই মধ্যস্বত্বভোগী ছাড়াই আপনি ন্যায্য দামে
          আসল শাড়ি পান। পাঠানোর আগে প্রতিটি শাড়ি যাচাই করা হয়।
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-semibold">যেভাবে অর্ডার করবেন</h2>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold">যোগাযোগ করুন</h2>
        <p className="text-muted-foreground">
          শাড়ি, অর্ডার বা ডেলিভারি নিয়ে প্রশ্ন আছে? আমরা সাহায্য করতে পেরে খুশি হব।
        </p>
        {hasContact ? (
          <ContactLinks className="flex flex-col gap-2 font-medium" />
        ) : (
          <p className="text-sm text-muted-foreground">যোগাযোগের তথ্য শীঘ্রই যুক্ত হবে।</p>
        )}
        <p className="text-sm text-muted-foreground">{site.address}</p>
      </section>

      <Link href="/shop" className={buttonVariants({ size: "lg", className: "w-fit px-5" })}>
        শাড়ি দেখুন
      </Link>
    </div>
  );
}
